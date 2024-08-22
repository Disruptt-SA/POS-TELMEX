import api from '../libs/axios';

export default {
	SyncUnits(sale) {
		return api.get('/units/sync', sale, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetUnits() {
		return api.get('/units', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}