import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const authApi = {
  status: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/status`, { withCredentials: true });
    return response.data;
  },
  me: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
    return response.data;
  },
  logout: async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    return response.data;
  },
  loginWithFacebookToken: async (token) => {
    const response = await axios.post(`${API_BASE_URL}/auth/facebook-token`, { token }, { withCredentials: true });
    return response.data;
  },
  loginDirect: async ({ id, name }) => {
    const response = await axios.post(`${API_BASE_URL}/auth/facebook-direct`, { id, name }, { withCredentials: true });
    return response.data;
  },
  saveMetaConfig: async ({ appId, appSecret }) => {
    const response = await axios.post(`${API_BASE_URL}/auth/save-meta-config`, { appId, appSecret }, { withCredentials: true });
    return response.data;
  },
  facebookLoginUrl: `${API_BASE_URL}/auth/facebook`
};

export default authApi;
