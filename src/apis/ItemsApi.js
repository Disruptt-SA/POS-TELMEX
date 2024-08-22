import api from '../libs/axios';

export default {
	SyncItems() {
		return api.get('/article/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	SyncKitItems() {
		return api.get('/article/kit/sync', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetItems() {
		return api.get('/article?limit=10&offset=0', {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetItemsWithCategory(categoryId) {
		return api.get(`/article/articlecategory/${categoryId}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetInventoryItems(store_id, offset) {
		return api.get(`/article/inventory/${store_id}?limit=30000&offset=${offset}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetInventoryItem(searchtext) {
		return api.get(`/article/id/${searchtext}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetInventorys() {
		return api.get(`/inventory/sync`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	GetItemInfoWithId(internalid) {
		return api.get(`/article/id/${internalid}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetItemInfoStockLocation(internalid) {
		return api.get(`/article/stock/location/${internalid}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetItemPrices(itemid) {
		return api.get(`/article/prices/${itemid}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	SyncItemPrices() {
		return api.get(`/price/sync`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			},
			params: {
				"truncated": true
			}
		})
	},
	SearchItemSale(bodySearch){
		return api.post(`/article/search?limit=100&offset=0`, bodySearch, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetBrands(bodySearch){
		return api.get(`/article-brand`, bodySearch, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetSubBrands(bodySearch){
		return api.get(`/article-subbrand`, bodySearch, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	},
	GetCategories(){
		return api.get(`/article/categories`, {
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
	}
}