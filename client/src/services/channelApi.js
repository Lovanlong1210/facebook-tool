import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const channelApi = {
  list: async () => {
    const response = await axios.get(`${API_BASE_URL}/channels`, { withCredentials: true });
    return response.data;
  },
  sync: async () => {
    const response = await axios.post(`${API_BASE_URL}/channels/sync`, {}, { withCredentials: true });
    return response.data;
  },
  add: async (pageData) => {
    const response = await axios.post(`${API_BASE_URL}/channels/add`, pageData, { withCredentials: true });
    return response.data;
  },
  remove: async (pageId) => {
    const response = await axios.delete(`${API_BASE_URL}/channels/${pageId}`, { withCredentials: true });
    return response.data;
  },
  updateToken: async (pageId, pageToken) => {
    const response = await axios.put(`${API_BASE_URL}/channels/${pageId}/token`, { pageToken }, { withCredentials: true });
    return response.data;
  },
  verifyToken: async (token, pageId) => {
    const response = await axios.post(`${API_BASE_URL}/channels/verify-token`, { token, pageId }, { withCredentials: true });
    return response.data;
  },
  syncWithToken: async (token) => {
    const response = await axios.post(`${API_BASE_URL}/channels/sync-with-token`, { token }, { withCredentials: true });
    return response.data;
  }
};

export default channelApi;
