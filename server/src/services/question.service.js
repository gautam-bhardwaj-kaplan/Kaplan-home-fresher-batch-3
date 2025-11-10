const prisma = require('../config/prisma');
const { updateStreak, checkAndAwardBadges } = require('../utils/question');

const getTodayQuestion = async (userId) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const question = await prisma.question.findFirst({
    where: {
      scheduledDate: {
        gte: today,
        lt: tomorrow
      },
      isActive: true
    }
  });

  if (!question) {
    throw new Error('No question scheduled for today');
  }

  const submission = await prisma.submission.findUnique({
    where: {
      userId_attemptDate: {
        userId: userId,
        attemptDate: today
      }
    }
  });

  const questionResponse = {
    id: question.id,
    date: question.scheduledDate.toISOString().split('T')[0],
    category: question.category,
    difficulty: question.difficulty.toLowerCase(),
    questionText: question.questionText,
    questionType: question.questionType,
    options: question.options,
    points: question.points,
  };

  if (submission) {
    return {
      question: questionResponse,
      hasAttempted: true,
      submission: {
        id: submission.id,
        submittedAnswer: submission.submittedAnswer,
        isCorrect: submission.isCorrect,
        pointsEarned: submission.pointsEarned,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        submittedAt: submission.submittedAt
      }
    };
  }

  return {
    question: questionResponse,
    hasAttempted: false,
    submission: null
  };
};

const submitAnswer = async (userId, questionId, answerData) => {
  const { answer } = answerData;

  const question = await prisma.question.findUnique({
    where: { id: questionId }
  });

  if (!question) {
    throw new Error('Question not found');
  }

  if (!question.isActive) {
    throw new Error('Question is not active');
  }

  const today = new Date(); 
  today.setUTCHours(0, 0, 0, 0);

  const existingSubmission = await prisma.submission.findUnique({
    where: {
      userId_attemptDate: {
        userId: userId,
        attemptDate: today
      }
    }
  });

  if (existingSubmission) {
    throw new Error('You have already attempted today\'s question');
  }

  let isCorrect = false;
  
  if (question.questionType === 'MCQ') {
    isCorrect = answer.trim() === question.correctAnswer.trim();
  } else if (question.questionType === 'SHORT_ANSWER') {
    const normalizedAnswer = question.caseSensitive 
      ? answer.trim() 
      : answer.trim().toLowerCase();
    
    const acceptedAnswers = question.acceptedAnswers.map(a => 
      question.caseSensitive ? a.trim() : a.trim().toLowerCase()
    );
    
    isCorrect = acceptedAnswers.includes(normalizedAnswer);
  }

  const pointsEarned = isCorrect ? question.points : 0;

  const result = await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.create({
      data: {
        userId: userId,
        questionId: questionId,
        submittedAnswer: answer,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
        attemptDate: today
      }
    });

    await tx.question.update({
      where: { id: questionId },
      data: {
        totalAttempts: { increment: 1 },
        correctAttempts: isCorrect ? { increment: 1 } : undefined
      }
    });

    // Get user with current stats  
    await tx.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });

    // Update user statistics (without streak first)
    let updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        totalQuestionsAttempted: { increment: 1 },
        totalCorrectAnswers: isCorrect ? { increment: 1 } : undefined,
        totalPoints: { increment: pointsEarned },
        lastAttemptDate: today
      },
      include: {
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });

    // Calculate and update streak
    const streakUpdate = await updateStreak(tx, updatedUser, today);

    updatedUser = await tx.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });

    // Check for new badges
    const newBadges = await checkAndAwardBadges(tx, updatedUser, streakUpdate);

    // Get final user stats after all updates
    const finalUser = await tx.user.findUnique({
      where: { id: userId }
    });

    const accuracy = finalUser.totalQuestionsAttempted > 0
      ? (finalUser.totalCorrectAnswers / finalUser.totalQuestionsAttempted) * 100
      : 0;

    return {
      submission,
      streakUpdate,
      newBadges,
      userStats: {
        totalPoints: finalUser.totalPoints,
        accuracy: Number(accuracy.toFixed(1))
      }
    };
  });

  return {
    submission: {
      id: result.submission.id,
      isCorrect: result.submission.isCorrect,
      pointsEarned: result.submission.pointsEarned,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    },
    streakUpdate: result.streakUpdate,
    newBadges: result.newBadges,
    userStats: result.userStats
  };
};

const getHistory = async (userId, queryParams) => {
  const { page, limit, category, dateFrom, dateTo } = queryParams;
  const skip = (page - 1) * limit;

  const where = {
    userId: userId
  };

  if (category) {
    where.question = {
      category: category
    };
  }

  if (dateFrom || dateTo) {
    where.attemptDate = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      where.attemptDate.gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      where.attemptDate.lte = toDate;
    }
  }

  const [submissions, totalItems] = await Promise.all([
    prisma.submission.findMany({
      where: where,
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            category: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      skip: skip,
      take: limit
    }),
    prisma.submission.count({ where: where })
  ]);

  const statsWhere = { ...where };

  const [totalAttempts, correctAnswers] = await Promise.all([
    prisma.submission.count({ where: statsWhere }),
    prisma.submission.count({
      where: {
        ...statsWhere,
        isCorrect: true
      }
    })
  ]);

  const accuracy = totalAttempts > 0
    ? (correctAnswers / totalAttempts) * 100
    : 0;

  const formattedSubmissions = submissions.map(sub => ({
    id: sub.id,
    questionId: sub.questionId,
    questionText: sub.question.questionText,
    category: sub.question.category,
    submittedAnswer: sub.submittedAnswer,
    isCorrect: sub.isCorrect,
    pointsEarned: sub.pointsEarned,
    attemptDate: sub.attemptDate.toISOString().split('T')[0],
  }));

  const totalPages = Math.ceil(totalItems / limit);

  return {
    submissions: formattedSubmissions,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit
    },
    stats: {
      totalAttempts: totalAttempts,
      correctAnswers: correctAnswers,
      accuracy: Number(accuracy.toFixed(1))
    }
  };
};

exports.QuestionService = {
  getTodayQuestion,
  submitAnswer,
  getHistory
};

