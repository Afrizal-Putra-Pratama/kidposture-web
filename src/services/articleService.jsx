// src/services/articleService.js
import api from '../utils/axios';

export const articleService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get articles with filters
  getArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Get article by slug
  getArticleBySlug: async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data;
  }
};