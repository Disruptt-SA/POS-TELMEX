import api from '../libs/axios';

export default {
	SyncCfdi() {
		return api.get('/cfdi/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetCfdi() {
		return api.get('/cfdi', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
}