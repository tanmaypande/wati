const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/prismaClient');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId || !payload.role) {
      return res.status(401).json({ message: 'Invalid token claims' });
    }

    // SUPER_ADMIN has workspaceId = null; ADMIN/AGENT must have workspaceId
    if (payload.role !== 'SUPER_ADMIN' && !payload.workspaceId) {
      return res.status(401).json({ message: 'Invalid tenant context in token' });
    }

    const userId = payload.userId;
    const role = payload.role;
    const workspaceId = payload.role === 'SUPER_ADMIN' ? null : payload.workspaceId;

    // Fast status check in DB
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true, workspaceId: true, workspace: { select: { status: true } } },
    });

    if (!userRecord) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }

    if (!userRecord.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    if (userRecord.role !== 'SUPER_ADMIN' && userRecord.workspace) {
      if (userRecord.workspace.status === 'SUSPENDED') {
        return res.status(403).json({
          message: 'Workspace is suspended. Access denied. Please contact platform administrator.',
          code: 'WORKSPACE_SUSPENDED',
        });
      }
    }

    req.user = {
      id: userId,
      userId,
      role: userRecord.role,
      workspaceId: userRecord.role === 'SUPER_ADMIN' ? null : userRecord.workspaceId,
    };

    return next();
  } catch (err) {
    if (err.code === 'WORKSPACE_SUSPENDED') {
      return res.status(403).json({ message: err.message, code: 'WORKSPACE_SUSPENDED' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticate,
};
