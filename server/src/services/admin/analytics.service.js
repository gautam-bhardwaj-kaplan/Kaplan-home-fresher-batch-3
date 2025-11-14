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

  const totalQuestions = await prisma.question.count({
    where: {
      isActive: true,
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

  const averageStreak = activeLearners.length > 0
    ? activeLearners.reduce((sum, user) => sum + user.currentStreak, 0) / activeLearners.length
    : 0;

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
      averageStreak: Number(averageStreak.toFixed(1)),
    },
    dailyStats,
    categoryBreakdown: categoryStats,
    topPerformers: topPerformersFormatted,
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

