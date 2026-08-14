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

    // Every tenant user (SUPER_ADMIN, ADMIN, AGENT) must have a valid workspaceId
    if (!payload.workspaceId) {
      return res.status(401).json({ message: 'Invalid tenant context in token' });
    }

    const userId = payload.userId;

    // Fast status check in DB
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true, workspaceId: true, workspace: { select: { status: true } } },
    });

    if (!userRecord || !userRecord.workspaceId) {
      return res.status(401).json({ message: 'User account or workspace no longer exists' });
    }

    if (!userRecord.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    if (userRecord.workspace) {
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
      workspaceId: userRecord.workspaceId,
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
