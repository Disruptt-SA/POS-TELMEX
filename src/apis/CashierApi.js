import api from '../libs/axios';


export default {
	CloseCashier(body) {
		return api.post('/cash/create', body, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	}
}