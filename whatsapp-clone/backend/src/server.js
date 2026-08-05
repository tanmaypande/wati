require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const conversationsRoutes = require('./routes/conversations');
const { attachSocket } = require('./socket/socketHandler');
const prisma = require('./config/prismaClient');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
if (process.env.NODE_ENV === 'production' && !FRONTEND_ORIGIN) {
  console.error('FRONTEND_ORIGIN must be set in production. Exiting.');
  process.exit(1);
}
app.use(cors({ origin: FRONTEND_ORIGIN || '*' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/conversations', conversationsRoutes);

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler with mapping support
app.use((err, req, res, next) => {
  // If handler receives an error with a status, use it; otherwise 500
  console.error(err);
  const status = err && err.status ? err.status : 500;
  const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Error');
  res.status(status).json({ message });
});

// Attach Socket.IO
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
