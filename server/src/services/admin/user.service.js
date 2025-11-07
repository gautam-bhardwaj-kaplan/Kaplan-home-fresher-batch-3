const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UsersService {
  async getAllUsers() {
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
  }

  async updateUserRole(userId, newRole) {
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
  }
}

module.exports = new UsersService();
