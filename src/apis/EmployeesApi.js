import api from '../libs/axios';

export default {
	SyncEmployee(data) {
		return api.get('/employees/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetEmployees() {
		return api.get('/employee', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}