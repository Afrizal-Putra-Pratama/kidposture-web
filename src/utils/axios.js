import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/map', '/login', '/register','/education'];
      const currentPath = window.location.pathname;
      const isPublic = publicPaths.some(path =>
      currentPath === path || 
      currentPath.startsWith('/register') ||
      currentPath.startsWith('/education') 
      );
      if (!isPublic) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function toProxiedUrl(url) {
  if (!url) return null;
  return url; 
}

export default api;