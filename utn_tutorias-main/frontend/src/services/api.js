import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('utn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de respuestas / errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.expired) {
      localStorage.removeItem('utn_token');
      localStorage.removeItem('utn_user');
      window.location.href = '/login?expired=true';
      
    }
    return Promise.reject(error);
  }
);

export default api;
