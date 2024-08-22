<script setup>
import { onMounted, onUpdated, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useItemsStore } from '../../stores/items';
import { useCustomersStore } from '../../stores/customer';
import { useSaleStore } from '../../stores/sale';
import { useUnitsStore } from '../../stores/units';
import { usePromotionsStore } from '../../stores/promotions';
import { useLoginStore } from '../../stores/login';
import { useLocationsStore } from '../../stores/locations';
import moment from 'moment';
import JsBarcode from 'jsbarcode';
import posLogo from '../../assets/pos_logo.png';

//components
import Loader from '../../components/Loader.vue';

//Variables
const toast = inject('toast')
const user_info = ref({})
const menuStore = useMenuStore()
const loader_sale = ref(false)
const itemsStore = useItemsStore()
const customerStore = useCustomersStore()
const locationsStore = useLocationsStore();
const saleStore = useSaleStore()
const unitsStore = useUnitsStore()
const promotionsStore = usePromotionsStore()
const loginStore = useLoginStore();
const showItemSearch = ref(false)
const inpSearchItem = ref("")
const inpSearchClient = ref("")
const showTicket = ref(false)
const listFilterItems = ref()
const listFilterClients = ref()
const msgFilterItem = ref("")
const shoppingItems = ref([])
const modalSearchClient = ref(false)
const today_date = ref(new Date().toLocaleDateString('en-GB'))
const objSale = ref({
	trandate: new Date(),
	trantype: "sale",
	sellername: "",
	client: {
		internalid: "",
		companyname: "",
		denviodefecto: "",
		dfacturaciondefecto: ""
	},
	currency: "MXN",
	promo: "",
	itemsquantity: 0,
	subtotal: 0,
	taxes: 0,
	discounts: [],
	total: 0,
	sellerid: 0
})
const newObjSale = ref({
	trantype: "sale",
	externalid:"",
	id_seller:"",
	id_cashier:"",
	id_customer:"",
	id_direccion_envio:"",
	id_direccion_facturacion:"",
	status_sale:"",
	trandate:new Date(),
	articles:[]
})
const objSearchClient = ref([])
const objClientAddress = ref([])
const itemsFilter = ref([])
const txt_estimation = ref("")
const loaderSearch = ref(false)
const promotionsData = ref([])
const txtPromotions = ref("")
const loader_search_client = ref(false)
const modalLevelProbation = ref(false)
const txtIndexLevelPrice = ref("")
const formSupervisor = ref({
	user: "",
	password: ""
})
const obj_promo_codes = ref([])
const block_search_estimation = ref(false)
const modalshowComponents = ref(false)
const infoArticleKit = ref({})
const estimateModal = ref(false)
const fecha_minimo = ref("2000-01-02")

const apply_promotion = ref({})
const promo_codes = ref([])
const loadPromotions = ref(false)
const respPromotions = ref({})
const datosPaginados = ref([])

//promotions
const objShoppingListPromotions = ref([])
const validatePromotions = ref(false)
const showValidatePromotions = ref(false)

//methods
onMounted(async () => {
	user_info.value = JSON.parse(localStorage.USER_INFO);
	showTicket.value = false;
	fecha_minimo.value = getTodayDate();
	console.log("fecha_minimo", fecha_minimo.value)
	//listFilterItems.value = await itemsStore.inventoryItemsList;
	listFilterClients.value = await customerStore.getListCustomers();
	promotionsData.value = await promotionsStore.getPromotions();
	objSale.value.id_user_pos = user_info.value.internalid
	console.log("promotions", promotionsData.value)
})

const reset_search_estimation = () => {
	block_search_estimation.value = false
	txt_estimation.value = ""
	shoppingItems.value = []
	recalculate()
}

const handleModalSelectEstimate = () => {
	estimateModal.value = !estimateModal.value
}

const handleModalValidatePromotions = () => {
	showValidatePromotions.value = !showValidatePromotions.value
}

const handleSelectEstimate = (externalid) => {
	txt_estimation.value = externalid
	search_estimation()
	estimateModal.value = false
	validatePromotions.value = false
	showValidatePromotions.value = false
}

const search_estimation = async() => {
	const obj_estimates = await saleStore.getEstimates()
	let obj_estimate = {}

	obj_estimates.data.forEach(element => {
		if(element.internalid == txt_estimation.value){
			obj_estimate = element
		}
	});

	if(Object.keys(obj_estimate).length === 0){
		toast.open({
			message: `No se encontro la estimacion con el id ${txt_estimation.value}`,
			type: 'warning'
		})
		return false
	}

	console.log("obj_estimate", obj_estimate)

	obj_estimate.EstimateArticles.forEach(async(articles) => {
		const can = Date.now()
		let unist_list = []
		let price_list = []
		let article_obj = {}
		let shop_unit_selected = {}
		let shop_list_selected = {}

		article_obj = await itemsStore.getItemInfo(articles.id_item)
		article_obj = article_obj.data[0]
		unist_list = article_obj.unitlist
		price_list = article_obj.PriceList

		unist_list.forEach(element => {
			if(element.nsid == articles.units){
				shop_unit_selected = element
			}
		});

		if(articles.pricelevel == -1){
			shop_list_selected = -1
		}else{
			price_list.forEach(element => {
				if(element.pricelevel_id == articles.pricelevel){
					shop_list_selected = element
				}
			});
		}

		article_obj.idFront = can
		article_obj.shop_quantity_bag = articles.quiantity
		article_obj.shop_list_price = articles.pricelevel
		article_obj.shop_unit_price = articles.rate
		article_obj.shop_unit_selected = shop_unit_selected
		article_obj.shop_total_price = Number(articles.rate) * Number(articles.quiantity)
		article_obj.shop_list_selected = shop_list_selected
		article_obj.shop_stock = article_obj.inventario[0]?.inventario
		article_obj.delivery_type = articles.delivery_type
		article_obj.delivery_date = articles.delivery_date
		article_obj.shop_units = unist_list

		shoppingItems.value.push(article_obj)
		recalculate()

		console.log("shoppingItems", shoppingItems.value)
	});
	block_search_estimation.value = true
}

/* onUpdated(async () => {
	console.log("cambio en el front")
}) */

const inputItemSearch = () => {
	console.log(inpSearchItem.value.length);
	if (inpSearchItem.value.length <= 0) {
		showItemSearch.value = false
	} else if (inpSearchItem.value.length > 0) {
		showItemSearch.value = true
		filterItem();
	}
}

const validateShowTicket = () => {
	const invalid_item = shoppingItems.value.filter(item => {
		return Number(item.shop_quantity_bag) == 0 || item.shop_quantity_bag == "" 
	})
	console.log('Artículos con cantidad 0 ', invalid_item)
	if (invalid_item.length > 0) {
		toast.open({
			message: `Debe colocar al menos 1 artículo por linea`,
			type: 'error'
		})
		return
	}
	objSale.value.items = shoppingItems.value

	if (Number(objSale.value.total) <= 0) {
		toast.open({
			message: `No se puede generar una venta con ${objSale.value.total} pesos`,
			type: 'error'
		})
		return
	}

	const now = Date.now()
	const numrandom = Math.floor(Math.random() * (999999 - 100000) + 100000)
	let tran_type = "SL"
	if (objSale.value.trantype == "sale") {
		tran_type = "SL"
	} else if (objSale.value.trantype == "estimate") {
		tran_type = "ES"
	}

	objSale.value.items = shoppingItems.value
	objSale.value.id = tran_type + "-" + now + "" + numrandom
	objSale.value.trandate = moment(now).format('DD/MM/YYYY hh:mm:ss');
	objSale.value.sellerid = saleStore.sellerInfo
	objSale.value.sellername = saleStore.sellerName
	JsBarcode("#barcode", objSale.value.id, {
		width:1,
		fontSize:12
	});
	// JsBarcode("#barcode_article", newObjSale.articles.id, {
	// 	width:1,
	// 	fontSize:12
	// });
	showTicket.value = !showTicket.value;
	console.log("venta", objSale.value)
}

const handleShowTicket = () => {
	console.log('objSale.value? ~ handleShowTicket', objSale.value)
	console.log('validatePromotions', validatePromotions.value)
	console.log('promo_codes', promo_codes.value.length)
	if(validatePromotions.value){
		validateShowTicket()
	}else{
		handleModalValidatePromotions()
	}
}

const includesSomeWordsItemsfilter = (original, buscadas) => {
    return buscadas.split(' ').some(p => original.includes(p))
}

const filterItem = async () => {
	let newObj = [];
	let formsearch = {
		tipo: null,
		marca_id: null,
		submarca_id: null
	}
	loaderSearch.value = true
	if(inpSearchItem.value.length <= 0){
		newObj = []
		itemsStore.itemsList = [];
		msgFilterItem.value = "Sin coincidencias";
	}else{
		try {
			const obj_search = await itemsStore.searchItemSale(inpSearchItem.value, formsearch)
			console.log("obj_search", obj_search)
			if(obj_search.data.length > 0){
				newObj = obj_search.data
				newObj.forEach(item => {
					item.inventario.forEach((inv_loc, index) => {
						console.log('validacion? ', 'inv_loc.id_store: '+ inv_loc.id_store + ' user_info.value.location_id: '+ user_info.value.location_id)
						if (inv_loc.id_store != user_info.value.location_id) {
							console.log('inv_loc? ', inv_loc)
							item.inventario.splice(index, 1)
						}
					})
				});
				msgFilterItem.value = "";
				itemsStore.itemsList = newObj;
			}else{
				newObj = []
				itemsStore.itemsList = [];
				msgFilterItem.value = "Sin coincidencias";
			}
			console.log('itemsStore.itemsList? ', itemsStore.itemsList)
			loaderSearch.value = false
		} catch (error) {
			console.error("Error al obtener el articulo", error)
			toast.open({
				message: `No se encontro el articulo`,
				type: 'warning'
			})
			newObj = []
			itemsStore.itemsList = [];
			msgFilterItem.value = "Sin coincidencias";
			loaderSearch.value = false
		}
	}

	/* if (inpSearchItem.value.length <= 0) {
		itemsStore.itemsList = await itemsStore.inventoryItemsList;
	} else {
		itemsStore.inventoryItemsList.filter(obj => {
			let verified = false
			if(includesSomeWordsItemsfilter(obj.upccode.toLowerCase(), inpSearchItem.value.toLowerCase())){
				verified = includesSomeWordsItemsfilter(obj.upccode.toLowerCase(), inpSearchItem.value.toLowerCase())
			}else{
				verified = includesSomeWordsItemsfilter(obj.displayname.toLowerCase(), inpSearchItem.value.toLowerCase())

			}

			if (verified) {
				newObj.push(obj);
			}
		});

		if (newObj.length === 0) {
			msgFilterItem.value = "Sin coincidencias";
			itemsStore.itemsList = await itemsStore.inventoryItemsList;
		} else {
			console.log(newObj);
			msgFilterItem.value = "";
			itemsStore.itemsList = newObj;
		}
	} */
}

const resetPromotions = () => {
	console.log("objSale.value", objSale.value)
	shoppingItems.value.forEach(shoppingList => {
		if(shoppingList.custitem_tipo_articulo == "regalo"){
			handleResetPromotions()
		}
		if(shoppingList.custitem_tipo_articulo == "promo"){
			handleResetPromotions()
		}
	})

	if(objSale.value.discounts.length > 0){
		handleResetPromotions()
	}
	validatePromotions.value = false
	showValidatePromotions.value = false
}

const handleAddItem = (item) => {
	const can = Date.now()

	resetPromotions()

	const itemClone = {...item}

	itemClone.idFront = can
	itemClone.shop_quantity_bag = 1
	itemClone.shop_list_price = itemClone.PriceList[0].pricelevel_id
	itemClone.shop_unit_price = itemClone.PriceList[0].price_unitprice
	itemClone.shop_total_price = itemClone.shop_unit_price * itemClone.shop_quantity_bag
	itemClone.shop_list_selected = itemClone.PriceList[0]
	// user_info.value = JSON.parse(localStorage.USER_INFO);
	// Stock se deja asi por que los kits no traen inventario
	console.log('user_info? ', user_info)
	if (itemClone.custitem_tipo_articulo != "Kit") {
		itemClone.shop_stock = itemClone.inventario.find(loc_inv => {
			return loc_inv.id_store == user_info.value.location_id
		})
		itemClone.shop_stock = itemClone.shop_stock?.inventario || 0
		// itemClone.shop_stock = itemClone.inventario[0]?.inventario
	} else {
		itemClone.shop_stock = 100
	}
	itemClone.delivery_type = 1
	itemClone.deliveryDate =  moment(can).format('YYYY-MM-DD')
	//Resumen de la venta
	objSale.value.itemsquantity = objSale.value.itemsquantity + itemClone.shop_quantity_bag
	objSale.value.total = objSale.value.total + itemClone.shop_total_price
	//objSale.value.taxes = objSale.value.itemsquantity + item.shop_quantity_bag

	let obj_units_filter = []
	let unit_selected = {}

	// console.log('unitsStore.unitsList? ', unitsStore.unitsList)
	if (unitsStore.unitsList != undefined && itemClone.custitem_tipo_articulo != "Kit") {
		if (unitsStore.unitsList.length > 0) {
			obj_units_filter = unitsStore.unitsList.filter((obj) => obj.id_unit_master == itemClone.unitstype)
		}
	}else{
		//Und Medida se ponse así por que son kit y no traen tipo de unidad (itemClone.unitstype)
		obj_units_filter = unitsStore.unitsList.filter((obj) => obj.nsname == "pieza" || obj.nsname == "Pieza")
	}

	for (let value of obj_units_filter) {
		if (value.unit_base) {
			unit_selected = value
		}
	}

	itemClone.shop_units = obj_units_filter
	itemClone.shop_unit_selected = unit_selected
	itemClone.tax_object_id = 2

	shoppingItems.value.push(itemClone)

	console.log("itemClone", itemClone)

	recalculate()

	let index_art = shoppingItems.value.length - 1
	//recalculateItemsPriceLevelClient()
	recalculateItemsPriceLevelArt(index_art)

	inpSearchItem.value = ""
	showItemSearch.value = false
}

const getTodayDate = () => {
	let yourDate = new Date();
	const offset = yourDate.getTimezoneOffset();
	yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000));
	return yourDate.toISOString().split('T')[0]
}

/* const establecerFechaMinima = () => {
	let fecha = new Date()
	let anio = fecha.getFullYear()
	let dia = fecha.getDate()
	let _mes = fecha.getMonth()
	let mes = null
	_mes = _mes + 1

	if (_mes < 10){
		mes = "0" + _mes;
	} else {
		mes = _mes.toString;
	}
	fecha_minimo.value = anio + '-' + mes + '-' + dia
	document.getElementById('fechaEntrega').setAttribute('min', fecha_minimo.value);
} */

const handleRemoveQuantityItem = (index) => {
	resetPromotions()

	const shoppingItem = shoppingItems.value[index]
	if (shoppingItem.shop_quantity_bag > 1) {
		shoppingItem.shop_quantity_bag = shoppingItem.shop_quantity_bag - 1
		shoppingItem.shop_total_price = (shoppingItem.shop_unit_price * shoppingItem.shop_quantity_bag).toFixed(2);
		//resumen de la venta
		objSale.value.itemsquantity = objSale.value.itemsquantity - 1
		recalculate()
		shoppingItems.value[index] = shoppingItem
	} else if (shoppingItem.shop_quantity_bag <= 1) {
		shoppingItem.shop_quantity_bag = shoppingItem.shop_quantity_bag - 1
		shoppingItem.shop_total_price = (shoppingItem.shop_unit_price * shoppingItem.shop_quantity_bag).toFixed(2);
		//resumen de la venta
		objSale.value.itemsquantity = objSale.value.itemsquantity - 1
		recalculate()
		shoppingItems.value.splice(index, 1)
	}
}

const handleAddQuantityItem = (index, cant_item) => {
	console.log('cantidad? ', cant_item)
	resetPromotions()

	const shoppingItem = shoppingItems.value[index]

	if(shoppingItem.custitem_tipo_articulo != 'Kit'){
		if (shoppingItem.shop_quantity_bag < shoppingItem.shop_stock) {
			shoppingItem.shop_quantity_bag = Number(shoppingItem.shop_quantity_bag) + 1
			shoppingItem.shop_total_price = (shoppingItem.shop_unit_price * shoppingItem.shop_quantity_bag).toFixed(2);
			//resumen de la venta
			objSale.value.itemsquantity = Number(objSale.value.itemsquantity) + 1
		}
	}else if(shoppingItem.custitem_tipo_articulo == 'Kit'){
		shoppingItem.shop_quantity_bag = Number(shoppingItem.shop_quantity_bag) + 1
			shoppingItem.shop_total_price = (shoppingItem.shop_unit_price * shoppingItem.shop_quantity_bag).toFixed(2);
			//resumen de la venta
			objSale.value.itemsquantity = Number(objSale.value.itemsquantity) + 1
	}
	shoppingItems.value[index] = shoppingItem
	recalculate()
}

const handleRemoveItem = (index) => {
	let total_articles = 0

	resetPromotions()

	shoppingItems.value.splice(index, 1)
	shoppingItems.value.forEach(article => {
		const quantityItem = article.shop_quantity_bag
		total_articles += quantityItem
	});
	objSale.value.itemsquantity = total_articles
	recalculate()
}

const handleQuantityItem = (index) => {
	resetPromotions()

	const shoppingItem = shoppingItems.value[index]
	const quantity = shoppingItem.shop_quantity_bag
	let shop_unit_price = shoppingItem.shop_unit_price
	let total_articles = 0

	// if(quantity <= 0){
	// 	handleRemoveItem(index)
	// 	return false
	// }

	if(shop_unit_price < 0){
		toast.open({
			message: `El precio del articulo no puede ser menor o igual a 0`,
			type: 'error'
		})
		shop_unit_price = 1
		shoppingItems.value[index].shop_unit_price = shop_unit_price
	}

	shoppingItems.value.forEach(article => {
		const quantityItem = article.shop_quantity_bag

		total_articles += quantityItem
	});

	shoppingItem.shop_total_price = (shoppingItem.shop_unit_price * quantity).toFixed(2);
	objSale.value.itemsquantity = total_articles

	shoppingItems.value[index] = shoppingItem
	recalculate()
}

const recalculate = () => {
	let taxes = 0
	let total = 0
	let subtotal = 0
	let total_items = 0
	for (let item of shoppingItems.value) {
		taxes += Number(item.shop_total_price) * 0.16
		total += Number(item.shop_total_price)
		total_items += item.shop_quantity_bag
	}

	subtotal = Number(total)
	const tax_sale = Number(taxes)
	objSale.value.taxes = Number(taxes)
	objSale.value.subtotal = Number(subtotal)
	objSale.value.taxes = (objSale.value.taxes).toFixed(2)
	objSale.value.subtotal = (objSale.value.subtotal).toFixed(2)
	objSale.value.total = (subtotal + tax_sale).toFixed(2)
	objSale.value.itemsquantity = total_items
}

const handleSearchClient = () => {
	modalSearchClient.value = !modalSearchClient.value
}

const includesSomeWordsClientfilter = (original, buscadas) => {
    return buscadas.split(' ').some(p => original.includes(p))
}

const filterClient = async() => {
	try {
		// user_info.value = JSON.parse(localStorage.USER_INFO);
		loader_search_client.value = true
		console.log('user_info? ', user_info.value)
		const bodySearch = {
			"name" : inpSearchClient.value.toLowerCase(),
			"subsi" : user_info.value.subsidiary_id,
			"withEstimates": true
		}
		console.log('parametros de busqueda de cliente? ', bodySearch)
		const objSearch = await customerStore.getCustomerWithObj(bodySearch)
		console.log('clientes? ', objSearch)
		if(objSearch.data?.length > 0){
			objSearchClient.value = objSearch.data
		}else{
			objSearchClient.value = []
			toast.open({
				message: `No se encontro al cliente`,
				type: 'warning'
			})
		}
		loader_search_client.value = false
	} catch (error) {
		objSearchClient.value = []
		toast.open({
			message: `Error al buscar al cliente <br> ${error}`,
			type: 'error'
		})
		loader_search_client.value = false
	}
}

/* const filterClient = async() => {
	let newObj = [];

	try {
		if (inpSearchClient.value.length <= 0) {
			objSearchClient.value = []
		}else{
			listFilterClients.value.filter(obj => {
				if (obj.companyname != null) {
					const verified = includesSomeWordsClientfilter(obj.companyname.toLowerCase(), inpSearchClient.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
				}else if(obj.firstname != null && obj.lastname != null){
					const verified = includesSomeWordsClientfilter(obj.firstname.toLowerCase() + " " + obj.lastname.toLowerCase(), inpSearchClient.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
				}
			});

			if (newObj.length === 0) {
				console.log("no se encontro al cliente");
				objSearchClient.value = [];
			} else {
				objSearchClient.value = newObj;
			}
		}
	} catch (error) {
		objSearchClient.value = [];
	}
} */

const resetFilterClient = () => {
	objSearchClient.value = []
	inpSearchClient.value = ""
}

const inputClientSearch = () => {
	console.log(inpSearchClient.value.length);
	if (inpSearchClient.value.length <= 0) {
		objSearchClient.value = []
	} else if (inpSearchClient.value.length > 0) {
		filterClient();
	}
}

const handleSelectClient = async (client) => {
	loader_search_client.value = true
	objSale.value.client = client;
	console.log("client", client)

	recalculateItemsPriceLevelClient()
	resetPromotions()

	objClientAddress.value = await customerStore.getCustomerDirections(client.internalid)
	modalSearchClient.value = !modalSearchClient.value
	loader_search_client.value = false
}

const recalculateItemsPriceLevelArt = (index) => {
	if(objSale.value.client){
		const client = objSale.value.client
		if(shoppingItems.value.length > 0){
			const item = shoppingItems.value[index]
			console.log("item", item)
			if(item.custitem_tipo_articulo == "Inventario"){
				item.PriceList.forEach((price) => {
					console.log("price", price)
					if(client.pricelevel == price.pricelevel_id){
						item.shop_list_selected = price
						item.shop_unit_price = price.price_unitprice
						console.log("item", item)
						let nvo_unit_price = Number(item.shop_unit_price) * Number(item.shop_unit_selected.conversion_rate)
						let stock_unit = Number(item.inventario[0].inventario) / Number(item.shop_unit_selected.conversion_rate)
						console.log("nvo_unit_price", nvo_unit_price)
						item.shop_unit_price = (nvo_unit_price).toFixed(2)
						item.shop_stock = Math.floor(stock_unit)
						item.shop_total_price = Number(nvo_unit_price * item.shop_quantity_bag).toFixed(2)
						recalculate()
					}
				})
			}else{
				item.PriceList.forEach((price) => {
					console.log("price", price)
					if(client.pricelevel == price.pricelevel_id){
						item.shop_list_selected = price
						item.shop_unit_price = price.price_unitprice
						console.log("item", item)
						let nvo_unit_price = Number(item.shop_unit_price) * 1
						let stock_unit = 1
						console.log("nvo_unit_price", nvo_unit_price)
						item.shop_unit_price = (nvo_unit_price).toFixed(2)
						item.shop_stock = Math.floor(stock_unit)
						item.shop_total_price = Number(nvo_unit_price * item.shop_quantity_bag).toFixed(2)
						recalculate()
					}
				})
			}
		}
	}
}

const recalculateItemsPriceLevelClient = () => {
	if(objSale.value.client){
		const client = objSale.value.client
		if(shoppingItems.value.length > 0){
			shoppingItems.value.forEach((item) => {
				if(item.custitem_tipo_articulo == "Inventario"){
					item.PriceList.forEach((price) => {
						console.log("price", price)
						if(client.pricelevel == price.pricelevel_id){
							item.shop_list_selected = price
							item.shop_unit_price = price.price_unitprice
							console.log("item", item)
							let nvo_unit_price = Number(item.shop_unit_price) * Number(item.shop_unit_selected.conversion_rate)
							let stock_unit = Number(item.inventario[0].inventario) / Number(item.shop_unit_selected.conversion_rate)
							console.log("nvo_unit_price", nvo_unit_price)
							item.shop_unit_price = (nvo_unit_price).toFixed(2)
							item.shop_stock = Math.floor(stock_unit)
							item.shop_total_price = Number(nvo_unit_price * item.shop_quantity_bag).toFixed(2)
							recalculate()
						}
					})
				}else{
					item.PriceList.forEach((price) => {
						console.log("price", price)
						if(client.pricelevel == price.pricelevel_id){
							item.shop_list_selected = price
							item.shop_unit_price = price.price_unitprice
							console.log("item", item)
							let nvo_unit_price = Number(item.shop_unit_price) * 1
							let stock_unit = 1
							console.log("nvo_unit_price", nvo_unit_price)
							item.shop_unit_price = (nvo_unit_price).toFixed(2)
							item.shop_stock = Math.floor(stock_unit)
							item.shop_total_price = Number(nvo_unit_price * item.shop_quantity_bag).toFixed(2)
							recalculate()
						}
					})
				}
			})
		}
	}
}

const handleQuitClient = () => {
	resetPromotions()

	objSale.value.client = {
		internalid: "",
		companyname: "",
		denviodefecto: "",
		dfacturaciondefecto: "",
	};
	objClientAddress.value = []
}

const handleSelectDelivery = (event, index) => {
	const shoppingItem = shoppingItems.value[index]
	shoppingItem.delivery_type = Number(event.target.value)
	shoppingItems.value[index] = shoppingItem
}

const handleSelectDeliveryDate = (event, index) => {
	console.log("date", event);
	/* const shoppingItem = shoppingItems.value[index]
	shoppingItem.deliveryOption = event.target.value
	shoppingItems.value[index] = shoppingItem */
}

const changeTranType = (event) => {
	const type = event.target.value
	objSale.value.trantype = type
}

const handlePrintTicket = async () => {
	let continue_tran = true
	console.log("objSale.value", objSale.value)

	if(shoppingItems.value.length <= 0){
		toast.open({
			message: `No tiene Artículos seleccionado para venta`,
			type: 'warning'
		})
		continue_tran = false
	}

	if (objSale.value.sellerid == 0) {
		toast.open({
			message: `No esta definido el vendedor, por favor seleccione uno...`,
			type: 'warning'
		})
		continue_tran = false
	}

	if (!objSale.value.client.internalid) {
		toast.open({
			message: `No esta definido el cliente, por favor seleccione uno...`,
			type: 'warning'
		})
		continue_tran = false
	}

	/* objSale.value.items.forEach(item => {
		if(item.deliveryDate == null){
			toast.open({
				message: `El articulo ${item.displayname} no tiene definido la fecha de entrega`,
				type: 'warning'
			})
			continue_tran = false
		}
	}); */

	if(!continue_tran){
		showTicket.value = false
	}else{
		loader_sale.value = true;
		const prtHtml = document.getElementById('ticketsale').innerHTML;
		const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		let stylesHtml = '';
		for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
			stylesHtml += node.outerHTML;
		}
		WinPrint.document.write(`<!DOCTYPE html>
			<html>
			<head>
				${stylesHtml}
			</head>
			<body>
				${prtHtml}
			</body>
			</html>`);

		WinPrint.document.close();
		WinPrint.focus();
		WinPrint.print();

		const respSale = await createSale()

		console.log("response sale", respSale)

		if (respSale?.status == "error") {
			toast.open({
				message: `${respSale.msg}`,
				type: 'error'
			})
			showTicket.value = false
		} else {
			toast.open({
				message: `Venta ${objSale.value.id} guardada correctamente`,
				type: 'success'
			})

			shoppingItems.value = []

			objSale.value = {
				trandate: new Date(),
				trantype: "sale",
				client: {
					internalid: "",
					companyname: "",
					denviodefecto: "",
					dfacturaciondefecto: ""
				},
				items:[],
				currency: "MXN",
				promo: "",
				itemsquantity: 0,
				subtotal: 0,
				taxes: 0,
				discounts: 0,
				total: 0,
			}
			obj_promo_codes.value = []
			for (let index = 0; index < shoppingItems.value.length; index++) {
				shoppingItems.value.splice(index, 1)
			}

			showTicket.value = false
		}

		loader_sale.value = false;
	}
}

const createSale = async () => {
	console.log("sale", objSale.value)
	try {
		const can = Date.now()
		const items = []
		let descuento_global = 0
		const obj_sale = {
			externalid: objSale.value.id,
			promo_codes: obj_promo_codes.value,
			id_seller: objSale.value.sellerid,
			id_cashier: null,
			id_customer: objSale.value.client.internalid,
			id_user_pos: objSale.value.id_user_pos,
			id_location:user_info.value.location_id,
			id_user_pos:user_info.value.internalid,
			id_direccion_envio:objSale.value.client.denviodefecto,
			id_direccion_facturacion:objSale.value.client.dfacturaciondefecto,
			status_sale: "Facturación pendiente",
			trandate: objSale.value.trandate,
			articles: [],
			descuento_global: 0
		}
		for (let article_shop of objSale.value.items) {
			const new_delivery_date = new Date(article_shop.deliveryDate)
			let item_line = {}
			let pricelevel_select = null
			let rate = 0

			if(article_shop.shop_list_selected == -1){
				pricelevel_select = -1
				rate = Number(article_shop.shop_unit_price)
			}else{
				pricelevel_select = article_shop.shop_list_selected.pricelevel_id
				rate = Number(article_shop.shop_unit_price)
			}

			console.log("article_shop.custitem_tipo_articulo", article_shop.custitem_tipo_articulo)

			if(article_shop.custitem_tipo_articulo == "Inventario"){
				item_line = {
					nsid: article_shop.internalid,
					externalid: article_shop.internalid,
					id_item: article_shop.internalid,
					tax_object_id: article_shop.tax_object_id,
					pricelevel: pricelevel_select,
					currency: 1,
					rate: rate,
					quiantity: article_shop.shop_quantity_bag,
					units: article_shop.shop_unit_selected.nsid,
					delivery_type: article_shop.delivery_type,
					delivery_date: moment(article_shop.deliveryDate).utc().format('DD-MM-YYYY'), //YYYY-MM-DD
					total_tax: (rate * article_shop.shop_quantity_bag) * 0.16,
					origin: article_shop.origin
				}
			}else if(article_shop.custitem_tipo_articulo == 'Kit'){
				item_line = {
					nsid: article_shop.internalid,
					externalid: '',
					id_item: article_shop.internalid,
					tax_object_id: article_shop.tax_object_id,
					pricelevel: pricelevel_select,
					currency: 1,
					rate: rate,
					quiantity: article_shop.shop_quantity_bag,
					units: null,
					delivery_type: article_shop.delivery_type,
					delivery_date: moment(article_shop.deliveryDate).utc().format('DD-MM-YYYY'),
					total_tax: (rate * article_shop.shop_quantity_bag) * 0.16,
					origin: article_shop.origin
				}
			}else if(article_shop.custitem_tipo_articulo == 'promo'){
				item_line = {
					nsid: article_shop.internalid,
					externalid: '',
					id_item: article_shop.internalid,
					tax_object_id: article_shop.tax_object_id,
					pricelevel: "-1",
					currency: 1,
					rate: rate,
					quiantity: article_shop.shop_quantity_bag,
					units: null,
					delivery_type: article_shop.delivery_type,
					delivery_date: null,
					total_tax: (rate * article_shop.shop_quantity_bag) * 0.16,
					origin: article_shop.origin
				}
			}else if(article_shop.custitem_tipo_articulo == 'regalo'){
				item_line = {
					nsid: article_shop.internalid,
					externalid: '',
					id_item: article_shop.internalid,
					tax_object_id: article_shop.tax_object_id,
					pricelevel: pricelevel_select,
					currency: 1,
					rate: rate,
					quiantity: article_shop.shop_quantity_bag,
					units: article_shop.units,
					delivery_type: article_shop.delivery_type,
					delivery_date: moment(article_shop.deliveryDate).utc().format('DD-MM-YYYY'),
					total_tax: (rate * article_shop.shop_quantity_bag) * 0.16,
					origin: article_shop.origin
				}
			}
			items.push(item_line)
		}

		if(respPromotions.value?.discounts?.global.length > 0){
			respPromotions.value.discounts.global.forEach(descuentoGlobal => {
				descuento_global += descuentoGlobal.discount
			});
		}

		console.log("items create sale", items)
		// user_info.value = JSON.parse(localStorage.USER_INFO);
		obj_sale.articles = items
		obj_sale.descuento_global = descuento_global
		console.log("objns", obj_sale)

		if (objSale.value.trantype == "sale") {
			const response = await saleStore.createSale(obj_sale)
			if(response.code == 200){
				resetPromotions()
				apply_promotion.value = {}
				promo_codes.value = []
				respPromotions.value = {}
			}else{
				resetPromotions()
			}
		} else if (objSale.value.trantype == "estimate") {
			return await saleStore.createEstimate(obj_sale)
		}
	} catch (error) {
		console.log("error save sale", error)
		resetPromotions()
	}
}

const handleSelectUnit = (index) => {
	resetPromotions()

	const unit = shoppingItems.value[index]
	console.log('articulo? ', unit)
	console.log('unit.custitem_tipo_articulo? ', unit.custitem_tipo_articulo)
	unit.shop_unit_price = unit.shop_list_selected.price_unitprice
	let stock_unit = 0
	let nvo_unit_price = 0
	if (unit.custitem_tipo_articulo != "Kit") {
		nvo_unit_price = Number(unit.shop_unit_price) * Number(unit.shop_unit_selected.conversion_rate)
		stock_unit =Number(unit.inventario[0].inventario) / Number(unit.shop_unit_selected.conversion_rate)
	} else {
		nvo_unit_price = Number(unit.shop_unit_price) * 1
		stock_unit = 1
	}
	console.log('nvo_unit_price? ', nvo_unit_price || 0)
	shoppingItems.value[index].shop_unit_price = (nvo_unit_price).toFixed(2) || 0
	shoppingItems.value[index].shop_stock = Math.floor(stock_unit)
	shoppingItems.value[index].shop_quantity_bag = 1
	shoppingItems.value[index].shop_total_price = (nvo_unit_price * shoppingItems.value[index].shop_quantity_bag).toFixed(2)
	recalculate()
}

const refreshItemSearch = () => {
	inpSearchItem.value = ""
	itemsStore.itemsList = []
	msgFilterItem.value = "";
	showItemSearch.value = false
}

const handleAddPromoCode = () => {
	promo_codes.value.push(txtPromotions.value)
	txtPromotions.value = ""
	resetPromotions()
}

const handleTest =() => {
	console.log("shoplist", shoppingItems.value)
}

const recalculatePromotions = (objPromotion) => {
	let taxes = Number(objPromotion.tax)
	let total = Number(objPromotion.total)
	let subtotal = Number(objPromotion.subTotal)
	let totalArtQty = Number(objPromotion.total_quantity_items)

	let sub_total_with_discount = Number(objPromotion.sub_total_with_discount)
	let taxes_discount = Number(objPromotion.tax)
	let total_discount = Number(objPromotion.total)

	/* let globalDiscount = Number(objPromotion.discount_global)
	let linesDiscount = Number(objPromotion.discount_line)
	let artDiscount = Number(objPromotion.discount_art_uni) */

	//subtotal = subtotal - globalDiscount - linesDiscount - artDiscount
	//const tax_sale = subtotal * 0.16
	objSale.value.taxes = taxes_discount
	objSale.value.subtotal = sub_total_with_discount
	objSale.value.itemsquantity = totalArtQty
	objSale.value.total = total_discount
}

const handleResetPromotions = () => {
	shoppingItems.value = objShoppingListPromotions.value

	objSale.value.itemsquantity = 0
	objSale.value.subtotal = 0
	objSale.value.taxes = 0
	objSale.value.total = 0
	objSale.value.discounts = []

	validatePromotions.value = false
	showValidatePromotions.value = false

	recalculate()
}

const handleValidatePromotions = async() => {
	loadPromotions.value = true
	const can = Date.now()

	resetPromotions()

	const items = shoppingItems.value
	const seller = saleStore.sellerInfo
	let articles = []
	objShoppingListPromotions.value = items

	console.log("items", items)
	console.log("sale", objSale.value)
	console.log("seller", seller)

	items.forEach(item => {
		if(item.custitem_tipo_articulo != "promo"){
			articles.push({
				id_item: item.internalid,
				tax_object_id: item.tax_object_id,
				pricelevel: item.shop_list_selected == "-1" ? item.shop_list_selected : item.shop_list_selected.pricelevel_id,
				rate: item.shop_unit_price,
				currency: item.currency,
				quiantity: item.shop_quantity_bag,
				units: item.shop_unit_selected.nsid,
				delivery_type: item.delivery_type,
				delivery_date: item.delivery_date,
				shop_list_price: item.shop_list_price,
				shop_list_selected: item.shop_list_selected,
				shop_unit_selected: item.shop_unit_selected,
				origin : "Venta"
			})
		}
	});

	apply_promotion.value = {
		externalid: null,
		id_seller: seller,
		id_cashier: null,
		promo_codes: promo_codes.value,
		id_customer: objSale.value.client.internalid,
		id_location: user_info.value.location_id,
		id_direccion_envio: null,
		id_direccion_facturacion: null,
		articles: articles
	}

	try {
		const response = await promotionsStore.applyPromotion(apply_promotion.value)
		let newShoppingList = []
		let itemnew = {}
		console.log("response", response)
		if(response.code == 200){
			const data = response.data
			console.info("Response", data)
			respPromotions.value = data
			if(data.discounts.lines.length > 0 || data.discounts.uniques.length > 0){
				data.articles.forEach(dataArticle => {
					const dataFind = items.find((value, index) => {
						return dataArticle.id_item == value.internalid
					})

					console.log("dataFind", dataFind)

					if(dataFind != undefined){
						if(dataArticle.origin == 'Regalo (único)'){
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quantity,
								delivery_type: dataArticle.delivery_type,
								delivery_date: dataArticle.delivery_date,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: dataArticle.converted_qty,
								units: dataArticle.units,
								shop_list_selected: dataFind.shop_list_selected,
								shop_list_price: dataArticle.pricelevel,
								shop_unit_selected: dataFind.shop_unit_selected,
								discount: dataArticle.discount,
								promo_id: dataArticle.promo_id,
								subtotal: dataArticle.subtotal,
								tax: dataArticle.tax,
								displayname: dataFind.displayname,
								upccode: dataFind.upccode,
								shop_units: dataArticle.units,
								PriceList: dataFind.PriceList,
								shop_unit_price: dataArticle.rate,
								shop_stock: dataFind.shop_stock,
								shop_quantity_bag: dataArticle.quiantity,
								delivery_type: dataFind.delivery_type,
								deliveryDate: dataFind.deliveryDate,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: "regalo"
							}
						}else if(dataArticle.origin == 'Regalo (múltiplo)'){
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quantity,
								delivery_type: dataArticle.delivery_type,
								delivery_date: dataArticle.delivery_date,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: dataArticle.converted_qty,
								units: dataArticle.units,
								shop_list_selected: dataFind.shop_list_selected,
								shop_list_price: dataArticle.pricelevel,
								shop_unit_selected: dataFind.shop_unit_selected,
								discount: dataArticle.discount,
								promo_id: dataArticle.promo_id,
								subtotal: dataArticle.subtotal,
								tax: dataArticle.tax,
								displayname: dataFind.displayname,
								upccode: dataFind.upccode,
								shop_units: dataArticle.units,
								PriceList: dataFind.PriceList,
								shop_unit_price: dataArticle.rate,
								shop_stock: dataFind.shop_stock,
								shop_quantity_bag: dataArticle.quiantity,
								delivery_type: dataFind.delivery_type,
								deliveryDate: dataFind.deliveryDate,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: "regalo"
							}
						}else{
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quiantity,
								delivery_type: dataArticle.delivery_type,
								delivery_date: dataArticle.delivery_date,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: dataArticle.converted_qty,
								units: dataArticle.units,
								shop_list_selected: dataArticle.shop_list_selected,
								shop_list_price: dataArticle.shop_list_price,
								shop_unit_selected: dataArticle.shop_unit_selected,
								discount: dataArticle.discount,
								promo_id: dataArticle.promo_id,
								subtotal: dataArticle.subtotal,
								tax: dataArticle.tax,
								displayname: dataFind.displayname,
								upccode: dataFind.upccode,
								shop_units: dataFind.shop_units,
								PriceList: dataFind.PriceList,
								shop_unit_price: dataArticle.rate,
								shop_stock: dataFind.shop_stock,
								shop_quantity_bag: dataFind.shop_quantity_bag,
								delivery_type: dataFind.delivery_type,
								deliveryDate: dataFind.deliveryDate,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: dataFind.custitem_tipo_articulo
							}
						}
						newShoppingList.push(itemnew)
					}else{
						if(dataArticle.origin == 'Regalo (múltiplo)'){
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quantity,
								delivery_type: null,
								delivery_date: null,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: null,
								units: dataArticle.units,
								shop_list_selected: [],
								shop_list_price: [],
								shop_unit_selected: [],
								discount: dataArticle.discount,
								displayname: "Descuento en promociones",
								upccode: null,
								shop_units: [],
								PriceList: [],
								shop_unit_price: dataArticle.rate,
								shop_stock: dataArticle.quiantity,
								shop_quantity_bag: dataArticle.quiantity,
								delivery_type: null,
								deliveryDate: null,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: "regalo"
							}
						}else if(dataArticle.origin == 'Regalo (único)'){
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quantity,
								delivery_type: null,
								delivery_date: null,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: null,
								units: dataArticle.units,
								shop_list_selected: [],
								shop_list_price: [],
								shop_unit_selected: [],
								discount: dataArticle.discount,
								displayname: "Descuento en promociones",
								upccode: null,
								shop_units: [],
								PriceList: [],
								shop_unit_price: dataArticle.rate,
								shop_stock: dataArticle.quiantity,
								shop_quantity_bag: dataArticle.quiantity,
								delivery_type: null,
								deliveryDate: null,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: "regalo"
							}
						}else{
							itemnew = {
								origin: dataArticle.origin,
								internalid: dataArticle.id_item,
								id_item: dataArticle.id_item,
								tax_object_id: dataArticle.tax_object_id,
								type: dataArticle.type,
								currency: dataArticle.currency,
								pricelevel: dataArticle.pricelevel,
								quiantity: dataArticle.quiantity,
								quantity: dataArticle.quantity,
								delivery_type: null,
								delivery_date: null,
								rate: dataArticle.rate,
								total: dataArticle.total,
								total_tax: dataArticle.total_tax,
								converted_qty: null,
								units: dataArticle.units,
								shop_list_selected: [],
								shop_list_price: [],
								shop_unit_selected: [],
								discount: dataArticle.discount,
								displayname: "Descuento en promociones",
								upccode: null,
								shop_units: [],
								PriceList: [],
								shop_unit_price: dataArticle.rate,
								shop_stock: dataArticle.quiantity,
								shop_quantity_bag: dataArticle.quiantity,
								delivery_type: null,
								deliveryDate: null,
								shop_total_price: dataArticle.total,
								custitem_tipo_articulo: "promo"
							}
						}
						newShoppingList.push(itemnew)
					}
				});

				shoppingItems.value = newShoppingList
				recalculatePromotions(data)
				console.log("shoppingItems promos", shoppingItems.value)
				/* data.articles.forEach(data_promo_item => {
					const element_find = items.find((element) => element.internalid)
					if(element_find != undefined){
						shoppingItems.value.forEach(shopping => {
							if(element_find.id_item == shopping.id_item){
								shopping.displayname = element_find.displayname
							}
						});
					}
				}); */
			}
			if(data.discounts.global.length > 0){
				data.discounts.global.forEach(globalPromo => {
					if(globalPromo.promo.tipo_descuento == 1){
						objSale.value.discounts.push({
							name: globalPromo.promo.name,
							type: "total",
							discount: globalPromo.discount,
						})
					}
					if(globalPromo.promo.tipo_descuento == 2){
						objSale.value.discounts.push({
							name: globalPromo.promo.name,
							type: "porcentaje",
							discount: globalPromo.discount,
						})
					}
					recalculatePromotions(data)
					//objSale.value.subtotal = objSale.value.subtotal - globalPromo.discount
				})
			}

			console.log("new shopoing items", items)
			
			validatePromotions.value = true
			showValidatePromotions.value = false
		}else{
			const data_error = response
			let items_error = []

			data_error.data.forEach(itemError => {
				shoppingItems.value.forEach(itemShop => {
					if(itemError.id_item == itemShop.internalid){
						items_error.push({
							name: itemShop.displayname
						})
					}
				});
			});

			items_error.forEach(element => {
				toast.open({
					message: `${element.name}`,
					type: 'error'
				})
			});

			toast.open({
				message: `${response.msg}`,
				type: 'error'
			})

			validatePromotions.value = false
			showValidatePromotions.value = false
		}
		loadPromotions.value = false
	} catch (error) {
		console.error("Fallo al validar promociones", error)
		toast.open({
			message: `Ocurrio un error al obtener la verificación de promociones`,
			type: 'error'
		})
		validatePromotions.value = false
		showValidatePromotions.value = false
		loadPromotions.value = false
	}

	console.info("ObjPrueba Promotions", apply_promotion.value)
}

const getPromotion = () => {
	try {
		if(shoppingItems.value.length <= 0){
			toast.open({
				message: `Por favor agregue Artículos al carrito para aplicar la promoción`,
				type: 'warning'
			})
			return false
		}
		if(txtPromotions.value.length <= 0){
			toast.open({
				message: `Por favor agregue el codigo de la promoción`,
				type: 'warning'
			})
			return false
		}

		const promo_code = txtPromotions.value
		let promo_data = []
		let exist_promo = false
		const location_id = user_info.value.location_id
		if(promotionsData.value.code === 200){
			promotionsData.value.data.forEach(promotion => {
				if(promotion.codigo_promocion == promo_code){
					console.log("promo", promotion)
					promo_data = promotion
					exist_promo = true
				}
			});
			if(!exist_promo){
				toast.open({
					message: `La promoción ${promo_code} no se encuentra disponible`,
					type: 'warning'
				})
				return false
			}
			if(exist_promo){
				/* if(promo_data.aplicar_automaticamente){
					toast.open({
						message: `Esta promoción solo esta disponible de forma automatica`,
						type: 'warning'
					})
					return false
				} */
				//let date_now = new Date()
				let date_now = Date.now()
				let initial_date_promo = new Date(promo_data.fecha_hora_inicio)
				initial_date_promo = initial_date_promo.getTime()
				let finish_date_promo = new Date(promo_data.fecha_hora_fin)
				finish_date_promo = finish_date_promo.getTime()

				let continue_promo = true

				console.log("date_now", date_now)
				console.log("initial_date_promo", initial_date_promo)
				console.log("finish_date_promo", finish_date_promo)
				console.log("shoppingItems.value", shoppingItems.value)
				console.log("objSale.value", objSale.value)

				if(date_now >= initial_date_promo && date_now <= finish_date_promo){
					console.log("si aplico la promo")
					//Validacion donde la promocion que se aplica este dentro de la misma ubicación
					/* if(promo_data.location.internalid != location_id){
						toast.open({
							message: `Esta promoción no se puede aplicar, ya que esta configurada para otra ubicación`,
							type: 'warning'
						})
						continue_promo = false
						return false
					} */

					switch (promo_data.accion_promocion) {
						//Realizar Alguna Compra
						case 1:
							if(objSale.value.itemsquantity <= 0){
								toast.open({
									message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos. <br/> Debe agregar un articulo al carrito de compras.`,
									type: 'warning'
								})
								return false
							}
							break;
						//Gastar Importe Mínimo y/o Comprar Artículo Específico
						case 2:
							if(promo_data.importe_min_orden == null && promo_data.cantidad_art_orden == null){
								let pass = false
								let quantity_pass = false
								if(promo_data.article_conditions.length > 0){
									promo_data.article_conditions.forEach(articleAction => {
										shoppingItems.value.forEach(shoppingArticle => {
											console.log("articleAction.article.itemid", articleAction.article.itemid)
											console.log("shoppingArticle.itemid", shoppingArticle.itemid)
											if(articleAction.article.itemid == shoppingArticle.itemid){
												pass = true
												if(shoppingArticle.shop_quantity_bag >= articleAction.quantity){
													quantity_pass = true
												}
												if(shoppingArticle.shop_unit_selected.nsid != articleAction.unit.nsid){
													pass = false
												}
											}
										});
										if(!pass){
											toast.open({
												message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos.`,
												type: 'warning'
											})
											return false
										}
										if(!quantity_pass){
											toast.open({
												message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos.`,
												type: 'warning'
											})
											return false
										}
									});
								}
							}
							if(promo_data.importe_min_orden != null){
								let pass = false
								let quantity_pass = false
								if(objSale.value.total < promo_data.importe_min_orden){
									toast.open({
										message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos. <br/> El importe minimo para aplicarlo debe ser de ${promo_data.importe_min_orden}`,
										type: 'warning'
									})
									return false
								}
								if(promo_data.article_conditions.length > 0){
									promo_data.article_conditions.forEach(articleAction => {
										shoppingItems.value.forEach(shoppingArticle => {
											console.log("articleAction.article.itemid", articleAction.article.itemid)
											console.log("shoppingArticle.itemid", shoppingArticle.itemid)
											if(articleAction.article.itemid == shoppingArticle.itemid){
												pass = true
												if(shoppingArticle.shop_quantity_bag >= articleAction.quantity){
													quantity_pass = true
												}
												if(shoppingArticle.shop_unit_selected.nsid != articleAction.unit.nsid){
													pass = false
												}
											}
										});
										if(!pass){
											toast.open({
												message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos.`,
												type: 'warning'
											})
											return false
										}
										if(!quantity_pass){
											toast.open({
												message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos.`,
												type: 'warning'
											})
											return false
										}
									});
								}
							}
							if(promo_data.cantidad_art_orden != null){
								let pass = false
								let quantity_pass = false
								if(objSale.value.itemsquantity < promo_data.cantidad_art_orden){
									toast.open({
										message: `Esta promoción no se puede aplicar, no cumple con los requisitos requeridos. <br/> El importe minimo para aplicarlo debe ser de ${promo_data.importe_min_orden}`,
										type: 'warning'
									})
									return false
								}
							}
							break;
						////Realizar Alguna Compra
						default:
							break;
					}

					//Aplica promocion al articulo mas caro
					if(promo_data.aplicar_desc_a == 3){
						const shoppingItemsOrdenados = shoppingItems.value.sort((a,b) =>{
							return Number(b.shop_unit_price) - Number(a.shop_unit_price)
						})
						if(promo_data.tipo_descuento == 1){
							let cal_price = shoppingItemsOrdenados[0].shop_unit_price * (promo_data.monto_descuento / 100)
							shoppingItemsOrdenados[0].shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - cal_price
						}
						if(promo_data.tipo_descuento == 2){
							shoppingItemsOrdenados[0].shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - promo_data.monto_descuento
						}
					}
					//Aplica promocion al articulo mas barato
					if(promo_data.aplicar_desc_a == 2){
						const shoppingItemsOrdenados = shoppingItems.value.sort((a,b) =>{
							if (Number(a.shop_unit_price) > Number(b.shop_unit_price)) {
								return -1;
							}
						})
						if(promo_data.tipo_descuento == 1){
							let cal_price = shoppingItemsOrdenados[0].shop_unit_price * (promo_data.monto_descuento / 100)
							shoppingItemsOrdenados[0].shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - cal_price
						}
						if(promo_data.tipo_descuento == 2){
							shoppingItemsOrdenados[0].shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - promo_data.monto_descuento
						}
					}
					//Aplica promocion a todos los Artículos de la lista de Artículos de regalo
					if(promo_data.aplicar_desc_a == 1){
						shoppingItems.value.forEach(article => {
							//aplica la promocion si es de porcentaje sobre el monto  del articulo
							if(promo_data.tipo_descuento == 1){
								promo_data.article_gifts.forEach(article_gifs => {
									if(article_gifs.article.itemid == article.itemid){
										let cal_price = shoppingItemsOrdenados[0].shop_unit_price * (promo_data.monto_descuento / 100)
										article.shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - cal_price
									}
								});
							}
							//Aplica el descuento sobre monto de pesos mexicanos
							if(promo_data.tipo_descuento == 2){
								promo_data.article_gifts.forEach(article_gifs => {
									if(article_gifs.article.itemid == article.itemid){
										let cal_price = shoppingItemsOrdenados[0].shop_unit_price * (promo_data.monto_descuento / 100)
										article.shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - cal_price
									}
								});
								article.shop_unit_price = shoppingItemsOrdenados[0].shop_unit_price - promo_data.monto_descuento
							}
						});
					}
					obj_promo_codes.value.push(txtPromotions.value)
					recalculate()
				}else{
					toast.open({
						message: `Esta promoción no se puede aplicar, esta fuera del rango de fecha.`,
						type: 'warning'
					})
					return false
				}
			}
		}
	} catch (error) {
		toast.open({
			message: `Ocurrio un error al obtener la promoción, si el problema persiste favor de reportarlo a su gerente <br/> ${error}`,
			type: 'error'
		})
		console.error("Error promocion", error)
	}
}

const handleChangeNumber = (index) =>{
	try {
		console.log('entró a la funcion')
		const shoppingItem = shoppingItems.value[index]
		let quantity = shoppingItem.shop_quantity_bag
		if(quantity < 0){
			toast.open({
				message: `No se permiten valores negativos`,
				type: 'error'
			})
			quantity = 1
			shoppingItems.value[index].shop_quantity_bag = quantity
		}
		console.log('quantity', quantity)
		console.log('Number(shoppingItem.inventario.inventario)', shoppingItem.shop_stock)
		if(quantity > Number(shoppingItem.shop_stock)){
			toast.open({
				message: `No puede agregar valores mayores al stock disponible`,
				type: 'error'
			})
			quantity = 1
			shoppingItems.value[index].shop_quantity_bag = quantity
		}
		handleQuantityItem(index)
	} catch (error) {
		console.error('ERROR on handleChangeNumber: ', error)
	}
}

let flagListPrice = false
const handleLevelPriceAprovatio = (index, lista_precio) => {
	resetPromotions()

	console.log('lista_precio? ', lista_precio)
	if (lista_precio == "-1") {
		flagListPrice = true
	} else {
		flagListPrice = false
	}
	if(index == -1){
		shoppingItems.value[txtIndexLevelPrice.value].PriceList.forEach(price => {
			if(price.pricelevel_id == 1){
				shoppingItems.value[txtIndexLevelPrice.value].shop_list_selected = price
			}
		});
		modalLevelProbation.value = false
		console.log('modalLevelProbation.value? if', modalLevelProbation.value)
	}else{
		modalLevelProbation.value = true
		txtIndexLevelPrice.value = index
		console.log('txtIndexLevelPrice.value? else', txtIndexLevelPrice.value)
	}
	formSupervisor.value={
		user:"",
		password:""
	}
}

const handleAprovedlevelPrice = async() => {
	try {
		const data = formSupervisor.value
		const respAprobation = await loginStore.handleLoginAprobation(data)
		const client = objSale.value.client
		console.log("aprobation", respAprobation)
		console.log("client", client)
		if(client.internalid == ""){
			toast.open({
				message: `Seleccione un cliente por favor`,
				type: 'warning'
			})
			shoppingItems.value[txtIndexLevelPrice.value].PriceList.forEach(price => {
				if(price.pricelevel_id == 1){
					shoppingItems.value[txtIndexLevelPrice.value].shop_list_selected = price
				}
			});
			return false
		}
		if(respAprobation.code === 404){
			shoppingItems.value[txtIndexLevelPrice.value].PriceList.forEach(price => {
				if(client.pricelevel == price.pricelevel_id){
					shoppingItems.value[txtIndexLevelPrice.value].shop_list_selected = price
				}
			});

			toast.open({
				message: `${respAprobation.msg}`,
				type: 'error'
			})
		}
		if(respAprobation.code === 200){
			console.log("respAprobation.data.cf_drt_custom_rol_id", respAprobation.data.cf_drt_custom_rol_id)
			if(respAprobation.data.cf_drt_custom_rol_id == 4 || respAprobation.data.cf_drt_custom_rol_id == 3){
				console.log('dato para la funcion? ', txtIndexLevelPrice.value)
				handleSelectUnit(txtIndexLevelPrice.value)
				toast.open({
					message: `Aprobación validada por el supevisor ${respAprobation.data.firstname} ${respAprobation.data.lastname}`,
					type: 'success'
				})
				modalLevelProbation.value = false
			}else{
				shoppingItems.value[txtIndexLevelPrice.value].PriceList.forEach(price => {
					if(client.pricelevel == price.pricelevel_id){
						shoppingItems.value[txtIndexLevelPrice.value].shop_list_selected = price
					}
				});
				toast.open({
					message: `El usuario no cuenta con los permisos necesarios para aprobar el cambio del nivel de precio`,
					type: 'warning'
				})
			}
		}
		formSupervisor.value={
			user:"",
			password:""
		}
	} catch (error) {
		const client = objSale.value.client
		console.log("client", client)
		console.error("error", error)
		shoppingItems.value[txtIndexLevelPrice.value].PriceList.forEach(price => {
			if(client.pricelevel == price.pricelevel_id){
				shoppingItems.value[txtIndexLevelPrice.value].shop_list_selected = price
			}
		});
		toast.open({
			message: "Error al iniciar sesión, usuario o contraseñas inexistentes",
			type: 'error'
		})
		formSupervisor.value={
			user:"",
			password:""
		}
	}
}

const handleShowComponentsArticleKit = (articleKit) => {
	modalshowComponents.value = !modalshowComponents.value
	infoArticleKit.value = articleKit
}

const renderUnitList = (unitlist) => {
	let nUnit = ""
	unitlist.forEach(unit => {
		// console.log("unit", unit.unit_base)
		if(unit.unit_base){
			// console.log("unit.nsname", unit.nsname)
			nUnit = unit.nsname
		}
	})

	return nUnit
}

const handleVerifyMinus = () => {
	console.log("prueba de cambio")
}

const handleQuitPromoCode = (index) => {
	promo_codes.value.splice(index, 1)
	resetPromotions()
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10 rounded-3xl" v-show="!showTicket && !loader_sale && !loadPromotions">
			<div class="lg:grid lg:grid-cols-4">
				<div class="w-full px-2 bg-white rounded-lg lg:col-span-3">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white rounded-t-lg bg-[#26245C] w-40"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2 w-full">
							<p class="inline-block p-4 text-center text-lg font-bold">Ventas</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<div class="bg-[#26245C] p-2 md:p-8 rounded-b-lg rounded-e-lg">
							<div class="flex flex-row w-full">
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="grid-last-name" type="text"
									placeholder="Ingrese el nombre o código del articulo"
									v-on:keyup.enter="inputItemSearch()"
									v-model="inpSearchItem">
									<button v-if="!loaderSearch" @click="inputItemSearch()" class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
										<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
											<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
										</svg>
										<span class="sr-only">Search</span>
									</button>
									<button v-if="!loaderSearch" @click="refreshItemSearch()"
										class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
											<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
											<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
										</svg>
										<span class="sr-only">Search</span>
									</button>
									<div role="status" v-if="loaderSearch" class="ml-3">
										<svg aria-hidden="true" class="w-12 h-12 text-[#322f79 fab33c] animate-spin fill-[#fab33c]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
											<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
										</svg>
										<span class="sr-only">Cargando...</span>
									</div>
							</div>
						</div>
						<!-- TABLA Busqueda de Artículos -->
						<div class="flex flex-col overflow-x-auto h-1/2 bg-white" :class="{ 'hidden': !showItemSearch }">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<h1 v-if="msgFilterItem.length">{{ msgFilterItem }}</h1>
										<table class="min-w-full text-left text-sm font-light bg-white">
											<thead
												class="border-b font-medium dark:border-neutral-500 text-center bg-[#D9D9D9] text-[#26245C]">
												<tr>
													<!-- <th scope="col" class="px-5 py-4">Img</th> -->
													<th scope="col" class="px-5 py-4">Artículo</th>
													<th scope="col" class="px-5 py-4">Cod Artículo</th>
													<th scope="col" class="px-5 py-4">Precio</th>
													<th scope="col" class="px-5 py-4">Und medida</th>
													<!-- <th scope="col" class="px-5 py-4">Categoria</th> -->
													<!-- <th scope="col" class="px-5 py-4">Ubicación</th> -->
													<th scope="col" class="px-5 py-4">Stock</th>
													<th scope="col" class="px-5 py-4 border-l-2 border-slate-300"></th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b dark:border-neutral-500 text-center bg-[#e8e8e8]"
													v-for="item in itemsStore.itemsList" :key="item">
													<td class="whitespace-nowrap px-2 py-4">{{ item.displayname }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.upccode }}</td>
													<td class="whitespace-nowrap px-2 py-4">${{ item.PriceList[0]?.price_unitprice }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ renderUnitList(item.unitlist) }}</td>
													<!-- <td class="whitespace-nowrap px-2 py-4">{{ item.baseunit }}</td> -->
													<td class="whitespace-nowrap px-2 py-4">{{ item.inventario[0]?.inventario }}</td>
													<td class="whitespace-nowrap px-2 py-4 border-l-2 border-slate-300">
														<button @click="handleAddItem(item)"
															class="bg-[#26245C] text-[#ffffff] w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-3 rounded-xl float-right ml-5 shadow-inp text-xs">Seleccionar</button>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>

						<!-- TABLA Busqueda de Artículos -->
						<div class="flex flex-col overflow-x-auto bg-white" :class="{ 'hidden': showItemSearch }">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead
												class="border border-[#26245c73] font-medium text-center bg-[#D9D9D9] text-[#26245C]">
												<tr>
													<th scope="col" class="px-1 py-4"></th>
													<th scope="col" class="px-1 py-4">#</th>
													<th scope="col" class="px-1 py-4">Artículo</th>
													<th scope="col" class="px-1 py-4">Cod Artículo</th>
													<th scope="col" class="px-1 py-4">Und Medida</th>
													<th scope="col" class="px-1 py-4">Lista de Precio</th>
													<th scope="col" class="px-1 py-4">Precio</th>
													<th scope="col" class="px-1 py-4">Stock</th>
													<th scope="col" class="px-1 py-4">Cantidad</th>
													<th scope="col" class="px-1 py-4">Entrega</th>
													<th scope="col" class="px-1 py-4">Fecha de Entrega</th>
													<th scope="col" class="px-1 py-4 border-l-2 border-slate-500">Subtotal</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border border-[#26245c73] dark:border-neutral-500 text-center text-[12px]"
													v-for="(shoppingItem, index) in shoppingItems"
													:key="shoppingItem">
													<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
														<svg v-if="shoppingItem.custitem_tipo_articulo == 'Inventario' || shoppingItem.custitem_tipo_articulo == 'Kit'" @click="handleRemoveItem(index)" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-trash-fill hover:cursor-pointer text-[#5c2424]" viewBox="0 0 16 16">
															<path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
														</svg>
														<svg v-if="shoppingItem?.custitem_tipo_articulo == 'Kit'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" @click="handleShowComponentsArticleKit(shoppingItem)" class="bi bi-eye hover:cursor-pointer text-[#26245C]" viewBox="0 0 16 16">
															<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
															<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
														</svg>
														<!-- <button @click="handleShowComponentsArticleKit(shoppingItem)" class="bg-black text-white p-2" v-if="shoppingItem.custitem_tipo_articulo == 'Kit'">Mostrar <br> Componentes</button> -->
														<!-- <div class="flex flex-wrap justify-center">
															<input id="checkbox-table-search-1" type="checkbox"
																class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
															<svg xmlns="http://www.w3.org/2000/svg" width="16"
																height="16" fill="currentColor"
																class="bi bi-search ml-2" viewBox="0 0 16 16">
																<path
																	d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
															</svg>
														</div> -->
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ index + 1 }}
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ shoppingItem?.displayname }}
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ shoppingItem?.upccode }}
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<select @change="handleSelectUnit(index)" v-model="shoppingItem.shop_unit_selected" :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'"
															class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
															<option :value="unit"
																v-for="unit in shoppingItem?.shop_units" :key="unit"
																selected>{{ unit.nsname }}</option>
														</select>
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<select @change="handleLevelPriceAprovatio(index, shoppingItem.shop_list_selected)" v-model="shoppingItem.shop_list_selected" :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'"
															class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
															<option :value="price" :v-if="price.quantity = 0" v-for="price in shoppingItem.PriceList" :key="price.pricelevel_id">
																${{ price.price_unitprice }} - {{ price.pricelevel_name }}
															</option>
															<option value="-1">
																Personalizado
															</option>
														</select>
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<div v-if="flagListPrice" class="font-bold pl-2 pr-2">
															<input :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'" v-on:input="handleQuantityItem(index)" @keypress.enter="handleQuantityItem(index)" class="w-24" type="number" v-model="shoppingItem.shop_unit_price">
														</div>
														<div v-else class="font-bold pl-2 pr-2">
															<input :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'" v-on:input="handleQuantityItem(index)" @keypress.enter="handleQuantityItem(index)" class="w-24" type="number" v-model="shoppingItem.shop_unit_price" readonly>
														</div>
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ shoppingItem.shop_stock }}</td>
													<td class="whitespace-nowrap px-2 py-4">
														<div class="inline-flex">
															<button @click="handleRemoveQuantityItem(index)" :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'"
																class="bg-white">
																<svg xmlns="http://www.w3.org/2000/svg" width="16"
																	height="16" fill="currentColor"
																	class="bi bi-dash-circle-fill h-7 w-7 hover:text-blue-900"
																	viewBox="0 0 16 16">
																	<path
																		d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z" />
																</svg>
															</button>
															<!-- cantidad -->
															<div class="font-bold pl-2 pr-2">
																<input :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'" v-on:input="handleChangeNumber(index)" @keypress.enter="handleQuantityItem(index)" class="w-24" type="number" v-model="shoppingItem.shop_quantity_bag">
															</div>
															<button @click="handleAddQuantityItem(index, shoppingItem.shop_quantity_bag)" :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'"
																class="bg-white">
																<svg xmlns="http://www.w3.org/2000/svg" width="16"
																	height="16" fill="currentColor"
																	class="bi bi-plus-circle-fill h-7 w-7 hover:text-blue-900"
																	viewBox=" 0 0 16
																16">
																	<path
																		d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
																</svg>
															</button>
														</div>
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<select :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'" @change="handleSelectDelivery($event, index)"
															class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
															<option value="1">Tienda</option>
															<option value="2">Domicilio</option>
															<option value="3">Recoge</option>
														</select>
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<input :disabled="shoppingItem.custitem_tipo_articulo == 'promo' || shoppingItem.custitem_tipo_articulo == 'regalo'" id="fechaEntrega" v-model="shoppingItem.deliveryDate" type="date" :min="fecha_minimo"
															class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
														<!-- <input id="fechaEntrega" v-model="shoppingItem.deliveryDate" type="date" :min="fecha_minimo"
															class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"> -->
													</td>
													<td
														class="whitespace-nowrap px-2 py-4 border-l-2 border-slate-500">
														${{ shoppingItem.shop_total_price }}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="w-full px-2 rounded-lg lg:col-span-1 mt-5 lg:mt-0 infoSale lg:right-9 bg-white pb-2">
					<!-- <div class="flex flex-wrap rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Fecha
							</label>
							<input
								class="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 shadow-sl"
								id="grid-last-name" type="text" v-model="today_date">
						</div>
					</div> -->
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Tipo de registro
							</label>
							<select @change="changeTranType($event)"
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text">
								<option value="sale" selected>Venta</option>
								<option value="estimate">Cotización</option>
							</select>
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Cotización de origen
							</label>
							<input v-model="txt_estimation"
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text" :disabled="block_search_estimation">
						</div>
						<button @click="handleModalSelectEstimate()" class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d] mt-2" :disabled="block_search_estimation">Seleccionar cotización</button>
						<!-- <button @click="search_estimation()" class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d] mt-2" :disabled="block_search_estimation">Buscar cotización</button> -->
						<button @click="reset_search_estimation()" class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d]">Limpiar</button>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Seleccionar cliente
							</label>
							<button @click="handleSearchClient()"
								class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d]">Buscar
								Cliente</button>
							<div class="flex flex-row" v-if="objSale.client.nsid || objSale.client.internalid">
								<button @click="handleQuitClient()">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
										class="bi bi-x-circle-fill w-8 h-8" viewBox="0 0 16 16">
										<path
											d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
									</svg>
								</button>
								<p class="p-3 text-lg">{{ objSale.client.nsid ? objSale.client.nsid : objSale.client.internalid }} {{ objSale.client.companyname ? objSale.client.companyname : objSale.client.firstname + " " + objSale.client.lastname}} <br> RFC: {{ objSale.client._drt_custom_rfc ? objSale.client._drt_custom_rfc : "" }} <br> Nivel de precio: {{ objSale.client.pricelevel ? objSale.client.pricelevel : "Base Price" }}</p>
							</div>
							<!-- <input
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2"
								id="grid-last-name" type="text" placeholder="Nombre del cliente"
								v-model="objSale.client.companyname" disabled> -->
							<p class="mt-2 text-lg">Dirección de envio</p>
							<select v-model="objSale.client.denviodefecto"
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2">
								<option :value="direction.internalid" v-for="direction in objClientAddress"
									:key="direction.internalid">
									{{ direction.calle ? "Calle " + direction.calle + ", " : "null, " }} {{ direction.numero_e ? "#" + direction.numero_e + ", " : "null, " }} {{ direction.colonia ? "Colonia " + direction.colonia + ", " : "null, "}} {{ direction.codigopostal ? "CP " + direction.codigopostal : "null" }}
								</option>
							</select>
							<!-- <p class="mt-2 text-lg">Dirección de facturación</p>
							<select v-model="objSale.client.dfacturaciondefecto"
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
								<option :value="direction.internalid" v-for="direction in objClientAddress"
									:key="direction.internalid">
								 	{{ direction.internalid }}	{{ direction.calle ? "Calle " + direction.calle + ", " : "null, " }} {{ direction.numero_e ? "#" + direction.numero_e + ", " : "null, " }} {{ direction.colonia ? "Colonia " + direction.colonia + ", " : "null, "}} {{ direction.codigopostal ? "CP " + direction.codigopostal : "null" }}
								</option>
							</select> -->
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Tipo de moneda
							</label>
							<input
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text" value="MXN" disabled>
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Aplicar cupón o promoción
							</label>
							<input @keypress.enter="handleAddPromoCode()"
								class="appearance-none block w-full mb-2 bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text" v-model="txtPromotions">
							<button @click="handleAddPromoCode()" class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d]">Agregar codigo</button>
							<button @click="handleValidatePromotions()" class="p-4 bg-[#fab33c] text-[#000] font-semibold w-full mb-2 hover:bg-[#f8c56d]">Validar promociones</button>
							<div class="flex flex-row" v-for="(code, index) in promo_codes" :key="code">
								<button @click="handleQuitPromoCode(index)">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
										class="bi bi-x-circle-fill w-6 h-6" viewBox="0 0 16 16">
										<path
											d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
									</svg>
								</button>
								<p class="p-3 text-lg">{{ code }}</p>
							</div>
						</div>
					</div>
					<div class="flex flex-wrap p-3 rounded-lg mb-2 shadow-sl">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-2xl font-bold mb-2 text-[#26245C]"
								for="grid-last-name">
								Resumen
							</label>
							<p class="text-lg text-[#26245C] font-thin">Cantidad de Artículos</p>
							<p class="text-md font-semibold mb-2">{{ objSale.itemsquantity }}</p>
							<p class="text-lg text-[#26245C] font-thin">Subtotal</p>
							<p class="text-md font-semibold mb-2">${{ objSale.subtotal }}</p>
							<p class="text-lg text-[#26245C] font-thin">Impuestos</p>
							<p class="text-md font-semibold mb-2">${{ objSale.taxes }}</p>
							<p class="text-lg text-[#26245C] font-thin">Descuentos</p>
							<p class="text-md font-semibold mb-2" v-for="discounts in objSale.discounts" :key="discounts">
								{{ discounts.name + " - " + "$" + discounts.discount }}
							</p>
							<hr class="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4">
							<p class="text-2xl text-[#26245C] font-bold">Total</p>
							<p class="text-md font-semibold">${{ objSale.total }}</p>
						</div>
					</div>
					<!-- <button
						class="bg-[#fab33c] text-[#000] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 hover:bg-[#f8c56d]"
						@click="handleTest()">
						Pruebajson</button> -->
					<button
						class="bg-[#fab33c] text-[#000] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 hover:bg-[#f8c56d]"
						@click="handleShowTicket()">
						Completar venta</button>
				</div>
			</div>
		</div>

		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10"
			v-show="showTicket && !loader_sale && !loadPromotions">
			<button class="bg-[#26245C] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
				@click="handleShowTicket()">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</button>

			<div class="flex flex-col items-center mt-8" id="ticketsale">
				<div class="w-full md:wfull lg:w-full bg-white shadowCard p-4 items-center text-center">
					<p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
					<p class="text-lg font-bold mt-5">PASE A PAGAR A CAJA <br> {{ objSale.id }}</p>
					<!-- <p class="text-sm">Cotizacion de Origen: <strong class="font-bold">{{ objSale.client.estimates.externalid }}</strong></p> -->
					<p class="text-sm" v-for="estimate in objSale.client.estimates" :key="estimate">{{ estimate.externalid ? estimate.externalid : estimate.tranid }} - {{ moment(estimate.trandate).utc().format('DD/MMM/YYYY HH:mm:ss') }}></p>
					<p class="text-sm">Fecha y Hora: <strong class="font-bold">{{ objSale.trandate }}</strong></p>
            		<p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
					<p class="text-sm">Direccion: <strong class="font-bold">{{ locationsStore.address_text || 'No disponible' }}</strong></p>
					<p class="text-sm">Telefono: <strong class="font-bold">{{ locationsStore.location_phone || 'No disponible' }}</strong></p>
					<p class="text-sm text-center">Atendido por: <strong class="font-bold">{{ objSale.sellername }}</strong></p>
					<p class="text-sm text-center">Cliente: <strong class="font-bold">{{ objSale.client.companyname ? objSale.client.companyname : objSale.client.firstname + " " + objSale.client.lastname }}</strong></p>
					<!-- <p class="text-sm text-left">Telefono Cliente: <strong class="font-bold" v-for="client in datosPaginados" :key="client">{{ client.phone }}</strong></p> -->
					<hr class="hrDotted mt-5 mb-5">
					<!-- <div class="" v-for="item in objSale.items" :key="item">
						<p class="text-sm text-"><strong>{{ item.displayname }}</strong> ({{ item.shop_unit_selected.nsname }})<br> 
							{{ item.shop_quantity_bag}} x
							${{ item.shop_unit_price }} =
							${{ item.shop_total_price }}
						</p>
						<hr class="hrLine">
					</div> -->
					<div class="" v-for="item in itemsStore.itemsList.filter(item => item.quiantity > 0)" :key="item">
						<div class="grid grid-cols-6">
							<p class="text-[10px] text-center"><strong>Artículo</strong></p>
        					<p class="text-[10px] text-center"><strong>Unidad.</strong></p>
        					<p class="text-[10px] text-center"><strong>Cant.</strong></p>
							<p class="text-[10px] text-center"><strong>Entrega</strong></p>
        					<p class="text-[10px] text-center"><strong>Precio Unitario</strong></p>
        					<p class="text-[10px] text-center"><strong>SubTotal</strong></p>
							
							<p class="text-[9.5px] text-center">{{ item.id_item }} <br> {{ item.article?.displayname }} <br> {{ item.article?.description }}</p>
        					<p class="text-[9.5px] text-center">{{ item.shop_units?.nsname }}</p>
        					<p class="text-[9.5px] text-center">{{ item.quiantity }}</p>
							<p class="text-[9.5px] text-center">{{ item.entrega }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.rate).toFixed(2) }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.total).toFixed(2) }}</p>
						</div>
					</div>

					<p class="text-sm mt-5 "><strong>A PAGAR <br>{{ '===>' }}</strong> <strong>${{ objSale.total }} {{ '<===' }}</strong></p>
					<p class="text-xs"><strong>IVA Incluido</strong></p><br>ESTE TICKET ES VALIDO UNICAMENTE PARA PAGAR EN CAJA EL DIA DE SU EMISIÓN<br>
					<hr class="hrDotted mt-5">
					<div class="w-full text-right">
						<svg class="w-full" id="barcode"></svg>
					</div>
					<p class="text-xs mt-5">Muchas gracias por su compra <br> Vuelva pronto</p>
				</div>
			</div>
			<button class="bg-[#fab33c] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
				@click="handlePrintTicket()">
				Imprimir
			</button>
		</div>

		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loadPromotions">
			<Loader msg="Validando promociones"/>
		</div>

		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader_sale">
			<Loader msg="Guardando transacción"/>
		</div>
	</div>

	<!-- modal validate promotions -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="showValidatePromotions">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleModalValidatePromotions()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Validación de promociones
							</h3>
							<button @click="handleModalValidatePromotions()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3 text-center">
								<div class="flex flex-col w-full mb-6 mt-5">
									<div class="w-full mb-6 md:mb-0 text-center">
										<h1 class="font-bold text-3xl">¿Desea verificar si tiene promociones aplicables?</h1>
										<!-- <h2 class="font-semibold text-lg">¿Desea continuar validando las promociones?</h2> -->
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleValidatePromotions()">Validar promociones</button>
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleModalValidatePromotions()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal search and select estimate -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="estimateModal">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleModalSelectEstimate()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Seleccionar cotización
							</h3>
							<button @click="handleModalSelectEstimate()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3 text-center">
								<div class="flex flex-col w-full mb-6 mt-5">
									<div class="w-full mb-6 md:mb-0 text-left">
										<ul class="list-disc">
											<li class="font-semibold p-2" v-for="estimate in objSale.client.estimates"
												:key="estimate">{{ estimate.externalid ? estimate.externalid : estimate.tranid }} - {{ moment(estimate.trandate).utc().format('DD/MMM/YYYY HH:mm:ss') }}
												<button @click="handleSelectEstimate(estimate.internalid)"
													class=" bg-[#fab33c] p-2 rounded-lg hover:bg-[#f8c56d]">Seleccionar</button>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleModalSelectEstimate()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal search and select client -->
	<div class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalSearchClient">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleSearchClient()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Buscar Cliente
							</h3>
							<button v-show="!loader_search_client" @click="handleSearchClient()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3 text-center">
								<div class="flex flex-col w-full mb-6 mt-5" v-if="!loader_search_client">
									<div class="flex w-full items-center">
										<label for="simple-search" class="sr-only">Buscar</label>
										<div class="relative w-full">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
													xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
													<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
														stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
												</svg>
											</div>
											<input type="text" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Ingrese el nombre del cliente..." v-model="inpSearchClient" @keypress.enter="filterClient()" />
										</div>
										<button @click="filterClient()"
											class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
											<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
												viewBox="0 0 20 20">
												<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
											</svg>
											<span class="sr-only">Search</span>
										</button>
										<button @click="resetFilterClient()"
											class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
												class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
												<path fill-rule="evenodd"
													d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
												<path
													d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
											</svg>
											<span class="sr-only">Search</span>
										</button>
									</div>
									<div class="w-full mb-6 md:mb-0 text-left">
										<ul class="list-disc">
											<li class="font-semibold p-2" v-for="client in objSearchClient"
												:key="client">{{ client.internalid }} - {{ client.companyname ? client.companyname : client.firstname + ' ' + client.lastname }} - {{ client._drt_custom_rfc }}
												<button @click="handleSelectClient(client)"
													class=" bg-[#fab33c] p-2 rounded-lg hover:bg-[#f8c56d]">Seleccionar</button>
											</li>
										</ul>
									</div>
								</div>
								<div class="flex flex-col w-full" v-else>
									<Loader msg="Filtrando clientes"/>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button v-show="!loader_search_client" type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleSearchClient()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal for change level price aprobation -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalLevelProbation">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleLevelPriceAprovatio(-1)"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Solicitar aprobación del supervisor
							</h3>
							<button @click="handleLevelPriceAprovatio(-1)" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3">
								<div class="flex flex-col w-full mb-6 mt-5">
									<div class="flex w-full">
										<label for="simple-search" class="sr-only">Buscar</label>
										<div class="relative w-full">
											<p>Nombre de usuario del supervisor</p>
											<input type="text" id="simple-search"
												class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
												placeholder="Michael Odonell" v-model="formSupervisor.user" @keypress.enter="handleAprovedlevelPrice()" />

											<p>Contraseña del supervisor</p>	
											<input type="password" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
												v-model="formSupervisor.password" @keypress.enter="handleAprovedlevelPrice()" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleAprovedlevelPrice()">Aprobar</button>
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleLevelPriceAprovatio(-1)">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal show components -->
	<div class="relative w-full z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalshowComponents">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleShowComponentsArticleKit()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Componentes <strong>{{ infoArticleKit.displayname }}</strong>
							</h3>
							<button @click="handleShowComponentsArticleKit()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3">
								<div class="flex flex-col w-full mb-6 mt-5">
									<div class="flex w-full overflow-x-auto">
										<table class="text-left text-sm font-light bg-white">
											<thead
												class="border-b font-medium dark:border-neutral-500 text-center bg-[#D9D9D9] text-[#26245C]">
												<tr>
													<!-- <th scope="col" class="px-5 py-4">Img</th> -->
													<th scope="col" class="px-5 py-4">Artículo</th>
													<th scope="col" class="px-5 py-4">Cod Artículo</th>
													<th scope="col" class="px-5 py-4">Descripción</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b dark:border-neutral-500 text-center bg-[#e8e8e8]"
													v-for="item in infoArticleKit.components" :key="item">
													<td class="whitespace-nowrap px-2 py-4">{{ item.article.displayname }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.article.upccode }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.article.salesdescription }}</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 ml-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleShowComponentsArticleKit()">Cerrar</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.shadow-inp {
	box-shadow: rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px;
}

.shadow-sl {
	box-shadow: inset 0 0 10px #00000045;
}

.infoSale {
	zoom: 100%;

	@media (min-width: 411px) {
		zoom: 100%;
	}

	@media (min-width: 500px) {
		zoom: 70%;
	}

	@media (min-width: 720px) {
		zoom: 80%;
	}

	@media (min-width: 1000px) {
		zoom: 60%;
	}

	@media (min-width: 1300px) {
		zoom: 65%;
	}

	@media (min-width: 1700px) {
		zoom: 80%;
	}
}

.my-fixed-item {
	position: fixed;
	word-wrap: break-word;
}

/* HTML: <div class="loader"></div> */
.loader {
	width: 190px;
	height: 24px;
	box-shadow: 0 5px 0 #26245C;
	background: linear-gradient(#26245C 0 0) 50%/3px 100% no-repeat;
	display: grid;
}

.loader:before,
.loader:after {
	content: "";
	grid-area: 1/1;
	background: radial-gradient(circle closest-side, var(--c, #F4A51F) 92%, #0000) 0 0/calc(100%/4) 100%;
	clip-path: inset(0 50% 0 0);
	animation: l3 1s infinite linear;
}

.loader:after {
	--c: #26245C;
	clip-path: inset(0 0 0 50%);
}

@keyframes l3 {
	100% {
		background-position: calc(100%/3) 0
	}
}
</style>