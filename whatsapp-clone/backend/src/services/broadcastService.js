const prisma = require('../config/prismaClient');

async function createBroadcast({ title, message, templateId, recipientIds = [], recipientCount = 0, status = 'DRAFT', createdBy = null }) {
  const data = {
    title,
    message,
    templateId: templateId || null,
    recipients: recipientIds && recipientIds.length ? { ids: recipientIds } : null,
    recipientCount: recipientCount || (recipientIds ? recipientIds.length : 0),
    status: status || 'DRAFT',
    createdBy: createdBy || null,
  };

  return prisma.broadcast.create({ data });
}

async function listBroadcasts() {
  return prisma.broadcast.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getBroadcast({ id }) {
  const b = await prisma.broadcast.findUnique({ where: { id } });
  if (!b) {
    const err = new Error('Broadcast not found');
    err.status = 404;
    throw err;
  }
  return b;
}

module.exports = {
  createBroadcast,
  listBroadcasts,
  getBroadcast,
};
