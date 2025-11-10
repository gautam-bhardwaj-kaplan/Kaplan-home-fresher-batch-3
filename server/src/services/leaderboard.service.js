const prisma = require('../config/prisma');

/**
 * Get streak-based leaderboard
 * @param {Object} query_params - Query parameters with period and limit
 * @param {string} current_user_id - ID of the current user
 * @returns {Promise<Object>} Leaderboard data with current user's rank
 */
const getStreakLeaderboard = async (query_params, current_user_id) => {
  const { period, limit } = query_params;
  const limit_value = Math.max(1, Math.min(100, parseInt(limit) || 10));

  let date_filter = null;
  if (period === 'week') {
    const week_ago = new Date();
    week_ago.setDate(week_ago.getDate() - 7);
    date_filter = week_ago;
  } else if (period === 'month') {
    const month_ago = new Date();
    month_ago.setMonth(month_ago.getMonth() - 1);
    date_filter = month_ago;
  }

  const where_clause = {
    isActive: true,
    role: 'LEARNER'
  };

  if (date_filter) {
    where_clause.submissions = {
      some: {
        attemptDate: {
          gte: date_filter
        }
      }
    };
  }

  const leaderboard_users = await prisma.user.findMany({
    where: where_clause,
    select: {
      id: true,
      name: true,
      profilePicture: true,
      currentStreak: true,
      totalPoints: true,
      userBadges: {
        select: {
          badgeId: true
        }
      }
    },
    orderBy: [
      { currentStreak: 'desc' },
      { totalPoints: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit_value
  });

  const leaderboard = leaderboard_users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name,
    profilePicture: user.profilePicture,
    currentStreak: user.currentStreak,
    totalPoints: user.totalPoints,
    badges: user.userBadges.length
  }));

  const current_user = await prisma.user.findUnique({
    where: { id: current_user_id },
    select: {
      currentStreak: true,
      totalPoints: true
    }
  });

  let current_user_rank = null;
  if (current_user) {
    const current_user_full = await prisma.user.findUnique({
      where: { id: current_user_id },
      select: { createdAt: true }
    });

    if (current_user_full) {
      const users_ahead = await prisma.user.count({
        where: {
          ...where_clause,
          OR: [
            { currentStreak: { gt: current_user.currentStreak } },
            {
              currentStreak: current_user.currentStreak,
              totalPoints: { gt: current_user.totalPoints }
            },
            {
              currentStreak: current_user.currentStreak,
              totalPoints: current_user.totalPoints,
              createdAt: { lt: current_user_full.createdAt }
            }
          ]
        }
      });
      current_user_rank = users_ahead + 1;
    }
  }

  return {
    leaderboard,
    currentUser: current_user
      ? {
          rank: current_user_rank,
          currentStreak: current_user.currentStreak,
          totalPoints: current_user.totalPoints
        }
      : null,
    period: period || 'all',
    generatedAt: new Date().toISOString()
  };
};

/**
 * Get points-based leaderboard
 * @param {Object} query_params - Query parameters with period and limit
 * @param {string} current_user_id - ID of the current user
 * @returns {Promise<Object>} Leaderboard data with current user's rank
 */
const getPointsLeaderboard = async (query_params, current_user_id) => {
  const { period, limit } = query_params;
  const limit_value = Math.max(1, Math.min(100, parseInt(limit) || 10));

  let date_filter = null;
  if (period === 'week') {
    const week_ago = new Date();
    week_ago.setDate(week_ago.getDate() - 7);
    date_filter = week_ago;
  } else if (period === 'month') {
    const month_ago = new Date();
    month_ago.setMonth(month_ago.getMonth() - 1);
    date_filter = month_ago;
  }

  const where_clause = {
    isActive: true,
    role: 'LEARNER'
  };

  if (date_filter) {
    where_clause.submissions = {
      some: {
        attemptDate: {
          gte: date_filter
        }
      }
    };
  }

  const leaderboard_users = await prisma.user.findMany({
    where: where_clause,
    select: {
      id: true,
      name: true,
      profilePicture: true,
      currentStreak: true,
      totalPoints: true,
      userBadges: {
        select: {
          badgeId: true
        }
      }
    },
    orderBy: [
      { totalPoints: 'desc' },
      { currentStreak: 'desc' },
      { createdAt: 'asc' }
    ],
    take: limit_value
  });

  const leaderboard = leaderboard_users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name,
    profilePicture: user.profilePicture,
    currentStreak: user.currentStreak,
    totalPoints: user.totalPoints,
    badges: user.userBadges.length
  }));

  const current_user = await prisma.user.findUnique({
    where: { id: current_user_id },
    select: {
      currentStreak: true,
      totalPoints: true
    }
  });

  let current_user_rank = null;
  if (current_user) {
    // Get current user's createdAt for tiebreaker
    const current_user_full = await prisma.user.findUnique({
      where: { id: current_user_id },
      select: { createdAt: true }
    });

    if (current_user_full) {
      // Count users with more points or same stats but earlier createdAt
      const users_ahead = await prisma.user.count({
        where: {
          ...where_clause,
          OR: [
            { totalPoints: { gt: current_user.totalPoints } },
            {
              totalPoints: current_user.totalPoints,
              currentStreak: { gt: current_user.currentStreak }
            },
            {
              totalPoints: current_user.totalPoints,
              currentStreak: current_user.currentStreak,
              createdAt: { lt: current_user_full.createdAt }
            }
          ]
        }
      });
      current_user_rank = users_ahead + 1;
    }
  }

  return {
    leaderboard,
    currentUser: current_user
      ? {
          rank: current_user_rank,
          currentStreak: current_user.currentStreak,
          totalPoints: current_user.totalPoints
        }
      : null,
    period: period || 'all',
    generatedAt: new Date().toISOString()
  };
};

exports.LeaderboardService = {
  getStreakLeaderboard,
  getPointsLeaderboard
};

