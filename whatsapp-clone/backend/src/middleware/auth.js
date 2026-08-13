const { verifyAccessToken } = require('../utils/jwt');

// Simple JWT auth middleware for protecting routes. This assumes
// a JWT_SECRET environment variable is present and that tokens were
// signed with signAccessToken helper.

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    // Validate expected claims
    if (!payload || !payload.userId || !payload.role || !payload.workspaceId) {
      return res.status(401).json({ message: 'Invalid token claims' });
    }
    req.user = { id: payload.userId, role: payload.role, workspaceId: payload.workspaceId };
    return next();
  } catch (err) {
    // Keep returned message generic for clients; detailed info should be logged server-side if needed
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticate,
};
