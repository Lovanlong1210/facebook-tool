import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const aiApi = {
	status: async () => {
		const response = await axios.get(`${API_BASE_URL}/ai/status`);
		return response.data;
	},

	chat: async (message, history = []) => {
		const response = await axios.post(`${API_BASE_URL}/ai/chat`, { message, history });
		return response.data;
	}
};

export default aiApi;
