import api from '../libs/axios';

export default {
	SyncSubsidiary() {
		return api.get('/subsidiary/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	}
}