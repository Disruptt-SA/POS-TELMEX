import api from '../libs/axios';

export default {
	CreateSale(sale) {
		return api.post('/sales/create', sale, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetSales() {
		return api.get('/sales', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetSalesById(saleid) {
		return api.get(`/sales/${saleid}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	createPaymentsSale(paymentObj){
		return api.post('/sales/payment/create', paymentObj, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}