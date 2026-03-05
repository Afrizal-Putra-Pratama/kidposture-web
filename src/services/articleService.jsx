// src/services/articleService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://posturely.infinityfree.me/api';

export const articleService = {
  // Get all categories
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  },

  // Get articles with filters
  getArticles: async (params = {}) => {
    const response = await axios.get(`${API_URL}/articles`, { params });
    return response.data;
  },

  // Get article by slug
  getArticleBySlug: async (slug) => {
    const response = await axios.get(`${API_URL}/articles/${slug}`);
    return response.data;
  }
};
