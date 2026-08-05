const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Fail fast if main JWT secret is missing
if (!process.env.JWT_SECRET) {
  console.error('Missing required JWT_SECRET environment variable. Exiting.');
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  console.warn('JWT_REFRESH_SECRET not set — falling back to JWT_SECRET. It is recommended to set a separate refresh secret in production.');
}

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Refresh tokens include a jti claim to help with rotation and DB correlation
function signRefreshToken(payload) {
  const refreshPayload = Object.assign({}, payload, { jti: payload.jti || randomUUID() });
  return jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
