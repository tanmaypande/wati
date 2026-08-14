import api from './api';

export async function getPlatformOverview() {
  const response = await api.get('/super-admin/dashboard/stats');
  return response.data.data;
}

export async function listWorkspaces(params = {}) {
  const response = await api.get('/super-admin/workspaces', { params });
  return response.data.data;
}

export async function createCompany(data) {
  const response = await api.post('/super-admin/workspaces', data);
  return response.data.data;
}

export async function getWorkspaceDetail(workspaceId) {
  const response = await api.get(`/super-admin/workspaces/${workspaceId}`);
  return response.data.data;
}

export async function updateWorkspaceStatus(workspaceId, status) {
  const response = await api.patch(`/super-admin/workspaces/${workspaceId}/status`, { status });
  return response.data;
}

export async function createWorkspaceAdmin(workspaceId, data) {
  const response = await api.post(`/super-admin/workspaces/${workspaceId}/admins`, data);
  return response.data.data;
}

export async function listPlatformUsers(params = {}) {
  const response = await api.get('/super-admin/users', { params });
  return response.data.data;
}

export async function toggleUserActive(userId, isActive) {
  const response = await api.patch(`/super-admin/users/${userId}/active`, { isActive });
  return response.data.data;
}

export async function getAuditLogs(params = {}) {
  const response = await api.get('/super-admin/audit-logs', { params });
  return response.data.data;
}

export async function getSystemHealth() {
  const response = await api.get('/super-admin/health');
  return response.data.data;
}
