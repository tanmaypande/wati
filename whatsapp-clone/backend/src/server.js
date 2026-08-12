require('dotenv').config();
const http = require('http');
const app = require('./app');
const { attachSocket } = require('./socket/socketHandler');
const prisma = require('./config/prismaClient');

const server = http.createServer(app);

// Attach Socket.IO for local or custom-hosted server.
attachSocket(server);

// Graceful shutdown helpers
async function shutdown(err) {
  if (err) console.error('Shutting down due to error:', err);
  try {
    console.log('Closing server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  } catch (e) {
    console.error('Error closing server', e);
  }
  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
  } catch (e) {
    console.error('Error disconnecting Prisma', e);
  }
  process.exit(err ? 1 : 0);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown(err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  shutdown(reason);
});

// Connect to DB and start server
const PORT = process.env.PORT || 4000;
prisma.$connect()
  .then(() => {
    console.log('Prisma connected');
    server.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
