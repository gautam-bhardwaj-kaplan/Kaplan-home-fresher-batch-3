const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (userData) => {
  const { email, password, name } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      currentStreak: true,
      profilePicture: true
    }
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user, token };
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      currentStreak: user.currentStreak,
      profilePicture: user.profilePicture
    },
    token
  };
};

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: {
        include: {
          badge: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const accuracy = user.totalQuestionsAttempted > 0
    ? (user.totalCorrectAnswers / user.totalQuestionsAttempted) * 100
    : 0;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalQuestionsAttempted: user.totalQuestionsAttempted,
    totalCorrectAnswers: user.totalCorrectAnswers,
    accuracy: Number(accuracy.toFixed(1)),
    totalPoints: user.totalPoints,
    badges: user.userBadges.map(ub => ({
      badgeId: ub.badge.badgeId,
      name: ub.badge.name,
      earnedAt: ub.earnedAt,
      iconUrl: ub.badge.iconUrl
    })),
    emailNotifications: user.emailNotifications,
    notificationTime: user.notificationTime,
    createdAt: user.createdAt
  };
};

const updateUserProfile = async (userId, updateData) => {
  const { name, emailNotifications, notificationTime } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name,
      emailNotifications: emailNotifications,
      notificationTime: notificationTime
    },
    include: {
      userBadges: {
        include: {
          badge: true
        }
      }
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalQuestionsAttempted: user.totalQuestionsAttempted,
    totalCorrectAnswers: user.totalCorrectAnswers,
    totalPoints: user.totalPoints,
    badges: user.userBadges.map(ub => ({
      badgeId: ub.badge.badgeId,
      name: ub.badge.name,
      earnedAt: ub.earnedAt,
      iconUrl: ub.badge.iconUrl
    })),
    emailNotifications: user.emailNotifications,
    notificationTime: user.notificationTime
  };
};

const getUserProgress = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: {
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      },
      submissions: {
        include: {
          question: {
            select: {
              category: true,
              questionText: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 30
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const accuracy = user.totalQuestionsAttempted > 0
    ? (user.totalCorrectAnswers / user.totalQuestionsAttempted) * 100
    : 0;

  const category_stats = {};
  user.submissions.forEach(submission => {
    const category = submission.question.category;
    if (!category_stats[category]) {
      category_stats[category] = {
        attempted: 0,
        correct: 0
      };
    }
    category_stats[category].attempted += 1;
    if (submission.isCorrect) {
      category_stats[category].correct += 1;
    }
  });

  const category_performance = Object.entries(category_stats).map(([category, stats]) => ({
    category,
    attempted: stats.attempted,
    correct: stats.correct,
    accuracy: stats.attempted > 0
      ? Number(((stats.correct / stats.attempted) * 100).toFixed(1))
      : 0
  }));

  const recent_activity = user.submissions.slice(0, 30).map(submission => ({
    date: submission.attemptDate.toISOString().split('T')[0],
    isCorrect: submission.isCorrect,
    points: submission.pointsEarned,
    category: submission.question.category,
    questionText: submission.question.questionText
  }));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const thirty_days_ago = new Date(today);
  thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

  const submissions_by_date = {};
  user.submissions.forEach(submission => {
    const date_key = submission.attemptDate.toISOString().split('T')[0];
    if (!submissions_by_date[date_key]) {
      submissions_by_date[date_key] = {
        hasAttempt: true,
        isCorrect: submission.isCorrect
      };
    }
  });

  const streak_history = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirty_days_ago);
    date.setDate(date.getDate() + i);
    const date_key = date.toISOString().split('T')[0];
    streak_history.push({
      date: date_key,
      hasAttempt: submissions_by_date[date_key] ? true : false,
      isCorrect: submissions_by_date[date_key]?.isCorrect || false
    });
  }

  const rank = await prisma.user.count({
    where: {
      isActive: true,
      role: 'LEARNER',
      OR: [
        { totalPoints: { gt: user.totalPoints } },
        {
          totalPoints: user.totalPoints,
          currentStreak: { gt: user.currentStreak }
        },
        {
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          createdAt: { lt: user.createdAt }
        }
      ]
    }
  }) + 1;

  const badges = user.userBadges.map(ub => ({
    badgeId: ub.badge.badgeId,
    name: ub.badge.name,
    earnedAt: ub.earnedAt,
    rarity: ub.badge.rarity
  }));

  return {
    overview: {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalAttempts: user.totalQuestionsAttempted,
      correctAnswers: user.totalCorrectAnswers,
      accuracy: Number(accuracy.toFixed(1)),
      totalPoints: user.totalPoints,
      rank
    },
    categoryPerformance: category_performance,
    recentActivity: recent_activity,
    streakHistory: streak_history,
    badges
  };
};

const getUserStatsChart = async (userId, query_params) => {
  const { period, metric } = query_params;
  const period_value = period || 'month';
  const metric_value = metric || 'accuracy';

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let start_date = new Date(today);

  if (period_value === 'week') {
    start_date.setDate(start_date.getDate() - 7);
  } else if (period_value === 'month') {
    start_date.setMonth(start_date.getMonth() - 1);
  } else if (period_value === 'year') {
    start_date.setFullYear(start_date.getFullYear() - 1);
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: userId,
      attemptDate: {
        gte: start_date,
        lte: today
      }
    },
    include: {
      question: {
        select: {
          category: true,
          points: true
        }
      }
    },
    orderBy: {
      attemptDate: 'asc'
    }
  });

  const date_map = {};
  
  submissions.forEach(submission => {
    const date_key = submission.attemptDate.toISOString().split('T')[0];
    if (!date_map[date_key]) {
      date_map[date_key] = {
        attempts: 0,
        correct: 0,
        points: 0
      };
    }
    date_map[date_key].attempts += 1;
    if (submission.isCorrect) {
      date_map[date_key].correct += 1;
    }
    date_map[date_key].points += submission.pointsEarned;
  });

  const chart_data = [];
  const current_date = new Date(start_date);

  while (current_date <= today) {
    const date_key = current_date.toISOString().split('T')[0];
    const stats = date_map[date_key] || { attempts: 0, correct: 0, points: 0 };

    let value = 0;
    if (metric_value === 'accuracy') {
      value = stats.attempts > 0
        ? Number(((stats.correct / stats.attempts) * 100).toFixed(1))
        : 0;
    } else if (metric_value === 'attempts') {
      value = stats.attempts;
    } else if (metric_value === 'points') {
      value = stats.points;
    }

    let label = '';
    if (period_value === 'week') {
      label = current_date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (period_value === 'month') {
      label = current_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period_value === 'year') {
      label = current_date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }

    chart_data.push({
      date: date_key,
      value: value,
      label: label
    });

    current_date.setDate(current_date.getDate() + 1);
  }

  return {
    chartData: chart_data,
    period: period_value,
    metric: metric_value
  };
};

exports.UserService = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserProgress,
  getUserStatsChart
};