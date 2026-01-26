import axios from 'axios';

const api = axios.create({
  baseURL: 'http://kidposture-api.test/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const physioService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.specialty) params.append('specialty', filters.specialty);

    const query = params.toString();
    const url = query ? `/physiotherapists?${query}` : `/physiotherapists`;

    const response = await api.get(url);
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/physiotherapists/${id}`);
    return response.data.data;
  },
};

export default physioService;
