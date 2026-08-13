const prisma = require('../config/prismaClient');

async function logAudit({ actorUserId, workspaceId = null, action, targetType, targetId = null, metadata = null }) {
  try {
    if (!actorUserId || !action || !targetType) {
      console.warn('AuditLog warning: Missing required parameters', { actorUserId, action, targetType });
      return null;
    }

    const log = await prisma.auditLog.create({
      data: {
        actorUserId,
        workspaceId: workspaceId || null,
        action,
        targetType,
        targetId: targetId || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });

    return log;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
    // Non-blocking for primary application flow
    return null;
  }
}

async function getAuditLogs({ page = 1, limit = 20, workspaceId = null, action = null }) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (action) where.action = action;

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        actorUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        workspace: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return { total, page: Number(page), limit: take, items };
}

module.exports = {
  logAudit,
  getAuditLogs,
};
