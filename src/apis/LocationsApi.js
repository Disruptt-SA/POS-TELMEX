import api from '../libs/axios';

export default {
	SyncLocations() {
		return api.get('/location/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetLocations() {
		return api.get('/location', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}