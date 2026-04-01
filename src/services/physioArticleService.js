// src/services/physioArticleService.js
import api from '../utils/axios';

const physioArticleService = {
  getAll: async () => {
    const response = await api.get('/physio/articles');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/physio/articles/${id}`);
    return response.data.data;
  },

  create: async (formData) => {
    const response = await api.post('/physio/articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    formData.append('_method', 'PUT');
    const response = await api.post(`/physio/articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/physio/articles/${id}`);
    return response.data;
  },
};

export default physioArticleService;