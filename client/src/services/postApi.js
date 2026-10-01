import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export const postApi = {
  getStats: async () => {
    const response = await client.get('/posts/stats');
    return response.data;
  },

  getInsights: async (days = 14) => {
    const response = await client.get('/reports/insights', { params: { days } });
    return response.data;
  },

  getChannels: async () => {
    const response = await client.get('/channels');
    return response.data;
  },

  createPost: async (post) => {
    const response = await client.post('/posts', post);
    return response.data;
  },

  uploadMedia: async (formData) => {
    const response = await client.post('/media', formData);
    return response.data;
  },

  getPostsList: async ({ page = 1, limit = 10, status = 'all', pageId = 'all' } = {}) => {
    const response = await client.get('/posts', {
      params: { page, limit, status, pageId }
    });
    return response.data;
  },

  bulkUpload: async (formData) => {
    const response = await client.post('/posts/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  templateUrl: `${API_BASE_URL}/posts/template`,

  triggerPostNow: async (postId) => {
    const response = await client.post(`/posts/${postId}/publish-now`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await client.delete(`/posts/${postId}`);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await client.put(`/posts/${postId}`, postData);
    return response.data;
  }
};

export default postApi;