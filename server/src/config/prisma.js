const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.prisma;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;