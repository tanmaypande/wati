import api from './api';

export async function listWorkspaceAgents() {
  const resp = await api.get('/agents');
  return resp.data.data;
}

export async function createWorkspaceAgent(payload) {
  const resp = await api.post('/agents', payload);
  return resp.data.data;
}

export async function deleteWorkspaceAgent(id) {
  const resp = await api.delete(`/agents/${id}`);
  return resp.data;
}
