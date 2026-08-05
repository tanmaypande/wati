// Role-based authorization middleware

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (allowedRoles.length === 0) return next();
    if (!allowedRoles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = { authorize };
