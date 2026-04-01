// src/services/parentService.jsx
import api from '../utils/axios';

export const parentService = {
  getChildrenWithSummary: async () => {
    const response = await api.get('/children');
    return response.data;
  },
};