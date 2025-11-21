jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('../../../utils/userStatus', () => ({
  calculateUserStatus: jest.fn((totalAttempts) => {
    return totalAttempts === 0 ? 'INACTIVE' : 'ACTIVE';
  }),
}));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AdminUserService = require('../../../services/admin/user.service');

describe('AdminUserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('returns all users with selected fields and computed status', async () => {
      const users = [
        {
          id: 'u1',
          name: 'User 1',
          email: 'user1@test.com',
          role: 'LEARNER',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          currentStreak: 0,
          longestStreak: 0,
          totalQuestionsAttempted: 5,
          totalCorrectAnswers: 3,
          totalPoints: 50,
        },
        {
          id: 'u2',
          name: 'User 2',
          email: 'user2@test.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-02'),
          currentStreak: 2,
          longestStreak: 5,
          totalQuestionsAttempted: 0,
          totalCorrectAnswers: 0,
          totalPoints: 0,
        },
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await AdminUserService.getAllUsers();

      expect(result).toEqual([
        { ...users[0], status: 'ACTIVE' },
        { ...users[1], status: 'INACTIVE' },
      ]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          currentStreak: true,
          longestStreak: true,
          totalQuestionsAttempted: true,
          totalCorrectAnswers: true,
          totalPoints: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when no users exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await AdminUserService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserRole', () => {
    it('throws when role is invalid', async () => {
      await expect(AdminUserService.updateUserRole('u1', 'INVALID')).rejects.toThrow(
        'Invalid role value. Must be ADMIN or LEARNER.'
      );
    });

    it('throws when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(AdminUserService.updateUserRole('u1', 'ADMIN')).rejects.toThrow(
        'User not found'
      );
    });

    it('updates user role to ADMIN', async () => {
      const existingUser = {
        id: 'u1',
        name: 'User 1',
        email: 'user1@test.com',
        role: 'LEARNER',
      };
      const updatedUser = {
        ...existingUser,
        role: 'ADMIN',
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await AdminUserService.updateUserRole('u1', 'ADMIN');

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'ADMIN' },
      });
    });

    it('updates user role to LEARNER', async () => {
      const existingUser = {
        id: 'u1',
        name: 'User 1',
        email: 'user1@test.com',
        role: 'ADMIN',
      };
      const updatedUser = {
        ...existingUser,
        role: 'LEARNER',
      };
      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await AdminUserService.updateUserRole('u1', 'LEARNER');

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'LEARNER' },
      });
    });
  });
});

