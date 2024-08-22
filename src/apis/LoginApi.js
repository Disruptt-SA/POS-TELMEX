import api from '../libs/axios';

export default {
	login(data) {
		return api.post('/login', data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}