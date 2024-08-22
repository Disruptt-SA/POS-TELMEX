import api from '../libs/axios';

export default {
	GetInvoices() {
		return api.get('/invoices', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetInvoiceByiD(id) {
		return api.get(`/invoices/${id}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	TimbrarInvoice(invoiceId){
		return api.post(`/timbrarDocumento/`, {facturaId:invoiceId}, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetInvoiceDueCustomer(customerId){
		return api.get(`/customer-payments/invoices-due/${customerId}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	CreateCreditPayments(objDues){
		return api.post(`/customer-payments/create`, objDues, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}