const { PrismaClient } = require('@prisma/client');

// Use a global variable to prevent creating multiple instances of PrismaClient
// during development (e.g., with nodemon) which can exhaust database connections.
let prisma;
if (global.prisma) {
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
}

module.exports = prisma;
