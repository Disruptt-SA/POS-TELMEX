import api from '../libs/axios';

export default {
	SyncReasons() {
		return api.get(`/rma-types/sync`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetReasons() {
		return api.get('/rma-types', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	createRMA(obj_return) {
		return api.post('/rma', obj_return , {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetRmas() {
		return api.get('/rma', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	UpdateRmaItemReceipt(idRma) {
		return api.put(`/rma/receipt-item/${idRma}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	UpdateRmaStatus(idRma, objRma) {
		return api.put(`/rma/change-status/${idRma}`,objRma, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	createCreditMemo(rmaId) {
		return api.post('/createCreditMemo', {rmaId: rmaId} , {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	TimbrarRMA(ncId){
		return api.post(`/timbrarDocumento/`, {ncId:ncId}, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	getRmaById(rmaid){
		return api.get(`/rma/${rmaid}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}