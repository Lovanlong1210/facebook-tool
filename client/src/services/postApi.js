import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const postApi = {
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/posts/stats`);
    return response.data;
  },

  getInsights: async (days = 14) => {
    const response = await axios.get(`${API_BASE_URL}/reports/insights`, { params: { days } });
    return response.data;
  },

  getChannels: async () => {
    const response = await axios.get(`${API_BASE_URL}/channels`);
    return response.data;
  },

  createPost: async (post) => {
    const response = await axios.post(`${API_BASE_URL}/posts`, post);
    return response.data;
  },

  uploadMedia: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/media`, formData);
    return response.data;
  },

  // 1. Lấy danh sách bài đăng có bộ lọc & phân trang
  getPostsList: async ({ page = 1, limit = 10, status = 'all', pageId = 'all' } = {}) => {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params: { page, limit, status, pageId }
    });
    return response.data;
  },

  // 2. Upload file Excel bài đăng
  bulkUpload: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/posts/bulk-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  templateUrl: `${API_BASE_URL}/posts/template`,

  // 3. Kích hoạt đăng ngay cho 1 bài viết cụ thể
  triggerPostNow: async (postId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/${postId}/publish-now`);
    return response.data;
  },

  // 4. Xóa bài đăng khỏi hệ thống
  deletePost: async (postId) => {
    const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  }
};

export default postApi;