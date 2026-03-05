import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://posturely.infinityfree.me/api';

export const parentService = {
  getChildrenWithSummary: async (token) => {
    const response = await axios.get(`${API_URL}/children`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
