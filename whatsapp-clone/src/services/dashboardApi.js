import api from './api';

export async function fetchOverview() {
  const resp = await api.get('/dashboard/overview');
  return resp.data.data;
}

export async function fetchRecent(limit = 10) {
  const resp = await api.get(`/dashboard/recent?limit=${limit}`);
  return resp.data.data;
}

export async function fetchMessagesChart(days = 7) {
  const resp = await api.get(`/dashboard/messages-chart?days=${days}`);
  return resp.data.data;
}
