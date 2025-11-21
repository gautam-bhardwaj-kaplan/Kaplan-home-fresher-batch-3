jest.mock('@prisma/client', () => {
  const mockPrisma = {
    question: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AdminQuestionService = require('../../../services/admin/question.service');

describe('AdminQuestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('throws when question already exists for scheduled date', async () => {
      prisma.question.findUnique.mockResolvedValue({ id: 'q1' });
      const questionData = {
        scheduledDate: '2025-01-01',
        category: 'MATH',
        difficulty: 'EASY',
        questionText: 'Test question',
        correctAnswer: '4',
        points: 10,
      };
      await expect(
        AdminQuestionService.createQuestion(questionData, 'u1')
      ).rejects.toThrow('Question already exists for date: 2025-01-01');
    });

    it('creates question with default values', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      const createdQuestion = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01'),
        category: 'MATH',
        difficulty: 'EASY',
        questionText: 'Test question',
        questionType: 'MCQ',
        correctAnswer: '4',
        acceptedAnswers: ['4'],
        caseSensitive: false,
        points: 10,
        options: [],
        createdById: 'u1',
      };
      prisma.question.create.mockResolvedValue(createdQuestion);

      const questionData = {
        scheduledDate: '2025-01-01',
        category: 'MATH',
        difficulty: 'EASY',
        questionText: 'Test question',
        correctAnswer: '4',
      };

      const result = await AdminQuestionService.createQuestion(questionData, 'u1');
      expect(prisma.question.create).toHaveBeenCalled();
      expect(result).toEqual(createdQuestion);
    });

    it('creates question with all provided fields', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      const createdQuestion = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01'),
        category: 'ENGLISH',
        difficulty: 'HARD',
        questionText: 'What is the capital?',
        questionType: 'SHORT_ANSWER',
        correctAnswer: 'Paris',
        acceptedAnswers: ['Paris', 'paris'],
        caseSensitive: true,
        explanation: 'Capital of France',
        points: 20,
        options: ['Paris', 'London', 'Berlin'],
        createdById: 'u1',
      };
      prisma.question.create.mockResolvedValue(createdQuestion);

      const questionData = {
        scheduledDate: '2025-01-01',
        category: 'ENGLISH',
        difficulty: 'HARD',
        questionText: 'What is the capital?',
        questionType: 'SHORT_ANSWER',
        correctAnswer: 'Paris',
        acceptedAnswers: ['Paris', 'paris'],
        caseSensitive: true,
        explanation: 'Capital of France',
        points: 20,
        options: ['Paris', 'London', 'Berlin'],
      };

      const result = await AdminQuestionService.createQuestion(questionData, 'u1');
      expect(result).toEqual(createdQuestion);
    });
  });

  describe('listQuestions', () => {
    it('returns paginated questions with default filters', async () => {
      const questions = [
        {
          id: 'q1',
          scheduledDate: new Date('2025-01-01'),
          category: 'MATH',
          difficulty: 'EASY',
          questionText: 'Test 1',
          totalAttempts: 10,
          correctAttempts: 8,
          isActive: true,
        },
      ];
      prisma.question.findMany.mockResolvedValue(questions);
      prisma.question.count.mockResolvedValue(1);

      const result = await AdminQuestionService.listQuestions({});

      expect(result.questions).toEqual(questions);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.itemsPerPage).toBe(10);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('filters by category', async () => {
      prisma.question.findMany.mockResolvedValue([]);
      prisma.question.count.mockResolvedValue(0);

      await AdminQuestionService.listQuestions({ category: 'MATH' });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'MATH' }),
        })
      );
    });

    it('filters by difficulty', async () => {
      prisma.question.findMany.mockResolvedValue([]);
      prisma.question.count.mockResolvedValue(0);

      await AdminQuestionService.listQuestions({ difficulty: 'EASY' });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ difficulty: 'EASY' }),
        })
      );
    });

    it('filters by status active', async () => {
      prisma.question.findMany.mockResolvedValue([]);
      prisma.question.count.mockResolvedValue(0);

      await AdminQuestionService.listQuestions({ status: 'active' });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('filters by date range', async () => {
      prisma.question.findMany.mockResolvedValue([]);
      prisma.question.count.mockResolvedValue(0);

      await AdminQuestionService.listQuestions({
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('handles pagination correctly', async () => {
      prisma.question.findMany.mockResolvedValue([]);
      prisma.question.count.mockResolvedValue(50);

      const result = await AdminQuestionService.listQuestions({ page: 2, limit: 10 });

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('getQuestionById', () => {
    it('throws when question not found', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      await expect(AdminQuestionService.getQuestionById('q1')).rejects.toThrow(
        'Question not found'
      );
    });

    it('returns question with analytics for MCQ', async () => {
      const question = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01'),
        category: 'MATH',
        difficulty: 'EASY',
        questionText: 'Test question',
        questionType: 'MCQ',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        submissions: [
          { submittedAnswer: '4', isCorrect: true },
          { submittedAnswer: '3', isCorrect: false },
          { submittedAnswer: '4', isCorrect: true },
        ],
      };
      prisma.question.findUnique.mockResolvedValue(question);

      const result = await AdminQuestionService.getQuestionById('q1');

      expect(result.analytics.totalAttempts).toBe(3);
      expect(result.analytics.correctAttempts).toBe(2);
      expect(result.analytics.accuracy).toBe(66.66666666666666);
      expect(result.analytics.optionDistribution).toHaveLength(4);
      expect(result.analytics.optionDistribution[0]).toEqual({ option: '1', count: 0 });
      expect(result.analytics.optionDistribution[3]).toEqual({ option: '4', count: 2 });
    });

    it('returns question with analytics for SHORT_ANSWER', async () => {
      const question = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01'),
        category: 'ENGLISH',
        difficulty: 'EASY',
        questionText: 'Capital?',
        questionType: 'SHORT_ANSWER',
        options: [],
        correctAnswer: 'Paris',
        submissions: [
          { submittedAnswer: 'Paris', isCorrect: true },
          { submittedAnswer: 'London', isCorrect: false },
        ],
      };
      prisma.question.findUnique.mockResolvedValue(question);

      const result = await AdminQuestionService.getQuestionById('q1');

      expect(result.analytics.totalAttempts).toBe(2);
      expect(result.analytics.correctAttempts).toBe(1);
      expect(result.analytics.accuracy).toBe(50);
      expect(result.analytics.optionDistribution).toHaveLength(0);
    });

    it('handles question with no submissions', async () => {
      const question = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01'),
        category: 'MATH',
        difficulty: 'EASY',
        questionText: 'Test question',
        questionType: 'MCQ',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        submissions: [],
      };
      prisma.question.findUnique.mockResolvedValue(question);

      const result = await AdminQuestionService.getQuestionById('q1');

      expect(result.analytics.totalAttempts).toBe(0);
      expect(result.analytics.correctAttempts).toBe(0);
      expect(result.analytics.accuracy).toBe(0);
    });
  });

  describe('updateQuestion', () => {
    it('throws when question not found', async () => {
      const error = new Error('Record not found');
      error.code = 'P2025';
      prisma.question.update.mockRejectedValue(error);

      await expect(
        AdminQuestionService.updateQuestion('q1', { questionText: 'Updated' })
      ).rejects.toThrow('Question not found');
    });

    it('updates question successfully', async () => {
      const updatedQuestion = {
        id: 'q1',
        questionText: 'Updated question',
        category: 'MATH',
        difficulty: 'MEDIUM',
      };
      prisma.question.update.mockResolvedValue(updatedQuestion);

      const result = await AdminQuestionService.updateQuestion('q1', {
        questionText: 'Updated question',
        category: 'MATH',
        difficulty: 'MEDIUM',
      });

      expect(result).toEqual(updatedQuestion);
    });

    it('filters out unsafe fields from update data', async () => {
      const updatedQuestion = {
        id: 'q1',
        questionText: 'Updated question',
      };
      prisma.question.update.mockResolvedValue(updatedQuestion);

      await AdminQuestionService.updateQuestion('q1', {
        id: 'q2',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'u2',
        questionText: 'Updated question',
      });

      expect(prisma.question.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            id: expect.anything(),
            createdAt: expect.anything(),
            updatedAt: expect.anything(),
            createdById: expect.anything(),
          }),
        })
      );
    });
  });

  describe('deleteQuestion', () => {
    it('throws when question not found', async () => {
      const error = new Error('Record not found');
      error.code = 'P2025';
      prisma.question.update.mockRejectedValue(error);

      await expect(AdminQuestionService.deleteQuestion('q1')).rejects.toThrow(
        'Question not found'
      );
    });

    it('deactivates question successfully', async () => {
      const deactivatedQuestion = {
        id: 'q1',
        isActive: false,
      };
      prisma.question.update.mockResolvedValue(deactivatedQuestion);

      await AdminQuestionService.deleteQuestion('q1');

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { isActive: false },
      });
    });
  });
});

