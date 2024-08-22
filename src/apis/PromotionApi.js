import api from '../libs/axios';

export default {
	syncPromotions() {
		return api.get('/promotions/sync/from-netsuite', data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	syncArticlesPromotions() {
		return api.get('/promotions/sync/articles/from-netsuite', data, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	getPromotions(){
		return api.get('/promotions', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	applyPromotion(body){
		return api.post('/promotions/apply', body, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}