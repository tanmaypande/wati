import axios from 'axios';
import { getAccessToken } from './tokenService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/super-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getPlatformOverview() {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
}

export async function listWorkspaces(params = {}) {
  const response = await api.get('/workspaces', { params });
  return response.data.data;
}

export async function createCompany(data) {
  const response = await api.post('/workspaces', data);
  return response.data.data;
}

export async function getWorkspaceDetail(workspaceId) {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data.data;
}

export async function updateWorkspaceStatus(workspaceId, status) {
  const response = await api.patch(`/workspaces/${workspaceId}/status`, { status });
  return response.data;
}

export async function createWorkspaceAdmin(workspaceId, data) {
  const response = await api.post(`/workspaces/${workspaceId}/admins`, data);
  return response.data.data;
}

export async function listPlatformUsers(params = {}) {
  const response = await api.get('/users', { params });
  return response.data.data;
}

export async function toggleUserActive(userId, isActive) {
  const response = await api.patch(`/users/${userId}/active`, { isActive });
  return response.data.data;
}

export async function getAuditLogs(params = {}) {
  const response = await api.get('/audit-logs', { params });
  return response.data.data;
}

export async function getSystemHealth() {
  const response = await api.get('/health');
  return response.data.data;
}
