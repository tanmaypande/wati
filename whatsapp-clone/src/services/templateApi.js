import api from './api';

export async function getTemplates() {
  const resp = await api.get('/templates');
  return resp.data.data;
}

export async function getTemplate(id) {
  const resp = await api.get(`/templates/${id}`);
  return resp.data.data;
}

export async function createTemplate(payload) {
  const resp = await api.post('/templates', payload);
  return resp.data.data;
}

export async function updateTemplate(id, payload) {
  const resp = await api.put(`/templates/${id}`, payload);
  return resp.data.data;
}

export async function deleteTemplate(id) {
  const resp = await api.delete(`/templates/${id}`);
  return resp.data;
}
