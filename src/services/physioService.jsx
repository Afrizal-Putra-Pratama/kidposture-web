import api from '../utils/axios';

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

  getProfile: async () => {
    const response = await api.get('/physio/profile');
    return response.data.data;
  },

  updateProfile: async (formData) => {
    const response = await api.post('/physio/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  search: async (params) => {
    const response = await api.get('/physiotherapists', { params });
    return response.data.data || [];
  },
};

export default physioService;