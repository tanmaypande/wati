// Super Admin Platform Authorization Middleware

function superAdminAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Platform Super Admin role required.' });
  }

  return next();
}

module.exports = superAdminAuth;
