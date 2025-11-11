jest.mock('../../config/prisma', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
}));

const prisma = require('../../config/prisma');
const { LeaderboardService } = require('../../services/leaderboard.service');

describe('LeaderboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStreakLeaderboard', () => {
    it('returns leaderboard with streak ordering', async () => {
      const leaderboardUsers = [
        {
          id: 'u1',
          name: 'User 1',
          profilePicture: 'pic1.jpg',
          currentStreak: 10,
          totalPoints: 100,
          userBadges: [{ badgeId: 'b1' }, { badgeId: 'b2' }],
        },
        {
          id: 'u2',
          name: 'User 2',
          profilePicture: 'pic2.jpg',
          currentStreak: 5,
          totalPoints: 80,
          userBadges: [{ badgeId: 'b1' }],
        },
      ];

      prisma.user.findMany.mockResolvedValue(leaderboardUsers);
      prisma.user.findUnique
        .mockResolvedValueOnce({ currentStreak: 3, totalPoints: 50 })
        .mockResolvedValueOnce({ createdAt: new Date('2024-01-01') });
      prisma.user.count.mockResolvedValue(5);

      const result = await LeaderboardService.getStreakLeaderboard(
        { period: 'all', limit: 10 },
        'u3'
      );

      expect(result.leaderboard).toHaveLength(2);
      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[0].currentStreak).toBe(10);
      expect(result.leaderboard[0].badges).toBe(2);
      expect(result.currentUser.rank).toBe(6);
      expect(result.period).toBe('all');
    });

    it('filters by week period', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getStreakLeaderboard({ period: 'week', limit: 10 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalled();
      const whereClause = prisma.user.findMany.mock.calls[0][0].where;
      expect(whereClause.submissions).toBeDefined();
    });

    it('filters by month period', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getStreakLeaderboard({ period: 'month', limit: 10 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalled();
      const whereClause = prisma.user.findMany.mock.calls[0][0].where;
      expect(whereClause.submissions).toBeDefined();
    });

    it('handles missing current user', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await LeaderboardService.getStreakLeaderboard(
        { period: 'all', limit: 10 },
        'u1'
      );

      expect(result.currentUser).toBeNull();
    });

    it('limits results correctly', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getStreakLeaderboard({ period: 'all', limit: 5 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });

  describe('getPointsLeaderboard', () => {
    it('returns leaderboard with points ordering', async () => {
      const leaderboardUsers = [
        {
          id: 'u1',
          name: 'User 1',
          profilePicture: 'pic1.jpg',
          currentStreak: 5,
          totalPoints: 200,
          userBadges: [{ badgeId: 'b1' }],
        },
        {
          id: 'u2',
          name: 'User 2',
          profilePicture: 'pic2.jpg',
          currentStreak: 10,
          totalPoints: 150,
          userBadges: [],
        },
      ];

      prisma.user.findMany.mockResolvedValue(leaderboardUsers);
      prisma.user.findUnique
        .mockResolvedValueOnce({ currentStreak: 3, totalPoints: 100 })
        .mockResolvedValueOnce({ createdAt: new Date('2024-01-01') });
      prisma.user.count.mockResolvedValue(3);

      const result = await LeaderboardService.getPointsLeaderboard(
        { period: 'all', limit: 10 },
        'u3'
      );

      expect(result.leaderboard).toHaveLength(2);
      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[0].totalPoints).toBe(200);
      expect(result.currentUser.rank).toBe(4);
      expect(result.period).toBe('all');
    });

    it('filters by week period', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getPointsLeaderboard({ period: 'week', limit: 10 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalled();
      const whereClause = prisma.user.findMany.mock.calls[0][0].where;
      expect(whereClause.submissions).toBeDefined();
    });

    it('filters by month period', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getPointsLeaderboard({ period: 'month', limit: 10 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalled();
      const whereClause = prisma.user.findMany.mock.calls[0][0].where;
      expect(whereClause.submissions).toBeDefined();
    });

    it('handles missing current user', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await LeaderboardService.getPointsLeaderboard(
        { period: 'all', limit: 10 },
        'u1'
      );

      expect(result.currentUser).toBeNull();
    });

    it('enforces limit bounds', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currentStreak: 0, totalPoints: 0 });
      prisma.user.count.mockResolvedValue(0);

      await LeaderboardService.getPointsLeaderboard({ period: 'all', limit: 200 }, 'u1');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 })
      );
    });
  });
});

