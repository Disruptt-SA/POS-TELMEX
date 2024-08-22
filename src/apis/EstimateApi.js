import api from '../libs/axios';

export default {
	CreateEstimate(sale) {
		return api.post('/estimates/create', sale, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetEstimates() {
		return api.get('/estimates', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
}