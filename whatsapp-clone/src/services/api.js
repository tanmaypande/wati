import axios from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from './tokenService';
import { refresh as refreshAuth } from './authApi';
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 10000,
});
// Attach token from tokenService if present
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});
// Response interceptor to handle 401 by attempting refresh
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const currentRefresh = getRefreshToken();

          if (!currentRefresh) {
          clearTokens();
          isRefreshing = false;
          return Promise.reject(error);
          }

refreshPromise = refreshAuth(currentRefresh)
            .then((data) => {
              setAccessToken(data.accessToken);
              setRefreshToken(data.refreshToken);
              return data.accessToken;
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } catch (err) {
        clearTokens();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
export default api;
