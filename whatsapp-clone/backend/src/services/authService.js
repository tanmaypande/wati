const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { isValidEmail, isValidPassword } = require('../utils/validation');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// SMTP environment variables used by Nodemailer
// Required to send email verification codes:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_SECURE=false
//   SMTP_USER=<email address>
//   SMTP_PASS=<app password or SMTP password>
//   SMTP_FROM=<optional from address; defaults to SMTP_USER>
//
// Example Gmail settings:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_SECURE=false
//   SMTP_USER=your.email@gmail.com
//   SMTP_PASS=your-google-app-password
//   SMTP_FROM="WATI Clone <your.email@gmail.com>"
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portValue || !user || !pass) {
    return null;
  }

  const port = parseInt(portValue, 10);
  const secure = typeof process.env.SMTP_SECURE !== 'undefined'
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendVerificationEmail(toEmail, otp) {
  const transporter = getSmtpTransporter();

  if (!transporter) {
    const err = new Error(
      'Email service is not configured. Please configure SMTP credentials.'
    );
    err.status = 500;
    throw err;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Verify your WATI Clone account',
    text: `WATI Clone verification code

Your WATI Clone verification code is:

${otp}

This code expires in 10 minutes.

If you did not request this code, you can safely ignore this email.`,
  };

  try {
    console.log('Testing SMTP connection...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_FROM:', process.env.SMTP_FROM);

    await transporter.verify();

    console.log('SMTP connection successful.');

    const info = await transporter.sendMail(mailOptions);

    console.log('Verification email sent successfully.');
    console.log('Message ID:', info.messageId);

    return info;
  } catch (err) {
    console.error('========== SMTP ERROR ==========');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Command:', err.command);
    console.error('Response:', err.response);
    console.error('Response Code:', err.responseCode);
    console.error('Full error:', err);
    console.error('================================');

    throw err;
  }
}
function generateOtp() {
  const num = crypto.randomInt(100000, 1000000);
  return String(num);
}

// New register: create verification record and send OTP. Do NOT create User yet.
async function register({ name, companyName, email, password }) {
  if (!name || !email || !password) throw new Error('Name, email and password are required');
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    const err = new Error('Please enter a valid email address.');
    err.status = 400;
    throw err;
  }
  // password validation: enforce requirements
  if (!isValidPassword(password)) {
    const err = new Error('Password requirements not met. Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
    err.status = 400;
    throw err;
  }
  // check duplicate in Users
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  // generate OTP and hash it
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const verificationRecord = await prisma.emailVerification.create({
    data: {
      email: normalized,
      otpHash,
      name: name.trim(),
      companyName: companyName ? companyName.trim() : null,
      passwordHash,
      expiresAt,
      lastSentAt: new Date(),
    },
  });

  try {
    await sendVerificationEmail(normalized, otp);
  } catch (err) {
    await prisma.emailVerification.update({ where: { id: verificationRecord.id }, data: { used: true } }).catch(() => {});
    throw err;
  }

  return { message: 'Verification code sent' };
}

// Verify OTP and create the workspace & super admin user after successful verification
async function verifyEmail({ email, otp }) {
  if (!email || !otp) throw new Error('Email and OTP are required');
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    const err = new Error('Please enter a valid email address.');
    err.status = 400;
    throw err;
  }

  const record = await prisma.emailVerification.findFirst({ where: { email: normalized, used: false }, orderBy: { createdAt: 'desc' } });
  if (!record) throw new Error('Verification code has expired. Please request a new code.');

  if (record.expiresAt < new Date()) {
    await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });
    throw new Error('Verification code has expired. Please request a new code.');
  }

  if (record.attempts >= 5) {
    await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });
    throw new Error('Too many attempts. Please request a new code.');
  }

  const match = await bcrypt.compare(String(otp), record.otpHash);
  if (!match) {
    await prisma.emailVerification.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    const updated = await prisma.emailVerification.findUnique({ where: { id: record.id } });
    if (updated.attempts >= 5) {
      await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });
      throw new Error('Too many attempts. Please request a new code.');
    }
    throw new Error('Invalid verification code.');
  }

  // Determine workspace name from companyName or fallback to owner's name
  const workspaceName = record.companyName && record.companyName.trim()
    ? record.companyName.trim()
    : `${record.name.trim()}'s Workspace`;
  const slugBase = (record.companyName || record.name).trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

  // create workspace and super admin user
  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: `${slugBase}-${Date.now().toString(36)}`,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: record.name,
      email: normalized,
      password: record.passwordHash,
      role: 'SUPER_ADMIN',
      workspaceId: workspace.id,
    },
  });

  await prisma.emailVerification.update({ where: { id: record.id }, data: { used: true } });

  // create initial session record
  await prisma.session.create({ data: { userId: user.id } });

  return { message: 'Email verified and workspace account created' };
}

// Resend verification code with cooldown
async function resendVerification({ email }) {
  if (!email) throw new Error('Email is required');
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    const err = new Error('Please enter a valid email address.');
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const recent = await prisma.emailVerification.findFirst({ where: { email: normalized, used: false }, orderBy: { createdAt: 'desc' } });
  if (recent) {
    const cooldownMs = 60 * 1000; // 60 seconds
    if (recent.lastSentAt && (Date.now() - new Date(recent.lastSentAt).getTime()) < cooldownMs) {
      const wait = Math.ceil((cooldownMs - (Date.now() - new Date(recent.lastSentAt).getTime())) / 1000);
      const err = new Error(`Please wait ${wait}s before requesting a new code.`);
      err.status = 429;
      throw err;
    }
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // invalidate previous pending codes
  await prisma.emailVerification.updateMany({ where: { email: normalized, used: false }, data: { used: true } });

  const name = recent ? recent.name : '';
  const companyName = recent ? recent.companyName : null;
  const passwordHash = recent ? recent.passwordHash : '';

  const verificationRecord = await prisma.emailVerification.create({
    data: {
      email: normalized,
      otpHash,
      name,
      companyName,
      passwordHash,
      expiresAt,
      lastSentAt: new Date(),
      resendCount: recent ? recent.resendCount + 1 : 1,
    },
  });

  try {
    await sendVerificationEmail(normalized, otp);
  } catch (err) {
    await prisma.emailVerification.update({ where: { id: verificationRecord.id }, data: { used: true } }).catch(() => {});
    throw err;
  }

  return { message: 'Verification code resent' };
}

// Login with Workspace token payload and Session logging
async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required.');
    err.status = 400;
    throw err;
  }
  if (!isValidPassword(password)) {
    const err = new Error('Password requirements not met. Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { workspace: true } });
  if (!user) {
    const err = new Error('No account found with this email.');
    err.status = 404;
    throw err;
  }

  if (user.isActive === false) {
    const err = new Error('Your account has been deactivated.');
    err.status = 403;
    throw err;
  }

  if (user.workspace && user.workspace.status === 'SUSPENDED') {
    const err = new Error('Workspace is suspended. Access denied. Please contact platform administrator.');
    err.status = 403;
    err.code = 'WORKSPACE_SUSPENDED';
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Incorrect password');
    err.status = 401;
    throw err;
  }

  const workspaceId = user.workspaceId;
  const payload = { userId: user.id, role: user.role, workspaceId };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

  // Record active login session
  await prisma.session.create({ data: { userId: user.id } });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId,
      workspaceName: user.workspace?.name,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh({ token }) {
  if (!token) {
    const err = new Error('Refresh token is required');
    err.status = 401;
    throw err;
  }

  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record || record.revoked) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    const err = new Error('Refresh token expired');
    err.status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { role: true, workspaceId: true } });
  const payload = { userId: record.userId, role: user?.role, workspaceId: user?.workspaceId };

  const accessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });

  await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: record.userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout({ token }) {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (record) {
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
  }
  return true;
}

async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return true;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
  return { token };
}

async function resetPassword({ token, newPassword }) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.used) throw new Error('Invalid or used token');
  if (record.expiresAt < new Date()) throw new Error('Token expired');
  if (!isValidPassword(newPassword)) {
    const err = new Error('Password requirements not met. Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
    err.status = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });
  await prisma.refreshToken.updateMany({ where: { userId: record.userId, revoked: false }, data: { revoked: true } });
  return true;
}

async function getProfile({ userId }) {
  if (!userId) throw new Error('Missing user id');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, workspaceId: true, workspace: { select: { id: true, name: true } }, createdAt: true, updatedAt: true },
  });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

async function changePassword({ userId, currentPassword, newPassword }) {
  if (!userId) throw new Error('Missing user id');
  if (!currentPassword || !newPassword) throw new Error('Current password and new password are required');
  if (!isValidPassword(newPassword)) {
    const err = new Error('Password requirements not met. Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
    err.status = 400;
    throw err;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Incorrect current password');
    err.status = 401;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
  return true;
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
  getProfile,
  changePassword,
};
