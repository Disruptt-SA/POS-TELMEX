import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ItemsApi from '../apis/ItemsApi'

export const useItemsStore = defineStore('items', () => {
	let itemsList = ref([]);
	let itemsListFilter = ref()
	let inventoryItemsList = ref([]);
	let itemInfo = ref();

	const syncItems = async () => {
		try {
			const { data } = await ItemsApi.SyncItems()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const syncKitItems = async () => {
		try {
			const { data } = await ItemsApi.SyncKitItems()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const syncInventorys = async () => {
		try {
			const { data } = await ItemsApi.GetInventorys()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListItems = async () => {
		try {
			const { data } = await ItemsApi.GetItems()
			//itemsList.value = data.data;
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListItemsWithCategory = async (categoryId) => {
		try {
			const { data } = await ItemsApi.GetItemsWithCategory(categoryId)
			//itemsList.value = data.data;
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListInventoryItems = async (store_id) => {
		try {
			let offset = 0
			let hasMore = true
			let inventory_obj = []

			const { data } = await ItemsApi.GetInventoryItems(store_id, offset)
			inventoryItemsList.value = data.data

			/* while (hasMore) {
				try {
					const { data } = await ItemsApi.GetInventoryItems(store_id, offset)
					if(data.data.length === 0){
						hasMore = false
						return false
					}
					inventory_obj = inventory_obj.concat(data.data)
				} catch (error) {
					console.error("Ocurrio un error al obtener el inventario de la tienda", error.message)
				} finally{
					offset += 1000
				}
			}
			inventoryItemsList.value = inventory_obj */
		} catch (error) {
			console.log(error)
			inventoryItemsList.value = []
		}
	}

	const getListInventoryItem = async (searchtext) => {
		const { data } = await ItemsApi.GetInventoryItem(searchtext)
		inventoryItemsList.value = data.data
		return data
	}

	const getListInventoryItemsFilter = async (store_id) => {
		try {
			const { data } = await ItemsApi.GetInventoryItems(store_id)
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	const getItemInfo = async (internalid) => {
		try {
			const { data } = await ItemsApi.GetItemInfoWithId(internalid)
			itemInfo.value = data.data;
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getItemInfoStock = async (internalid) => {
		try {
			const { data } = await ItemsApi.GetItemInfoStockLocation(internalid)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getItemPrices = async (internalid) => {
		try {
			const { data } = await ItemsApi.GetItemPrices(internalid)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const syncItemsPrices = async () => {
		try {
			const { data } = await ItemsApi.SyncItemPrices()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const searchItemSale = async (searchtext, formsearch) => {
		try {
			let bodySearch = {
				nombre: "",
				codigo_upc: "",
				tipo: formsearch.tipo,
				marca_id: formsearch.marca_id,
				submarca_id: formsearch.submarca_id
			}

			console.log("isNan",searchtext)

			if(!isNaN(searchtext)){
				bodySearch.codigo_upc = searchtext
			}else{
				bodySearch.nombre = searchtext
			}

			console.log("bODYSEARCH", bodySearch)

			const { data } = await ItemsApi.SearchItemSale(bodySearch)
			inventoryItemsList.value = data.data
			return data
		} catch (error) {
			console.log("error al buscar articulo", error)
		}
	}

	const GetBrands = async () => {
		try {
			const { data } = await ItemsApi.GetBrands()
			return data
		} catch (error) {
			console.error("Error al obtener las marcas", error)
		}
	}

	const GetSubBrands = async () => {
		try {
			const { data } = await ItemsApi.GetSubBrands()
			return data
		} catch (error) {
			console.error("Error al obtener las marcas", error)
		}
	}

	const getCategories = async () => {
		try {
			const { data } = await ItemsApi.GetCategories()
			//itemsList.value = data.data;
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		itemsList,
		itemsListFilter,
		inventoryItemsList,
		itemInfo,
		syncItems,
		syncKitItems,
		syncInventorys,
		getListItems,
		getListItemsWithCategory,
		getListInventoryItems,
		getListInventoryItem,
		getListInventoryItemsFilter,
		getItemInfo,
		getItemInfoStock,
		getItemPrices,
		syncItemsPrices,
		searchItemSale,
		GetBrands,
		GetSubBrands,
		getCategories
	}
})
