jest.mock('../../config/prisma', () => ({
  question: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  submission: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock('../../utils/question', () => ({
  updateStreak: jest.fn().mockResolvedValue({ newStreak: 1 }),
  checkAndAwardBadges: jest.fn().mockResolvedValue([]),
}));

const prisma = require('../../config/prisma');
const { QuestionService } = require('../../services/question.service');
const { updateStreak, checkAndAwardBadges } = require('../../utils/question');

describe('QuestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayQuestion', () => {
    it('throws when no question scheduled', async () => {
      prisma.question.findFirst.mockResolvedValue(null);
      await expect(QuestionService.getTodayQuestion('u1')).rejects.toThrow('No question scheduled for today');
    });

    it('returns question with hasAttempted=false when no submission', async () => {
      const q = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01T00:00:00.000Z'),
        category: 'Math',
        difficulty: 'EASY',
        questionText: '2+2?',
        questionType: 'MCQ',
        options: ['1', '2', '3', '4'],
        points: 10,
        isActive: true,
      };
      prisma.question.findFirst.mockResolvedValue(q);
      prisma.submission.findUnique.mockResolvedValue(null);
      const result = await QuestionService.getTodayQuestion('u1');
      expect(result.hasAttempted).toBe(false);
      expect(result.submission).toBeNull();
    });

    it('returns question with existing submission details', async () => {
      const q = {
        id: 'q1',
        scheduledDate: new Date('2025-01-01T00:00:00.000Z'),
        category: 'Math',
        difficulty: 'EASY',
        questionText: '2+2?',
        questionType: 'MCQ',
        options: ['1', '2', '3', '4'],
        points: 10,
        isActive: true,
        correctAnswer: '4',
        explanation: 'Basic arithmetic',
      };
      const sub = {
        id: 's1',
        submittedAnswer: '4',
        isCorrect: true,
        pointsEarned: 10,
        submittedAt: new Date('2025-01-01T10:00:00.000Z'),
      };
      prisma.question.findFirst.mockResolvedValue(q);
      prisma.submission.findUnique.mockResolvedValue(sub);
      const result = await QuestionService.getTodayQuestion('u1');
      expect(result.hasAttempted).toBe(true);
      expect(result.submission.id).toBe('s1');
      expect(result.submission.correctAnswer).toBe('4');
    });
  });

  describe('submitAnswer', () => {
    it('throws when question not found', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      await expect(QuestionService.submitAnswer('u1', 'q1', { answer: 'x' }))
        .rejects.toThrow('Question not found');
    });

    it('throws when question inactive', async () => {
      prisma.question.findUnique.mockResolvedValue({ id: 'q1', isActive: false });
      await expect(QuestionService.submitAnswer('u1', 'q1', { answer: 'x' }))
        .rejects.toThrow('Question is not active');
    });

    it('throws when already submitted today', async () => {
      prisma.question.findUnique.mockResolvedValue({ id: 'q1', isActive: true, questionType: 'MCQ', correctAnswer: '4', points: 10 });
      prisma.submission.findUnique.mockResolvedValue({ id: 's1' });
      await expect(QuestionService.submitAnswer('u1', 'q1', { answer: '4' }))
        .rejects.toThrow("You have already attempted today's question");
    });

    it('creates submission and updates stats for correct MCQ answer', async () => {
      const question = {
        id: 'q1',
        isActive: true,
        questionType: 'MCQ',
        correctAnswer: '4',
        points: 10,
        explanation: 'Because 2+2=4',
      };
      prisma.question.findUnique.mockResolvedValue(question);
      prisma.submission.findUnique.mockResolvedValue(null);

      const finalUser = {
        totalQuestionsAttempted: 1,
        totalCorrectAnswers: 1,
        totalPoints: 10,
      };

      // Single transaction mock providing three findUnique calls:
      // 1) before update (with badges), 2) after streak update (with badges), 3) final stats
      prisma.$transaction.mockImplementation(async (cb) => {
        const userFindUniqueMock = jest.fn()
          .mockResolvedValueOnce({ id: 'u1', userBadges: [] }) 
          .mockResolvedValueOnce({ id: 'u1', userBadges: [] }) 
          .mockResolvedValueOnce(finalUser); 
        const tx = {
          submission: { create: jest.fn().mockResolvedValue({ id: 's2', isCorrect: true, pointsEarned: 10 }) },
          question: { update: jest.fn().mockResolvedValue({}) },
          user: {
            findUnique: userFindUniqueMock,
            update: jest.fn().mockResolvedValue({ id: 'u1', userBadges: [] }),
          },
        };
        return cb(tx);
      });

      const result = await QuestionService.submitAnswer('u1', 'q1', { answer: '4' });
      expect(updateStreak).toHaveBeenCalled();
      expect(checkAndAwardBadges).toHaveBeenCalled();
      expect(result.submission.isCorrect).toBe(true);
      expect(result.userStats.totalPoints).toBe(10);
    });
  });

  describe('getHistory', () => {
    it('returns paginated and formatted history with accuracy', async () => {
      const submissions = [
        {
          id: 's1',
          questionId: 'q1',
          question: { id: 'q1', questionText: 'Q1', category: 'Math' },
          submittedAnswer: '4',
          isCorrect: true,
          pointsEarned: 10,
          attemptDate: new Date('2025-01-01T00:00:00.000Z'),
          submittedAt: new Date('2025-01-01T00:10:00.000Z'),
        },
      ];
      prisma.submission.findMany.mockResolvedValue(submissions);
      prisma.submission.count
        .mockResolvedValueOnce(1) 
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1); 

      const result = await QuestionService.getHistory('u1', { page: 1, limit: 10 });
      expect(result.pagination.totalItems).toBe(1);
      expect(result.stats.accuracy).toBe(100.0);
      expect(result.submissions[0]).toMatchObject({
        id: 's1',
        questionId: 'q1',
        category: 'Math',
      });
    });
  });
});


