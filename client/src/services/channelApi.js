import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const channelApi = {
	list: async () => {
		const response = await axios.get(`${API_BASE_URL}/channels`);
		return response.data;
	}
};

export default channelApi;
