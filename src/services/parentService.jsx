import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://kidposture-api.test/api';

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
