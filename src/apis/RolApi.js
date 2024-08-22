import api from '../libs/axios';

export default {
	SyncRol() {
		return api.get('/rol/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	}
}