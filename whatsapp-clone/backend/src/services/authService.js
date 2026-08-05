const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function register({ name, email, password, role = 'AGENT' }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } });

  // create a session record
  await prisma.session.create({ data: { userId: user.id } });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  // persist refresh token in DB
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  // persist refresh token
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
}

async function refresh({ token }) {

  // Prevent null/undefined token
  if (!token) {
    const err = new Error("Refresh token is required");
    err.status = 401;
    throw err;
  }

  // validate that token exists and not revoked
  const record = await prisma.refreshToken.findUnique({
    where: { token }
  });

  if (!record || record.revoked) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    const err = new Error("Refresh token expired");
    err.status = 401;
    throw err;
  }

  // include role in newly minted access token
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { role: true }
  });

  const payload = {
    userId: record.userId,
    role: user?.role
  };

  const accessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  // revoke old refresh token
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revoked: true }
  });

  // save new refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: record.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
}

async function logout({ token }) {
  // revoke refresh token
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (record) {
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
  }
  return true;
}

async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return true; // do not reveal existence

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

  // In production send email with secure link containing token. For now return token for testing.
  return { token };
}

async function resetPassword({ token, newPassword }) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.used) throw new Error('Invalid or used token');
  if (record.expiresAt < new Date()) throw new Error('Token expired');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });

  // revoke all active refresh tokens for the user to force re-login
  await prisma.refreshToken.updateMany({ where: { userId: record.userId, revoked: false }, data: { revoked: true } });

  return true;
}

// Get basic profile for authenticated user
async function getProfile({ userId }) {
  if (!userId) throw new Error('Missing user id');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

// Change password with current password verification and revoke existing refresh tokens
async function changePassword({ userId, currentPassword, newPassword }) {
  if (!userId) throw new Error('Missing user id');
  if (!currentPassword || !newPassword) throw new Error('Current password and new password are required');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Incorrect current password');
    err.status = 403;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  // Revoke all refresh tokens for this user to force re-authentication
  await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });

  // Optionally record a session expiry for existing sessions. For now keep it simple.
  return true;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword,
};
