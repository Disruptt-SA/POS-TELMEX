import api from '../libs/axios';

export default {
	SyncCountry() {
		return api.get('/country/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetCountry() {
		return api.get('/country', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
}