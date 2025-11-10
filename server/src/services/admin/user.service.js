const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateUserRole = async (userId, newRole) => {
  if (!['ADMIN', 'LEARNER'].includes(newRole)) {
    throw new Error('Invalid role value. Must be ADMIN or LEARNER.');
  }

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });
};

module.exports = {
  getAllUsers,
  updateUserRole,
};
