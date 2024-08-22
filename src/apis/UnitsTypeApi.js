import api from '../libs/axios';

export default {
	SyncUnitsType() {
		return api.get('/unitstype/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetUnitsType() {
		return api.get('/unitstype', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}