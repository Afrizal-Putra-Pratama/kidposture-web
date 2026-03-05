// src/services/physioArticleService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://posturely.infinityfree.me/api';

// Interceptor untuk auth token
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const physioArticleService = {
  /**
   * Get all articles created by physiotherapist
   */
  getAll: async () => {
    const response = await api.get('/physio/articles');
    return response.data.data;
  },

  /**
   * Get single article by ID (for edit)
   */
  getById: async (id) => {
    const response = await api.get(`/physio/articles/${id}`);
    return response.data.data;
  },

  /**
   * Create new article
   * @param {FormData} formData - Article data with thumbnail
   */
  create: async (formData) => {
    const response = await api.post('/physio/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update existing article
   * @param {number} id - Article ID
   * @param {FormData} formData - Updated article data
   */
  update: async (id, formData) => {
    // Laravel doesn't support PUT/PATCH with FormData directly
    // Use POST with _method override
    formData.append('_method', 'PUT');
    const response = await api.post(`/physio/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete article
   */
  delete: async (id) => {
    const response = await api.delete(`/physio/articles/${id}`);
    return response.data;
  },
};

export default physioArticleService;
