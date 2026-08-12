import api from './api';

export async function register(payload) {
  const resp = await api.post('/auth/register', payload);
  return resp.data.data;
}

export async function login(credentials) {
  const resp = await api.post('/auth/login', credentials);
  return resp.data.data;
}

export async function refresh(refreshToken) {
  const resp = await api.post('/auth/refresh', { refreshToken });
  return resp.data.data;
}

export async function logout(refreshToken) {
  const resp = await api.post('/auth/logout', { refreshToken });
  return resp.data;
}

export async function forgotPassword(email) {
  const resp = await api.post('/auth/forgot-password', { email });
  return resp.data.data;
}

export async function resetPassword(token, newPassword) {
  const resp = await api.post('/auth/reset-password', { token, newPassword });
  return resp.data;
}

// Get current authenticated user's profile
export async function getProfile() {
  const resp = await api.get('/auth/me');
  return resp.data.data;
}

// Change password for current user
export async function changePassword(payload) {
  // payload: { currentPassword, newPassword }
  const resp = await api.post('/auth/change-password', payload);
  return resp.data;
}

export async function verifyEmail(payload) {
  // payload: { email, otp }
  const resp = await api.post('/auth/verify-email', payload);
  return resp.data.data;
}

export async function resendVerification(payload) {
  // payload: { email }
  const resp = await api.post('/auth/resend-verification', payload);
  return resp.data.data;
}
