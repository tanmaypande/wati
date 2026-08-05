import api from './api';

export async function listConversations(q = '') {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  const resp = await api.get(`/conversations${query}`);
  return resp.data.data;
}

export async function createConversation(payload) {
  const resp = await api.post('/conversations', payload);
  return resp.data.data;
}

export async function getConversation(id) {
  const resp = await api.get(`/conversations/${id}`);
  return resp.data.data;
}

export async function closeConversation(id) {
  const resp = await api.patch(`/conversations/${id}/close`);
  return resp.data.data;
}

export async function assignAgent(id, assignedToId) {
  const resp = await api.patch(`/conversations/${id}/assign`, { assignedToId });
  return resp.data.data;
}

export async function listAgents() {
  const resp = await api.get('/conversations/agents');
  return resp.data.data;
}
