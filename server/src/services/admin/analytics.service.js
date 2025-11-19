const prisma = require('../../config/prisma');

/**
 * Get platform-wide analytics overview
 * @param {Object} queryParams - Query parameters with dateFrom and dateTo (optional)
 * @returns {Promise<Object>} Overview analytics data
 */
const getOverview = async (queryParams) => {
  const { dateFrom, dateTo } = queryParams;

  let submissionDateFilter = {};
  if (dateFrom || dateTo) {
    submissionDateFilter.attemptDate = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      submissionDateFilter.attemptDate.gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      submissionDateFilter.attemptDate.lte = toDate;
    }
  }


  const totalUsers = await prisma.user.count({
    where: {
      role: 'LEARNER',
    },
  });

  
  const activeUsersWhere = {
    role: 'LEARNER',
    isActive: true,
  };

  if (dateFrom || dateTo) {
    activeUsersWhere.submissions = {
      some: submissionDateFilter,
    };
  } else {
    activeUsersWhere.submissions = {
      some: {},
    };
  }

  const activeUsers = await prisma.user.count({
    where: activeUsersWhere,
  });

  let questionDateFilter = {};
  if (dateFrom || dateTo) {
    questionDateFilter.scheduledDate = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      questionDateFilter.scheduledDate.gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      questionDateFilter.scheduledDate.lte = toDate;
    }
  }

  const totalQuestions = await prisma.question.count({
    where: {
      isActive: true,
      ...questionDateFilter,
    },
  });

  const [totalAttempts, correctAttempts] = await Promise.all([
    prisma.submission.count({
      where: submissionDateFilter,
    }),
    prisma.submission.count({
      where: {
        ...submissionDateFilter,
        isCorrect: true,
      },
    }),
  ]);

  const averageAccuracy = totalAttempts > 0
    ? (correctAttempts / totalAttempts) * 100
    : 0;

  const activeLearners = await prisma.user.findMany({
    where: {
      role: 'LEARNER',
      isActive: true,
      currentStreak: { gt: 0 },
    },
    select: {
      currentStreak: true,
    },
  });

  let badgeDateFilter = {};
  if (dateFrom || dateTo) {
    badgeDateFilter.earnedAt = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      badgeDateFilter.earnedAt.gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);
      badgeDateFilter.earnedAt.lte = toDate;
    }
  }

  const badgesAwarded = await prisma.userBadge.count({
    where: badgeDateFilter,
  });

  const uniqueParticipants = await prisma.submission.findMany({
    where: submissionDateFilter,
    select: { userId: true },
    distinct: ['userId'],
  });

  const participationRate = totalUsers > 0
    ? (uniqueParticipants.length / totalUsers) * 100
    : 0;

  const allLearners = await prisma.user.findMany({
    where: {
      role: 'LEARNER',
      isActive: true,
    },
    select: {
      currentStreak: true,
    },
  });

  const streakBuckets = {
    '0': 0,
    '1-7': 0,
    '8-14': 0,
    '15-30': 0,
    '31-60': 0,
    '61+': 0,
  };

  allLearners.forEach((user) => {
    const streak = user.currentStreak || 0;
    if (streak === 0) {
      streakBuckets['0']++;
    } else if (streak <= 7) {
      streakBuckets['1-7']++;
    } else if (streak <= 14) {
      streakBuckets['8-14']++;
    } else if (streak <= 30) {
      streakBuckets['15-30']++;
    } else if (streak <= 60) {
      streakBuckets['31-60']++;
    } else {
      streakBuckets['61+']++;
    }
  });

  const streakDistribution = Object.entries(streakBuckets).map(([range, count]) => ({
    range,
    count,
  }));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); 

  const weeklyQuestions = await prisma.question.findMany({
    where: {
      isActive: true,
      scheduledDate: {
        gte: eightWeeksAgo,
        lte: today,
      },
    },
    select: {
      id: true,
      scheduledDate: true,
      category: true,
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });

  const weeklyHeatmap = new Map();
  weeklyQuestions.forEach((question) => {
    const date = new Date(question.scheduledDate);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); 
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyHeatmap.has(weekKey)) {
      weeklyHeatmap.set(weekKey, {
        week: weekKey,
        totalQuestions: 0,
        totalAttempts: 0,
        correctAttempts: 0,
      });
    }
    const weekData = weeklyHeatmap.get(weekKey);
    weekData.totalQuestions++;
  });

  for (const [weekKey, weekData] of weeklyHeatmap.entries()) {
    const weekStart = new Date(weekKey);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekSubmissions = await prisma.submission.findMany({
      where: {
        attemptDate: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      select: {
        isCorrect: true,
      },
    });

    weekData.totalAttempts = weekSubmissions.length;
    weekData.correctAttempts = weekSubmissions.filter((s) => s.isCorrect).length;
    weekData.accuracy = weekData.totalAttempts > 0
      ? (weekData.correctAttempts / weekData.totalAttempts) * 100
      : 0;
  }

  const weeklyHeatmapData = Array.from(weeklyHeatmap.values())
    .sort((a, b) => a.week.localeCompare(b.week));

  let dailyStatsDateFilter;
  if (dateFrom && dateTo) {
    const fromDate = new Date(dateFrom);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(dateTo);
    toDate.setUTCHours(23, 59, 59, 999);
    dailyStatsDateFilter = {
      gte: fromDate,
      lte: toDate,
    };
  } else if (dateFrom) {
    const fromDate = new Date(dateFrom);
    fromDate.setUTCHours(0, 0, 0, 0);
    dailyStatsDateFilter = {
      gte: fromDate,
    };
  } else if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setUTCHours(23, 59, 59, 999);
    dailyStatsDateFilter = {
      lte: toDate,
    };
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
    dailyStatsDateFilter = {
      gte: thirtyDaysAgo,
    };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      attemptDate: dailyStatsDateFilter,
    },
    select: {
      attemptDate: true,
      isCorrect: true,
      userId: true,
    },
  });

  const uniqueUsersByDate = await prisma.submission.groupBy({
    by: ['attemptDate'],
    where: {
      attemptDate: dailyStatsDateFilter,
    },
    _count: {
      userId: true,
    },
  });

  const dailyStatsMap = new Map();
  
  submissions.forEach((submission) => {
    const dateKey = submission.attemptDate.toISOString().split('T')[0];
    if (!dailyStatsMap.has(dateKey)) {
      dailyStatsMap.set(dateKey, {
        date: dateKey,
        totalAttempts: 0,
        correctAttempts: 0,
      });
    }
    const stats = dailyStatsMap.get(dateKey);
    stats.totalAttempts += 1;
    if (submission.isCorrect) {
      stats.correctAttempts += 1;
    }
  });

  uniqueUsersByDate.forEach((item) => {
    const dateKey = item.attemptDate.toISOString().split('T')[0];
    const stats = dailyStatsMap.get(dateKey) || {
      date: dateKey,
      totalAttempts: 0,
      correctAttempts: 0,
    };
    
    const accuracy = stats.totalAttempts > 0
      ? (stats.correctAttempts / stats.totalAttempts) * 100
      : 0;
    
    dailyStatsMap.set(dateKey, {
      date: dateKey,
      activeUsers: item._count.userId,
      totalAttempts: stats.totalAttempts,
      accuracy: Number(accuracy.toFixed(1)),
    });
  });

  const dailyStats = Array.from(dailyStatsMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  const categoryBreakdown = await prisma.question.groupBy({
    by: ['category'],
    where: {
      isActive: true,
    },
    _count: {
      id: true,
    },
  });

  const categoryStats = await Promise.all(
    categoryBreakdown.map(async (cat) => {
      const categorySubmissions = await prisma.submission.findMany({
        where: {
          question: {
            category: cat.category,
          },
          ...(dateFrom || dateTo ? submissionDateFilter : {}),
        },
        select: {
          isCorrect: true,
        },
      });

      const totalAttempts = categorySubmissions.length;
      const correctAttempts = categorySubmissions.filter((s) => s.isCorrect).length;
      const accuracy = totalAttempts > 0
        ? (correctAttempts / totalAttempts) * 100
        : 0;

      return {
        category: cat.category,
        totalQuestions: cat._count.id,
        totalAttempts,
        accuracy: Number(accuracy.toFixed(1)),
      };
    })
  );

  const topPerformers = await prisma.user.findMany({
    where: {
      role: 'LEARNER',
      isActive: true,
      totalQuestionsAttempted: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      currentStreak: true,
      totalQuestionsAttempted: true,
      totalCorrectAnswers: true,
      totalPoints: true,
    },
    orderBy: [
      { currentStreak: 'desc' },
      { totalPoints: 'desc' },
    ],
    take: 10,
  });

  const topPerformersFormatted = topPerformers.map((user) => {
    const accuracy = user.totalQuestionsAttempted > 0
      ? (user.totalCorrectAnswers / user.totalQuestionsAttempted) * 100
      : 0;

    return {
      userId: user.id,
      name: user.name,
      currentStreak: user.currentStreak,
      accuracy: Number(accuracy.toFixed(1)),
    };
  });

  return {
    overview: {
      totalUsers,
      activeUsers,
      totalQuestions,
      totalAttempts,
      averageAccuracy: Number(averageAccuracy.toFixed(1)),
      participationRate: Number(participationRate.toFixed(1)),
      badgesAwarded,
    },
    dailyStats,
    categoryBreakdown: categoryStats,
    topPerformers: topPerformersFormatted,
    streakDistribution,
    weeklyHeatmap: weeklyHeatmapData,
  };
};

/**
 * Get detailed analytics for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Daily analytics data
 */
const getDailyAnalytics = async (date) => {
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const question = await prisma.question.findFirst({
    where: {
      scheduledDate: {
        gte: targetDate,
        lt: nextDate,
      },
      isActive: true,
    },
    select: {
      id: true,
      scheduledDate: true,
      category: true,
      difficulty: true,
      questionText: true,
      questionType: true,
      points: true,
    },
  });

  if (!question) {
    const error = new Error(`No question found for date: ${date}`);
    error.code = 'NOT_FOUND';
    throw error;
  }

  const totalUsers = await prisma.user.count({
    where: {
      role: 'LEARNER',
      isActive: true,
    },
  });

  const submissions = await prisma.submission.findMany({
    where: {
      attemptDate: {
        gte: targetDate,
        lt: nextDate,
      },
    },
    select: {
      id: true,
      userId: true,
      isCorrect: true,
      submittedAt: true,
      question: {
        select: {
          category: true,
        },
      },
    },
  });

  const attempted = submissions.length;
  const correctAnswers = submissions.filter((s) => s.isCorrect).length;
  const incorrectAnswers = attempted - correctAnswers;
  const accuracy = attempted > 0 ? (correctAnswers / attempted) * 100 : 0;

  const uniqueUserIds = new Set(submissions.map((s) => s.userId));
  const attemptedUsers = uniqueUserIds.size;

  const participationRate = totalUsers > 0
    ? (attemptedUsers / totalUsers) * 100
    : 0;

 
  const averageTimeSpent = 0;

  const hourlyDistribution = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStart = new Date(targetDate);
    hourStart.setUTCHours(hour, 0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setUTCHours(hour + 1, 0, 0, 0);

    const hourSubmissions = submissions.filter((s) => {
      const subTime = new Date(s.submittedAt);
      return subTime >= hourStart && subTime < hourEnd;
    });

    hourlyDistribution.push({
      hour,
      attempts: hourSubmissions.length,
    });
  }

  const categoryDistribution = {
    category: question.category,
    totalAttempts: attempted,
    correctAttempts: correctAnswers,
    accuracy: Number(accuracy.toFixed(1)),
  };

  return {
    date,
    question: {
      id: question.id,
      scheduledDate: question.scheduledDate.toISOString().split('T')[0],
      category: question.category,
      difficulty: question.difficulty,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
    },
    participation: {
      totalUsers,
      attempted: attemptedUsers,
      participationRate: Number(participationRate.toFixed(1)),
    },
    performance: {
      correctAnswers,
      incorrectAnswers,
      accuracy: Number(accuracy.toFixed(1)),
      averageTimeSpent,
    },
    hourlyDistribution,
    categoryDistribution,
  };
};

module.exports = {
  getOverview,
  getDailyAnalytics,
};

