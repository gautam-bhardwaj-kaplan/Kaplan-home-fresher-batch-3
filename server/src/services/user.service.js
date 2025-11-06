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
      earnedAt: ub.earnedAt
    })),
    emailNotifications: user.emailNotifications,
    notificationTime: user.notificationTime
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
      earnedAt: ub.earnedAt
    })),
    emailNotifications: user.emailNotifications,
    notificationTime: user.notificationTime
  };
};

exports.UserService = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};