import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let memoryAccessToken = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token || null;
};

export const getAccessToken = () => memoryAccessToken;

const isAuthEndpoint = (url = '') =>
  /\/auth\/(login|register|refresh|logout|verify-otp|resend-otp|me)/.test(url);

let refreshChain = null;

api.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    if (status !== 401 || original._retry || isAuthEndpoint(original.url || '')) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshChain) {
        refreshChain = api.post('/auth/refresh').finally(() => {
          refreshChain = null;
        });
      }
      const refreshed = await refreshChain;
      const nextToken = refreshed?.data?.data?.accessToken;
      if (nextToken) setAccessToken(nextToken);
      return api(original);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
