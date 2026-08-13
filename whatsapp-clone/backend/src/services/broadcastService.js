const prisma = require('../config/prismaClient');

async function createBroadcast({ workspaceId, title, message }) {
  const data = {
    workspaceId,
    title,
    message,
  };

  return prisma.broadcast.create({ data });
}

async function listBroadcasts({ workspaceId }) {
  return prisma.broadcast.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

async function getBroadcast({ id, workspaceId }) {
  const b = await prisma.broadcast.findFirst({ where: { id, workspaceId } });
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
