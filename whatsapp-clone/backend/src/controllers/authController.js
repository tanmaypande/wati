const authService = require('../services/authService');

function mapErrorToStatus(err) {
  if (!err) return 400;
  if (err.status) return err.status;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('email already registered') || msg.includes('already registered')) return 409;
  if (msg.includes('invalid credentials')) return 401;
  if (msg.includes('invalid refresh token') || msg.includes('refresh token expired') || msg.includes('invalid or used token') || msg.includes('token expired')) return 401;
  if (msg.includes('current password') || msg.includes('incorrect current')) return 403;
  // default to 400 for known domain errors; let global handler treat true server errors
  return 400;
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    // result: { message: 'Verification code sent' }
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Register error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

// Verify email OTP and create user after successful verification
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail({ email, otp });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Verify email error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

// Resend verification code
async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.resendVerification({ email });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Resend verification error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Login error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh({ token: refreshToken });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Refresh error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    await authService.logout({ token: refreshToken });
    return res.json({ success: true });
  } catch (err) {
    console.error('Logout error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Forgot password error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword({ token, newPassword });
    return res.json({ success: true });
  } catch (err) {
    console.error('Reset password error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

// Protected: return current user's profile
async function me(req, res) {
  try {
    // authenticate middleware sets req.user { userId, role }
      const userId = req.user && (req.user.userId || req.user.id);
    const profile = await authService.getProfile({ userId });
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Get profile error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

// Protected: change password for current user
async function changePassword(req, res) {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword({ userId, currentPassword, newPassword });
    return res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    console.error('Change password error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
  changePassword,
};
