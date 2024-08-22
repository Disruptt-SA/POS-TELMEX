import api from '../libs/axios';

export default {
	SyncCustomers() {
		return api.get('/customers/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetCustomers() {
		return api.get('/customer', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetCustomersWithId(customerId) {
		return api.get(`/customer/${customerId}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetCustomersWithObj(body) {
		return api.post(`/customer/search`, body, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetCustomersDirections(customerId) {
		return api.get(`/direction/customer/${customerId}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	SyncDirections() {
		return api.get('/direction/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	saveNewClientApi(data) {
		return api.post('/customer/create', data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	saveNewAddresstApi(data) {
		return api.post('/direction/create', data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	updateAddressApi(id, data) {
		return api.put(`/direction/${id}`, data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	updateClientApi(customerId, data) {
		return api.put(`/customer/${customerId}`, data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	PaymentTerm() {
		return api.get('/payment-method', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	FormPayment() {
		return api.get('/payment-term', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
}