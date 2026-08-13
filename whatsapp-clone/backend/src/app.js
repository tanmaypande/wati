const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const conversationsRoutes = require('./routes/conversations');
const templatesRoutes = require('./routes/templates');
const broadcastsRoutes = require('./routes/broadcasts');
const whatsappRoutes = require('./routes/whatsapp');
const agentsRoutes = require('./routes/agents');
const superAdminRoutes = require('./routes/superAdmin');
const ensureSuperAdmin = require('./utils/seedSuperAdmin');

const app = express();

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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/broadcasts', broadcastsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/health/db', async (req, res) => {
  try {
    const prisma = require('./config/prismaClient');
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ success: true, database: 'connected' });
  } catch (err) {
    return res.status(503).json({ success: false, database: 'unavailable' });
  }
});

// WhatsApp webhook verification
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

// Auto seed default super admin user on startup
ensureSuperAdmin();

app.use((err, req, res, next) => {
  console.error(err);
  const status = err && err.status ? err.status : 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Error');
  res.status(status).json({ message });
});

module.exports = app;
