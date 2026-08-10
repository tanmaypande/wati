import api from './api';

export async function createBroadcast(payload) {
  const resp = await api.post('/broadcasts', payload);
  return resp.data.data;
}

export async function listBroadcasts() {
  const resp = await api.get('/broadcasts');
  return resp.data.data;
}

export async function getBroadcast(id) {
  const resp = await api.get(`/broadcasts/${id}`);
  return resp.data.data;
}
