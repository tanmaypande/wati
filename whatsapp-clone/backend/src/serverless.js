const app = require('./app');
const prisma = require('./config/prismaClient');

prisma.$connect().catch((err) => {
  console.error('Prisma connection error in serverless environment:', err);
});

module.exports = app;
