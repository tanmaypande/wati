import api from './api';

export async function listContacts(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const resp = await api.get(`/contacts${query.toString() ? `?${query.toString()}` : ''}`);
  return resp.data.data;
}

export async function createContact(payload) {
  const resp = await api.post('/contacts', payload);
  return resp.data.data;
}

export async function updateContact(id, payload) {
  const resp = await api.put(`/contacts/${id}`, payload);
  return resp.data.data;
}

export async function deleteContact(id) {
  const resp = await api.delete(`/contacts/${id}`);
  return resp.data;
}

export async function previewImportContacts(file) {
  const formData = new FormData();
  formData.append('file', file);
  const resp = await api.post('/contacts/import/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return resp.data.data;
}

export async function executeImportContacts(contacts) {
  const resp = await api.post('/contacts/import', { contacts });
  return resp.data.data;
}
