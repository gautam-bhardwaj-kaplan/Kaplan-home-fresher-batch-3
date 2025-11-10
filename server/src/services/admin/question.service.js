const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createQuestion = async (questionData, userId) => {
  const existingQuestion = await prisma.question.findUnique({
    where: {
      scheduledDate: new Date(questionData.scheduledDate)
    },
  });

  if (existingQuestion) {
    const error = new Error(`Question already exists for date: ${questionData.scheduledDate}`);
    throw error;
  }

  const {
    scheduledDate,
    category,
    difficulty,
    questionText,
    questionType = 'MCQ',
    correctAnswer,
    acceptedAnswers = [correctAnswer],
    caseSensitive = false,
    explanation,
    points = 10,
    options = [],
  } = questionData;

  return prisma.question.create({
    data: {
      scheduledDate: new Date(scheduledDate),
      category,
      difficulty,
      questionText,
      questionType,
      options,
      correctAnswer,
      acceptedAnswers,
      caseSensitive,
      explanation,
      points,
    //  createdById: userId,
    },
  });
};

const listQuestions = async (filters) => {
  const {
    page = 1,
    limit = 20,
    category,
    dateFrom,
    dateTo,
    difficulty,
    status,
  } = filters;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (status) where.isActive = status === 'active';
  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
    if (dateTo) where.scheduledDate.lte = new Date(dateTo);
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { scheduledDate: 'desc' },
      select: {
        id: true,
        scheduledDate: true,
        category: true,
        difficulty: true,
        questionText: true,
        totalAttempts: true,
        correctAttempts: true,
        isActive: true,
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

const getQuestionById = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      submissions: {
        select: {
          submittedAnswer: true,
          isCorrect: true,
        },
      },
    },
  });

  if (!question) {
    const error = new Error('Question not found');
    throw error;
  }

  const totalAttempts = question.submissions.length;
  const correctAttempts = question.submissions.filter(s => s.isCorrect).length;
  const accuracy = totalAttempts ? (correctAttempts / totalAttempts) * 100 : 0;

  let optionDistribution = [];
  if (question.questionType === 'MCQ' && question.options.length > 0) {
    optionDistribution = question.options.map(option => ({
      option,
      count: question.submissions.filter(s => s.submittedAnswer === option).length,
    }));
  }

  const { submissions, ...questionData } = question;

  return {
    question: questionData,
    analytics: {
      totalAttempts,
      correctAttempts,
      accuracy,
      optionDistribution,
    },
  };
};

const updateQuestion = async (questionId, updateData) => {
  const { id, createdAt, updatedAt, createdById, ...safeUpdateData } = updateData;

  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: safeUpdateData,
    });
    return question;
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Question not found');
      notFoundError.code = 'NOT_FOUND';
      throw notFoundError;
    }
    throw error;
  }
};

const deleteQuestion = async (questionId) => {
  try {
    await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Question not found');
      notFoundError.code = 'NOT_FOUND';
      throw notFoundError;
    }
    throw error;
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};