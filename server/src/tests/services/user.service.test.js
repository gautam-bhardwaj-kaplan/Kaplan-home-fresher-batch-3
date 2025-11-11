const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  submission: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const prisma = require('../../config/prisma');
const { UserService } = require('../../services/user.service');

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('throws when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        UserService.createUser({ email: 'a@b.com', password: 'x', name: 'A' })
      ).rejects.toThrow('Email already registered');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    });

    it('creates user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpw');
      const createdUser = {
        id: 'u2',
        email: 'a@b.com',
        name: 'A',
        role: 'LEARNER',
        currentStreak: 0,
        profilePicture: null,
      };
      prisma.user.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue('token123');

      const result = await UserService.createUser({ email: 'a@b.com', password: 'x', name: 'A' });

      expect(bcrypt.hash).toHaveBeenCalledWith('x', 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'u2', role: 'LEARNER' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(result).toEqual({ user: createdUser, token: 'token123' });
    });
  });

  describe('loginUser', () => {
    it('throws when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(UserService.loginUser({ email: 'x@y.com', password: 'p' }))
        .rejects.toThrow('User not found');
    });

    it('throws when password invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'h' });
      bcrypt.compare.mockResolvedValue(false);
      await expect(UserService.loginUser({ email: 'x@y.com', password: 'p' }))
        .rejects.toThrow('Invalid password');
    });

    it('returns user data and token on success', async () => {
      const dbUser = {
        id: 'u1',
        name: 'A',
        email: 'x@y.com',
        role: 'LEARNER',
        currentStreak: 3,
        profilePicture: 'pic.png',
        passwordHash: 'h',
      };
      prisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('tkn');

      const result = await UserService.loginUser({ email: 'x@y.com', password: 'p' });

      expect(result).toEqual({
        user: {
          id: 'u1',
          name: 'A',
          email: 'x@y.com',
          role: 'LEARNER',
          currentStreak: 3,
          profilePicture: 'pic.png',
        },
        token: 'tkn',
      });
    });
  });

  describe('getUserProfile', () => {
    it('throws if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(UserService.getUserProfile('u1')).rejects.toThrow('User not found');
    });

    it('returns mapped profile with accuracy and badges', async () => {
      const user = {
        id: 'u1',
        name: 'A',
        email: 'a@b.com',
        role: 'LEARNER',
        currentStreak: 2,
        longestStreak: 5,
        totalQuestionsAttempted: 10,
        totalCorrectAnswers: 7,
        totalPoints: 100,
        emailNotifications: true,
        notificationTime: '08:00',
        userBadges: [
          { badge: { badgeId: 'b1', name: 'Starter' }, earnedAt: new Date('2024-01-01') },
        ],
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await UserService.getUserProfile('u1');
      expect(result.accuracy).toBe(70.0);
      expect(result.badges).toEqual([
        { badgeId: 'b1', name: 'Starter', earnedAt: new Date('2024-01-01') },
      ]);
    });
  });

  describe('updateUserProfile', () => {
    it('returns mapped updated profile', async () => {
      const updated = {
        id: 'u1',
        name: 'New',
        email: 'a@b.com',
        role: 'LEARNER',
        currentStreak: 1,
        longestStreak: 3,
        totalQuestionsAttempted: 4,
        totalCorrectAnswers: 3,
        totalPoints: 50,
        emailNotifications: false,
        notificationTime: '09:00',
        userBadges: [
          { badge: { badgeId: 'b1', name: 'Starter' }, earnedAt: new Date('2024-01-01') },
        ],
      };
      prisma.user.update.mockResolvedValue(updated);
      const result = await UserService.updateUserProfile('u1', {
        name: 'New',
        emailNotifications: false,
        notificationTime: '09:00',
      });
      expect(result).toMatchObject({
        id: 'u1',
        name: 'New',
        email: 'a@b.com',
        role: 'LEARNER',
        emailNotifications: false,
        notificationTime: '09:00',
      });
    });
  });
});


