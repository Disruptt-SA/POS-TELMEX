<script setup>
import { onMounted, ref, inject} from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useSaleStore } from '../../stores/sale';
import { useCustomersStore } from '../../stores/customer';
import { useItemsStore } from '../../stores/items';
import { useInvoicesStore } from '../../stores/invoices';
import { useCashStore } from '../../stores/cash';
import { useLoginStore } from '../../stores/login';
import { useLocationsStore } from '../../stores/locations';
import posLogo from '../../assets/pos_logo.png';

import moment from 'moment';

//components
import Loader from '../../components/Loader.vue';

//Variables
const locationsStore = useLocationsStore();
const toast = inject('toast')
const menuStore = useMenuStore()
const saleStore = useSaleStore()
const customerStore = useCustomersStore()
const invoicesStore = useInvoicesStore()
const itemStore = useItemsStore()
const cashStore = useCashStore()
const loginStore = useLoginStore();
const loadingTransactions = ref(false)
const showCharge = ref(false)
const saleData = ref({
	externalid: "SL-1709133235172108035",
	id_cashier: null,
	id_customer: 6382,
	id_seller: 1021,
	internalid: 26,
	itemsQuantity: 1,
	cashier: null,
	status_sale: "",
	subtotalSale: 150.00,
	taxSale: 24.00,
	totalSale: 174.00,
	trandate: "2024-02-28",
	seller:{
		cf_drt_custom_psw: "",
		cf_drt_custom_rol_id: 4,
		cf_drt_custom_usr: "Alma Mota",
		email: "admon2.concretos@grupotrejo.com",
		externalid: "EMP03",
		firstname: "Alma",
		internalid: 1021,
		lastname: "Mota",
		location_id: 3,
		subsidiary_id: 3
	},
	customer:{

	}
});
const modalMethodPayment = ref(false)
const modalOpenCashier = ref(false)
const methodsPayments = ref([])
const customerData = ref({
	companyname: ""
});
const formMethodPayment = ref({
	method: "",
	amount: 0,
	totalPaid: 0,
	change: 0
})
const showTicket = ref(false)
const amount_cash_open = ref(0)
const rango_fuera = ref(0)
const rango_dentro = ref(0)
const verified_cash = ref(false)
const searchText = ref("")
const objSales = ref([])
const dateToday = ref(Date.now())
const objClientAddress = ref({})
const facturacion_direction = ref(0)
const listClients = ref([]);
const invoices_list = ref([])
const payments_terms = ref([])
const payments_forms = ref([])
const cfdi_list = ref([])
const payments_sale = ref({
	sale_id:null,
	sat_payment_method_master_id: null,
	sat_payment_term_master_id: null,
	sat_cfdi_master_id: null,
	payments:[]
})
const formSupervisor = ref({
	user:null,
	password: null
})
const modalshowComponents = ref(false)
const infoArticleKit = ref({})
const cashier_open_info = ref({})
const subtotalSale = ref(0)
const itemsQuantity = ref(0)
const taxesSale = ref(0)
const totalSale = ref(0)
const customer_data = ref({})

//methods
onMounted(async () => {
	loadingTransactions.value = true
	handleRefreshCashier()
	listClients.value = await customerStore.getListCustomers();
	payments_terms.value = await customerStore.paymentTermList()
	payments_forms.value = await customerStore.formPaymentList()
	cfdi_list.value = await customerStore.getCfdis()
	loadingTransactions.value = false
})

const handleRefreshCashier = async() => {
	await getSales()
	verifyCashier()
}

const getSales = async() => {
	showTicket.value = false;
	const respGetSales = await saleStore.getSales();
	console.log("respGetSales", respGetSales)
	if(respGetSales.code === 404){
		toast.open({
			message: `${respGetSales.msg}`,
			type: 'warning'
		})
		return false
	}

	objSales.value = saleStore.objSales.data

	invoices_list.value = await invoicesStore.getInvoices()
	for (const sale of objSales.value) {
		invoices_list.value?.data.forEach(invoice => {
			if(invoice.id_sale == sale.internalid){
				sale.id_invoice = invoice.internalid
				sale.invoice_timbrado = invoice.invoice_timbrado
				if(invoice.serie_timbrado != null){
					sale.invoice_timbrado = true
				}else{
					sale.invoice_timbrado = false
				}
			}
		});
	}

	if(objSales.value.length > 0){
		let objFilterSalesOrder = objSales.value.filter((sale) => sale.status_sale != "Cobrada" || sale.status_sale == "Cobrada" && !sale.invoice_timbrado)
		let objSalesOrder = objFilterSalesOrder.sort((a, b) => {
			if(a.internalid > b.internalid){
				return -1
			}
		})
		objSales.value = objSalesOrder
	}

	console.log("objsales", objSales.value)
}

const handleCancelCharge = () => {
	saleData.value = []
	showCharge.value = !showCharge.value;
}

const handleShowCharge = async (saleid, index) => {
	try {
		console.log("saleid", saleid)

		subtotalSale.value = 0
		itemsQuantity.value = 0
		taxesSale.value = 0
		totalSale.value = 0

		let globalDiscounts = 0
		if(!verified_cash.value){
			toast.open({
				message: `No se ha realizado la apertura de caja, por favor aperturelo para continuar`,
				type: 'warning'
			})
			return false
		}
		loadingTransactions.value = true
		dateToday.value = Date.now()
		saleData.value = await saleStore.getSaleById(saleid)
		//saleData.value = objSales.value[index]
		methodsPayments.value = []

		const customerData = await customerStore.getCustomerWithId(saleData.value.id_customer)
		customer_data.value = customerData[0]

		console.log("customer_data.value", customer_data.value)

		saleData.value.SaleArticles.forEach(async(article) => {
			let article_obj = await itemStore.getItemInfo(article.id_item)
			article_obj = article_obj.data[0]
			const unist_list = article_obj.unitlist
			const price_list = article_obj.PriceList
		
			console.log("Number(article.quiantity)", Number(article.quiantity))

			const subtotal = Number(article.rate) * Number(article.quiantity)

			let shop_unit_selected = {}
			let shop_list_selected = {}

			if (article_obj.unitlist.length > 0) {
                const units_list = article_obj.unitlist

                units_list.forEach(unit => {
                    if (unit.nsid == article.units) {
                        shop_unit_selected = unit
                    }
                });
                
            } else {
                shop_unit_selected = {
                    nsname: article_obj.custitem_tipo_articulo
                }
            }
			// unist_list.forEach(unit => {
			// 	if(unit.nsid == article.units){
			// 		shop_unit_selected = unit
			// 	}
			// });

			price_list.forEach(price => {
				if(price.pricelevel_id == article.pricelevel){
					shop_list_selected = price
				}
			});

			article.shop_units = shop_unit_selected
			article.shop_price = shop_list_selected
			article.lineTotal = Number(subtotal).toFixed(2)

			subtotalSale.value += (Number(article.rate) * Number(article.quiantity))
			itemsQuantity.value += Number(article.quiantity)
			taxesSale.value += Number(subtotal) * 0.16
			totalSale.value += Number(subtotal) + (Number(subtotal) * 0.16)

			saleData.value.subtotalSale = subtotalSale.value.toFixed(2)
			saleData.value.itemsQuantity = itemsQuantity.value
			saleData.value.taxSale = taxesSale.value.toFixed(2)
			saleData.value.globalDiscounts = Number(saleData.value.descuento_global)
			saleData.value.totalSale = totalSale.value.toFixed(2)

			saleData.value.subtotalSale -= Number(saleData.value.descuento_global)
			saleData.value.taxSale = saleData.value.subtotalSale.toFixed(2) * 0.16
			saleData.value.totalSale = saleData.value.subtotalSale + saleData.value.taxSale
		})

		objClientAddress.value = listClients.value.filter((client)=> client.nsid == saleData.value.customer.nsid)
		//objClientAddress.value = await customerStore.getCustomerWithObj({name: saleData.value.customer.nsid})
		payments_sale.value.sat_cfdi_master_id = saleData.value.customer._drt_custom_uso_cfdi

		console.log("saleData", saleData.value)
		console.log("objClientAddress", objClientAddress.value)
		showCharge.value = !showCharge.value;
		loadingTransactions.value = false
	} catch (error) {
		console.error("Error", error)
		saleData.value = []
		showCharge.value = !showCharge.value;
		loadingTransactions.value = false
	}
	console.log("saledata", saleData.value)
}

const handleShowMethodPayment = () => {
	modalMethodPayment.value = !modalMethodPayment.value
	formMethodPayment.value = {
		method: "",
		amount: 0,
		totalPaid: 0,
		change: 0
	}
}

const recalculate = () => {
	let total = 0
	let change_cash = 0
	methodsPayments.value.forEach(payment => {
		const amount = Number(payment.amount)
		total += amount
	});

	if(total > saleData.value.totalSale){
		change_cash = total - saleData.value.totalSale
	}else{
		change_cash = 0
	}

	formMethodPayment.value.change = change_cash
	formMethodPayment.value.totalPaid = total
}

const handleCancelmethodPayment = (index) => {
	const methodPayment = methodsPayments.value[index]
	console.log("methodPayment", methodPayment)

	if(methodPayment.method == 5){
		saleData.value.customer.saldo_disponible = saleData.value.customer.saldo_disponible + methodPayment.amount
	}

	methodsPayments.value.splice(index, 1)
	recalculate()
}

const handleAprovedCreditModal = async(dias_vencidos, saldo_vencido) => {
	const respAprobation = await handleAprovedCredit()

	if(respAprobation.code === 404){
		toast.open({
			message: `Ocurrio un error al querer aprobar el credito <br/> ${respAprobation.msg}`,
			type: 'error'
		})
		return false
	}
	if(respAprobation.code === 401){
		toast.open({
			message: `${respAprobation.msg}`,
			type: 'error'
		})
		return false
	}
	if(respAprobation.code === 200){
		if(dias_vencidos > 0 || saldo_vencido > 0){
			if(respAprobation.data.cf_drt_custom_rol_id == 101){
				toast.open({
					message: `Aprobación del credito realizada exitosamente.`,
					type: 'success'
				})

				methodsPayments.value.push(formMethodPayment.value)
				console.log("methodsPayments", methodsPayments.value)

				formMethodPayment.value = {
					method: "",
					amount: 0,
					totalPaid: 0,
					change: 0
				}
				formSupervisor.value={
					user:"",
					password:""
				}
				recalculate()

				modalMethodPayment.value = !modalMethodPayment.value
			}else{
				toast.open({
					message: `El usuario ${respAprobation.data.firstname} ${respAprobation.data.lastname} no cuenta con los permisos suficientes para aprobar el crédito`,
					type: 'error'
				})
				toast.open({
					message: `El cliente cuenta con ${dias_vencidos} días de atraso en su credito`,
					type: 'error'
				})
				toast.open({
					message: `El cliente cuenta con ${saldo_vencido} saldo vencido en su credito`,
					type: 'error'
				})
				return false
			}
		}else{
			if(respAprobation.data.cf_drt_custom_rol_id == 101 || respAprobation.data.cf_drt_custom_rol_id == 3){
				toast.open({
					message: `Aprobación del credito realizada exitosamente.`,
					type: 'success'
				})

				methodsPayments.value.push(formMethodPayment.value)
				console.log("methodsPayments", methodsPayments.value)

				formMethodPayment.value = {
					method: "",
					amount: 0,
					totalPaid: 0,
					change: 0
				}
				formSupervisor.value={
					user:"",
					password:""
				}
				recalculate()

				modalMethodPayment.value = !modalMethodPayment.value
			}else{
				toast.open({
					message: `El usuario ${respAprobation.data.firstname} ${respAprobation.data.lastname} no cuenta con los permisos suficientes para aprobar el crédito`,
					type: 'error'
				})
				return false
			}
		}
	}
}

const handleAddMethodPayment = async() => {
	/* let change_cash = 0;
	let total_paid = Number(formMethodPayment.value.totalPaid) + Number(formMethodPayment.value.amount)
	if (total_paid > saleData.value.totalSale) {
		change_cash = total_paid - saleData.value.totalSale
	} */
	let flagMethod = false
	let flagMonto = false
	let monto_pagando = 0

	if(formMethodPayment.value.method == 5){
		console.log("Metodo de pago con credito del cliente")
		console.log("saldo monto", formMethodPayment.value.amount)
		console.log("saldo cliente", saleData.value.customer.saldo_disponible)
		console.log("customerData.value.dias_retraso", customer_data.value)

		if(saleData.value.customer.saldo_disponible > 0){
			console.log("saldo disponible")
			if(formMethodPayment.value.amount < saleData.value.customer.saldo_disponible){
				methodsPayments.value.push(formMethodPayment.value)
				console.log("methodsPayments", methodsPayments.value)

				saleData.value.customer.saldo_disponible = saleData.value.customer.saldo_disponible - formMethodPayment.value.amount

				formMethodPayment.value = {
					method: "",
					amount: 0,
					totalPaid: 0,
					change: 0
				}
				formSupervisor.value={
					user:"",
					password:""
				}
				recalculate()

				modalMethodPayment.value = !modalMethodPayment.value
			}else{
				if(formSupervisor.value.user == "" && formSupervisor.value.password == "" || formSupervisor.value.user == null && formSupervisor.value.password == null){
				/* Se valida que el cliente tenga saldo disponible y que el monto no sobrepase del saldo disponible para gastar */
					toast.open({
						message: `Ingrese el nombre y contraseña del supervisor`,
						type: 'warning'
					})
					if(saleData.value.customer.saldo_disponible <= 0){
						toast.open({
							message: `<p class="text-center">El cliente no cuenta con saldo suficiente.</p> <br/> <p class="text-center"><b>Solicite una extensión de credito con aprobación del supervisor.</b></p>`,
							type: 'warning'
						})
					}else if(formMethodPayment.value.amount > saleData.value.customer.saldo_disponible){
						toast.open({
							message: `<p class="text-center">El cliente no cuenta con saldo suficiente.</p> <br/> <p class="text-center"><b>Solicite una extensión de credito con aprobación del supervisor.</b></p>`,
							type: 'warning'
						})
					}
					return false
				}else{
					console.log("entro")
					saleData.value.customer.saldo_disponible = saleData.value.customer.saldo_disponible - formMethodPayment.value.amount
					handleAprovedCreditModal(saleData.value.customer.dias_retraso, saleData.value.customer.saldo_vencido)
				}
			}
		}else{
			if(formSupervisor.value.user == "" && formSupervisor.value.password == "" || formSupervisor.value.user == null && formSupervisor.value.password == null){
			/* Se valida que el cliente tenga saldo disponible y que el monto no sobrepase del saldo disponible para gastar */
				toast.open({
					message: `Ingrese el nombre y contraseña del supervisor`,
					type: 'warning'
				})
				if(saleData.value.customer.saldo_disponible <= 0){
					toast.open({
						message: `<p class="text-center">El cliente no cuenta con saldo suficiente.</p> <br/> <p class="text-center"><b>Solicite una extensión de credito con aprobación del supervisor.</b></p>`,
						type: 'warning'
					})
				}else if(formMethodPayment.value.amount > saleData.value.customer.saldo_disponible){
					toast.open({
						message: `<p class="text-center">El cliente no cuenta con saldo suficiente.</p> <br/> <p class="text-center"><b>Solicite una extensión de credito con aprobación del supervisor.</b></p>`,
						type: 'warning'
					})
				}
				return false
			}else{
				console.log("entro")
				handleAprovedCreditModal(saleData.value.customer.dias_retraso, saleData.value.customer.saldo_vencido)
			}
		}
	}else{
		// 1 - Tarjeta credito
		// 2 - Tarjeta debito
		// 3 - Efectivo
		// 4 - Saldo a favor del cliente
		// 5 - ???
		// 6 - Transferencia

		// console.log('formMethodPayment.value empezando el else', formMethodPayment.value)
		console.log("methodsPayments", methodsPayments.value)
		// console.log("total de la venta? ", saleData.value.totalSale)
		let total_venta = Number(saleData.value.totalSale)

		methodsPayments.value.forEach(formaPago => {
			monto_pagando = monto_pagando + formaPago.amount
			if (formaPago.method == 3 && formMethodPayment.value.method == 3) {
				toast.open({
					message: 'Lo siento, ya existe el metodo de pago "Efectivo", ingrese otro método de pago.',
					type: 'error'
				})
				flagMethod = true;
			}
		});

		// console.log('formMethodPayment.value? ', formMethodPayment.value)
		monto_pagando = monto_pagando + formMethodPayment.value.amount
		console.log('monto total que se está pagando? ', monto_pagando)
		console.log('monto del actual metodo de pago? ', formMethodPayment.value.amount)

		let sobrante = total_venta - monto_pagando
		console.log('sobrante? ', sobrante)
		if(formMethodPayment.value.amount < 0){
			toast.open({
				message: `No puede ingresar un valor negativo`,
				type: 'error'
			})
			flagMethod = true;
		}
		if (sobrante.toFixed(2) < 0 && Number(formMethodPayment.value.method).toFixed(2) != 3) {
			toast.open({
				message: `NO puede ingresar mas dinero que el total de la venta, cantidad correcta a cobrar: ${Number(formMethodPayment.value.amount + sobrante).toFixed(2)}`,
				type: 'error'
			})
			flagMethod = true;
		}

		console.log('banderita? flagMethod', flagMethod)
		if (flagMethod) {
			return false
		}
		methodsPayments.value.push(formMethodPayment.value)

		formMethodPayment.value = {
			method: "",
			amount: 0,
			totalPaid: 0,
			change: 0
		}
		recalculate()

		modalMethodPayment.value = !modalMethodPayment.value
		// console.log("paymentmethods", formMethodPayment.value)
	}
}

const handleTestJson = () => {
	saleStore.cashierInfo = localStorage.USER_INFO
	saleStore.cashierName = localStorage.USER_INFO.cf_drt_custom_usr
	saleData.value.id_cashier = saleStore.cashierInfo
	saleData.value.cashier_name = saleStore.cashierName


}

const closeTicket = () => {
	showTicket.value = !showTicket.value
}

const handleShowTicket = (close) => {
	let total = 0
	console.log('formMethodPayment? ', formMethodPayment.value)
	// console.log('methodsPayments? ', methodsPayments.value)
	methodsPayments.value.forEach(payment => {
		const amount = Number(payment.amount)
		total += amount
	});
	console.log('methodsPayments? ', methodsPayments.value)

	if(facturacion_direction.value == 0){
		toast.open({
			message: `<p class="text-center">La factura no se timbrara, ya que el cliente no tiene configurado una dirección de facturación.</p> <br/> <p class="text-center"><b>Si desea timbrar la factura elija una dirección de facturación.</b></p>`,
			type: 'warning'
		})
	}

	if(total < saleData.value.totalSale){
		toast.open({
			message: `No se ha realizado el cobro total de la venta`,
			type: 'warning'
		})
		return false
	}else{
		// console.log('saleStore? ', saleStore)
		// console.log('localStorage.USER_INFO? ', JSON.parse(localStorage.USER_INFO))
		saleStore.cashierInfo = localStorage.USER_INFO
		saleStore.cashierName = localStorage.USER_INFO.cf_drt_custom_usr
		saleData.value.id_cashier = saleStore.cashierInfo
		saleData.value.cashier_name = saleStore.cashierName
		// console.log("saleData.value.cashier", saleData.value.id_cashier)
		if (saleData.value.id_cashier == 0) {
			toast.open({
				message: `No esta definido el cajero, por favor seleccione uno...`,
				type: 'warning'
			})
			return false;
		}else{
			showTicket.value = !showTicket.value
		}
	}
}

const timbrado_factura = async(invoiceid) => {
	try {
		console.log("invoiceid", invoiceid)
		const respTimbrado = await invoicesStore.timbrarInvoice(invoiceid)
		console.log("respTimbrado", respTimbrado)
		if(respTimbrado.code == 500){
			toast.open({
				message: `Error al timbrar factura <b/> ${respTimbrado.msg}`,
				type: 'error'
			})
		}else{
			toast.open({
				message: `Factura timbrada correctamente <b/> ${respTimbrado.msg}`,
				type: 'success'
			})
			handleRefreshCashier()
		}
	} catch (error) {
		toast.open({
			message: `Error al timbrar la factura <b/> ${error}`,
			type: 'error'
		})
	}
}

const handlePrintTicket = async () => {
	console.log("objSale.value.sellerid", saleData.value.cashier)
	console.log("monto de la venta?", saleData.value.totalSale)

	const payments = []

	methodsPayments.value.forEach(payment => {
		if (payment.method == 3) {
			payment.amount = Number(Number(payment.amount - formMethodPayment.value.change).toFixed(2))
		}

		payments.push({
			externalid:"",
			amount_pay:Number(payment.amount),
			parcialidades:null,
			method_pay:Number(payment.method,)
		})
	});
	console.log("methodsPayments? despues", methodsPayments.value)

	payments_sale.value = {
		sale_id:saleData.value.internalid,
		id_direccion_facturacion: facturacion_direction.value,
		sat_payment_method_master_id: payments_sale.value.sat_payment_method_master_id ? payments_sale.value.sat_payment_method_master_id : null,
		sat_payment_term_master_id: payments_sale.value.sat_payment_term_master_id ? payments_sale.value.sat_payment_term_master_id : null,
		sat_cfdi_master_id: payments_sale.value.sat_cfdi_master_id ? payments_sale.value.sat_cfdi_master_id : null,
		payments:payments
	}

	loadingTransactions.value = true;
	const prtHtml = document.getElementById('ticketsale').innerHTML;
	const WinPrint = window.open('', '', 'left=0,top=0,width=750,height=900,toolbar=0,scrollbars=0,status=0');
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

	console.log("payments_sale", payments_sale.value)

	const respPayments = await saleStore.createSalePayment(payments_sale.value)
	console.log("resppayments", respPayments)

	if (respPayments.status == "error") {
		toast.open({
			message: `${respPayments.msg}`,
			type: 'error'
		})
		showTicket.value = false
	} else if(respPayments.status == "success") {
		try {
			cashier_open_info.value = JSON.parse(localStorage.cashier_info)
			//cashier_open_info.value.total_cash_sales += Number(saleData.value.totalSale)
			
			methodsPayments.value.forEach(payment => {
				if(payment.method == 3 || payment.method == 6){
					cashier_open_info.value.total_cash_sales += Number(payment.amount)
					// cashier_open_info.value.total_cash_sales += Number(payment.amount)
				}
				if(payment.method == 1 || payment.method == 2){
					cashier_open_info.value.total_vouch_sales += Number(payment.amount)
					// cashier_open_info.value.total_vouch_sales += Number(payment.amount)
				}
			});

			localStorage.cashier_info = JSON.stringify(cashier_open_info.value)

			toast.open({
				message: `${respPayments.msg}`,
				type: 'success'
			})

			if(respPayments.data?.id_invoice != null){
				const respTimbrado = await invoicesStore.timbrarInvoice(respPayments.data.id_invoice)
				if(respTimbrado.code == 500){
					toast.open({
						message: `Error al timbrar factura <b/> ${respTimbrado.msg}`,
						type: 'error'
					})
				}else{
					toast.open({
						message: `Factura timbrada correctamente <b/> ${respTimbrado.msg}`,
						type: 'success'
					})
				}
			}else{
				toast.open({
						message: `No se pudo timbrar la factura ya que no se ha creado por completo el mismo`,
						type: 'warning'
					})
			}

			showTicket.value = false
			handleCancelCharge()
			await getSales()
			await invoicesStore.getInvoices();
		} catch (error) {
			toast.open({
				message: `Error <b/> ${error}`,
				type: 'error'
			})
		}
	}

	loadingTransactions.value = false;
}

const handleModalOpenCashier = () => {
	modalOpenCashier.value = !modalOpenCashier.value
}

const openCash = () => {
	cashStore.openCash(Number(amount_cash_open.value), Number(rango_fuera.value), Number(rango_dentro.value))
	const verify = verifyCashier()
	if(verify){
		handleModalOpenCashier()
	}else{
		toast.open({
			message: `El monto no puede ser igual o menor a 0`,
			type: 'warning'
		})
	}
}

const verifyCashier = () => {
	cashier_open_info.value = JSON.parse(localStorage.cashier_info)
	console.log("cashier_open_info", cashier_open_info.value)
	if(cashier_open_info.value != null){
		if(cashier_open_info.value.mount_open > 0){
		verified_cash.value = true
		}else{
			verified_cash.value = false
		}
	}else{
		verified_cash.value = false
	}
	return verified_cash.value
}

const includesSomeWordsSalesfilter = (original, buscadas) => {
    return buscadas.split(' ').some(p => original.includes(p))
}

const filterOrder = () => {
	if(searchText.value.length == 0){
		objSales.value = saleStore.objSales.data
		return false
	}

	let newObj = [];

	if(searchText.value.length <= 0){
		newObj = []
	}else{
		try {
			saleStore.objSales.data.filter(obj => {
				if (obj.externalid != null) {
					const verified = includesSomeWordsSalesfilter(obj.externalid.toLowerCase(), searchText.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
				}else if(obj.firstname != null && obj.lastname != null){
					const verified = includesSomeWordsSalesfilter(obj.externalid.toLowerCase(), searchText.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
				}
			});

			if (newObj.length === 0) {
				toast.open({
					message: `No se encontro la venta`,
					type: 'warning'
				})
				objSales.value =  saleStore.objSales.data;
			} else {
				objSales.value = newObj;
				//getDataPagina(1)
			}
		} catch (error) {
			refreshFilter()
			toast.open({
				message: `No se encontro la venta`,
				type: 'warning'
			})
		}
	}
}

const refreshFilter = () => {
	objSales.value = saleStore.objSales.data
	searchText.value = ""
}

const handleAprovedCredit = async() => {
	try {
		const data = formSupervisor.value
		const respAprobation = await loginStore.handleLoginAprobation(data)
		return respAprobation
	} catch (error) {
		console.log("error", error)
		toast.open({
			message: "Error al buscar al usuario, usuario o contraseñas inexistentes",
			type: 'error'
		})
		return {
			code: 400
		}
	}
}

const handleShowComponentsArticleKit = (articleKit) => {
	modalshowComponents.value = !modalshowComponents.value
	console.log("articleKit", articleKit)
	infoArticleKit.value = articleKit
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="!showCharge && !loadingTransactions && !showTicket">
			<div class="w-full px-2 bg-white rounded-lg lg:col-span-3">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white rounded-t-lg bg-[#26245C] w-40"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2 w-full">
						<p class="inline-block p-4 text-center text-lg font-bold">Ventas</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="bg-[#26245C] p-2 md:p-8 rounded-b-lg rounded-e-lg">
						<div class="relative w-full">
							<button @click="handleModalOpenCashier()" class="bg-[#fab33c] text-[#000000] font-semibold px-8 py-2 rounded-xl shadow-inp mb-5 h-12 lg:w-1/6 md:w-full">
								{{ verified_cash ? 'Verificar caja' : 'Abrir caja' }}
							</button>
							<button @click="handleRefreshCashier()" class="bg-[#fab33c] text-[#000000] font-semibold px-8 py-2 rounded-xl shadow-inp mb-5 h-12 lg:w-1/6 md:w-full ml-0 md:ml-2 lg:ml-2">
								Recargar caja
							</button>
						</div>
						<div class="flex items-center">
							<label for="simple-search" class="sr-only">Buscar</label>
							<div class="relative w-full">
								<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
									</svg>
								</div>
								<input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar Orden de Venta..." v-model="searchText" />
							</div>
							<button @click="filterOrder()" @keypress.enter="filterOrder()" class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
								<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
								</svg>
								<span class="sr-only">Search</span>
							</button>
							<button @click="refreshFilter()"
								class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
									<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
									<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
								</svg>
								<span class="sr-only">Search</span>
							</button>
						</div>
					</div>

					<!-- TABLA Ordenes -->
					<div class="flex flex-col overflow-x-auto bg-white mt-5">
						<div class="sm:-mx-6 lg:-mx-8">
							<div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
								<div class="overflow-x-auto">
									<table class="min-w-full text-left text-sm font-light">
										<thead
											class="border border-[#26245c73] font-medium text-center bg-[#D9D9D9] text-[#26245C]">
											<tr>
												<th scope="col" class="px-5 py-4"># de ticket</th>
												<th scope="col" class="px-5 py-4">Status</th>
												<th scope="col" class="px-5 py-4">Cliente</th>
												<th scope="col" class="px-5 py-4"># Factura</th>
												<th scope="col" class="px-5 py-4">Factura timbrada</th>
												<th scope="col" class="px-5 py-4">Subtotal</th>
												<th scope="col" class="px-5 py-4">Impuestos</th>
												<th scope="col" class="px-5 py-4">Descuento(s)</th>
												<th scope="col" class="px-5 py-4">Total</th>
												<th scope="col" class="px-5 py-4 border-l-2 border-slate-500">Cobrar
												</th>
											</tr>
										</thead>
										<tbody>
											<tr class="border border-[#26245c73] text-center" :class="sale.status_sale == 'Cobrada' ? 'bg-green-100' : 'bg-transparent'" v-for="(sale, index) in objSales" :key="sale.internalid">
												<td class="whitespace-nowrap px-2 py-4">{{sale.externalid }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{sale.status_sale }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{sale.customer?.companyname ? sale.customer?.companyname : sale.customer?.firstname + " " + sale.customer?.lastname  }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{ sale.id_invoice }}</td>
												<td class="whitespace-nowrap px-2 py-4">
													<div class="" v-if="sale.invoice_timbrado != null">
														<svg v-if="sale.invoice_timbrado" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill w-8 h-8 text-green-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
															<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
														</svg>
														<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill w-8 h-8 text-red-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
															<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
														</svg>
													</div>
												</td>
												<td class="whitespace-nowrap px-2 py-4">${{ sale.sub_total_with_discount }}</td>
												<td class="whitespace-nowrap px-2 py-4">${{ sale.tax }}</td>
												<td class="whitespace-nowrap px-2 py-4">${{ (sale.discount_art_uni + sale.discount_global + sale.discount_line).toFixed(2) }}</td>
												<td class="whitespace-nowrap px-2 py-4 font-bold">${{ sale.total }}</td>
												<td class="px-2 py-4 border-l-2 border-slate-500">
													<button
														class="bg-[#fab33c] text-[#000000] w-full font-semibold px-8 py-2 rounded-xl shadow-inp"
														@click="handleShowCharge(sale.internalid, index)">Cobrar</button>
														<button
															class="bg-[#26245C] text-white w-full font-semibold px-8 py-2 rounded-xl shadow-inp mt-2"
															@click="timbrado_factura(sale.id_invoice)" v-if="sale.invoice_timbrado === false">Timbrar</button>
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
		</div>

		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10 rounded-3xl" v-show="showCharge && !loadingTransactions && !showTicket">
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
							<div class="w-full">
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="grid-last-name" type="text"
									placeholder="Ingrese el nombre o código del articulo"
									v-on:keypress="inputItemSearch()" v-on:keyup.delete="inputItemSearch()">
							</div>
						</div>

						<!-- TABLA Busqueda de Artículos -->
						<div class="flex flex-col overflow-x-auto bg-white">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead
												class="border border-[#26245c73] font-medium text-center bg-[#D9D9D9] text-[#26245C]">
												<tr>
													<th scope="col" class="px-5 py-4">Img</th>
													<th scope="col" class="px-5 py-4">Artículo</th>
													<th scope="col" class="px-5 py-4">Cod Artículo</th>
													<th scope="col" class="px-5 py-4">Und Medida</th>
													<th scope="col" class="px-5 py-4">Lista de Precio</th>
													<th scope="col" class="px-5 py-4">Precio</th>
													<!-- <th scope="col" class="px-5 py-4">Stock</th> -->
													<th scope="col" class="px-5 py-4">Cantidad</th>
													<th scope="col" class="px-5 py-4">Entrega</th>
													<th scope="col" class="px-5 py-4">Fecha de Entrega</th>
													<th scope="col" class="px-5 py-4 border-l-2 border-slate-500">Total
													</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border border-[#26245c73] dark:border-neutral-500 text-center"
													v-for="item in saleData.SaleArticles" :key="item">
													<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
														<div class="flex flex-wrap justify-center">
															<svg v-if="item.article.custitem_tipo_articulo == 'Kit'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" @click="handleShowComponentsArticleKit(item)" class="bi bi-eye hover:cursor-pointer text-[#26245C]" viewBox="0 0 16 16">
																<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
																<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
															</svg>
														</div>
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.article.displayname }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.article.upccode }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.shop_units?.nsname }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ item.pricelevel != -1 ? item.shop_price?.pricelevel_name : "Personalizado" }}</td>
													<td class="whitespace-nowrap px-2 py-4">${{ Number(item.rate).toFixed(2) }}</td>
													<!-- <td class="whitespace-nowrap px-2 py-4">X Disponible</td> -->
													<td class="whitespace-nowrap px-2 py-4">{{ item.quiantity }}</td>
													<td class="whitespace-nowrap px-2 py-4">
														<p v-if="item.delivery_type == null"></p>
														<select v-else
															class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
															v-model="item.delivery_type" disabled>
															<option value="1">Tienda</option>
															<option value="2">Domicilio</option>
															<option value="3">Recoge</option>
														</select>
													</td>
													<td class="whitespace-nowrap px-2 py-4">
														<p class="appearance-none block w-full text-xs text-gray-700 rounded py-3 px-4 leading-tight focus:outline-none" v-if="item.delivery_date == null"></p>
														<p class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" v-else>{{ item.delivery_date != null ? moment(item.delivery_date).utc().format('DD/MM/YYYY') : ""  }}</p>
													</td>
													<td
														class="whitespace-nowrap px-2 py-4 border-l-2 border-slate-500 text-lg">
														${{ Number(item.lineTotal).toFixed(2) }}
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
					<div class="flex flex-wrap rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Fecha
							</label>
							<p class="appearance-none block w-full p-2 text-center font-semibold text-lg bg-gray-50 text-gray-700 border border-gray-300 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 shadow-sl">{{ moment(dateToday).format('DD/MMM/YYYY') }}</p>
						</div>
					</div>
					<!-- <div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Tipo de registro
							</label>
							<select
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text">
								<option value="venta" selected>Venta</option>
								<option value="cotización">Cotización</option>
							</select>
						</div>
					</div> -->
					<!-- <div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Cotización de origen
							</label>
							<input
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								id="grid-last-name" type="text">
						</div>
					</div> -->
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								información del cliente
							</label>
							<div class="flex flex-row">
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400"
									id="grid-last-name" type="text" placeholder="Buscar cliente"
									:value="saleData.customer?.companyname" disabled>
								<p class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 disabled:bg-gray-400 disabled:border-gray-400 text-center content-center"> 
									{{ saleData.customer?._drt_custom_tipo_cliente == 1 ? "Credito" : "Contado" }}
								</p>
							</div>
							<div v-if="saleData.customer?._drt_custom_tipo_cliente == 1">
								<p class="">Saldo disponible</p>
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400"
									id="grid-last-name" type="text" placeholder="Buscar cliente"
									:value="saleData.customer?.saldo_disponible" disabled>
							</div>
							<div v-if="saleData.customer?._drt_custom_tipo_cliente == 1" class="mb-2">
								<p class="">Saldo pendiente</p>
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400"
									id="grid-last-name" type="text" placeholder="Buscar cliente"
									:value="saleData.customer?.saldo" disabled>
							</div>
							<div v-if="saleData.customer?._drt_custom_tipo_cliente == 1" class="mb-2">
								<p class="">Días de retraso</p>
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400"
									id="grid-last-name" type="text" placeholder="Buscar cliente"
									:value="saleData.customer?.dias_retraso" disabled>
							</div>
							<div v-if="saleData.customer?._drt_custom_tipo_cliente == 1" class="mb-2">
								<p class="">Saldo vencido</p>
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-4 mr-3 disabled:bg-gray-400 disabled:border-gray-400"
									id="grid-last-name" type="text" placeholder="Buscar cliente"
									:value="saleData.customer?.saldo_vencido" disabled>
							</div>
							<input
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 disabled:bg-gray-400 disabled:border-gray-400"
								id="grid-last-name" type="text" placeholder="Dirección de envio"
								value="Dirección de envio" disabled>
							<select v-model="facturacion_direction"
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
								<option value="0" selected>Dirección de facturación</option>
								<option :value="direction.internalid" v-for="direction in objClientAddress[0]?.directions" :key="direction">{{ direction.state?.name }}, {{ direction.country?.name }}, {{ direction.ciudad }}, {{ direction.calle }}, {{ direction.colonia }} {{ direction.codigopostal }}</option>
							</select>
							<p class="mt-2">Forma pago SAT</p>
							<select
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								v-model="payments_sale.sat_payment_method_master_id">
								<option value="0" selected>Seleccione uno...</option>
								<option :value="paymentterm.nsid" v-for="paymentterm in payments_terms.data" :key="paymentterm">{{ paymentterm.name }}</option>
							</select>
							<p class="mt-2">Metodo pago SAT</p>
							<select
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								v-model="payments_sale.sat_payment_term_master_id">
								<option value="0" selected>Seleccione uno...</option>
								<option :value="formpayment.nsid" v-for="formpayment in payments_forms.data" :key="formpayment">{{ formpayment.name }}</option>
							</select>
							<p class="mt-2">Uso CFDI</p>
							<select
								class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
								v-model="payments_sale.sat_cfdi_master_id">
								<option :value="cfdi.nsid" v-for="cfdi in cfdi_list" :key="cfdi">{{ cfdi.name }}</option>
							</select>
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Metodo de pago
							</label><!-- methodsPayments -->
							<button
								class="bg-[#fab33c] text-[#000] mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-sm mb-3"
								@click="handleShowMethodPayment()">
								Agregar</button>
							<div class="mb-5 flex flex-wrap" v-for="(methodPayment, index) in methodsPayments"
								:key="index">
								<div class="flex flex-wrap" v-if="methodPayment.method == 1">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span
										class="flex flex-wrap bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-credit-card-fill w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path
												d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1" />
										</svg>Tarjeta Credito</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
								<div class="flex flex-wrap" v-if="methodPayment.method == 2">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span
										class="flex flex-wrap bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-credit-card-fill w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path
												d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1" />
										</svg>Tarjeta debito</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
								<div class="flex flex-wrap" v-if="methodPayment.method == 3">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span class="flex flex-wrap bg-green-100 text-green-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded e">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-cash-coin w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path fill-rule="evenodd"
												d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0" />
											<path
												d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z" />
											<path
												d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z" />
											<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567" />
										</svg>Efectivo</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
								<div class="flex flex-wrap" v-if="methodPayment.method == 4">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span
										class="flex flex-wrap bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-credit-card-fill w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path
												d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1" />
										</svg>Saldo a favor del cliente</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
								<div class="flex flex-wrap" v-if="methodPayment.method == 5">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span
										class="flex flex-wrap bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-credit-card-fill w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path
												d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1" />
										</svg>Credito del cliente</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
								<div class="flex flex-wrap" v-if="methodPayment.method == 6">
									<span class="flex flex-wrap bg-red-100 text-red-900 text-xl font-medium text-center p-1 rounded mr-2 hover:cursor-pointer" @click="handleCancelmethodPayment(index)">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle w-6 h-6" viewBox="0 0 16 16">
											<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
											<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
										</svg>
									</span>
									<span
										class="flex flex-wrap bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
											fill="currentColor" class="bi bi-credit-card-fill w-6 h-6 mr-2"
											viewBox="0 0 16 16">
											<path
												d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1" />
										</svg>Transferencia</span>
									<p class="text-xl">${{ Number(methodPayment.amount).toFixed(2) }}</p>
								</div>
							</div>
							<hr class="w-full h-1 bg-gray-200 border-0 rounded">
							<p class="text-lg font-medium mt-2">Cambio <br> ${{ (formMethodPayment.change).toFixed(2) }}</p>
							<p class="text-2xl font-bold mt-2">Pagado <br> ${{ (formMethodPayment.totalPaid).toFixed(2) }}</p>
						</div>
					</div>
					<div class="flex flex-wrap p-3 rounded-lg mb-2 shadow-sl">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-2xl font-bold mb-2 text-[#26245C]"
								for="grid-last-name">
								Resumen
							</label>
							<p class="text-lg text-[#26245C] font-thin">Cantidad de Artículos</p>
							<p class="text-md font-semibold mb-2">{{ saleData.total_quantity_items }}</p>
							<p class="text-lg text-[#26245C] font-thin">Subtotal</p>
							<p class="text-md font-semibold mb-2">${{ saleData.sub_total_with_discount }}</p>
							<p class="text-lg text-[#26245C] font-thin">Impuestos</p>
							<p class="text-md font-semibold mb-2">${{ saleData.tax }}</p>
							<p class="text-lg text-[#26245C] font-thin">Descuentos Linea</p>
							<p class="text-md font-semibold mb-2">${{ saleData.discount_line }}</p>
							<p class="text-lg text-[#26245C] font-thin">Descuentos Globales</p>
							<p class="text-md font-semibold mb-2">${{ saleData.discount_global }}</p>
							<p class="text-lg text-[#26245C] font-thin">Descuentos Articulos</p>
							<p class="text-md font-semibold mb-2">${{ saleData.discount_art_uni }}</p>
							<hr class="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4">
							<p class="text-2xl text-[#26245C] font-bold">Total</p>
							<p class="text-md font-semibold">${{ saleData.total }}</p>
						</div>
					</div>
					<div class="flex flex-row">
						<!-- <button
							class="bg-[#26245C] text-[#fff] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5"
							@click="handleTestJson()">
							Pruebas json</button> -->
						<button
							class="bg-[#26245C] text-[#fff] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5"
							@click="handleCancelCharge()">
							Cancelar</button>
						<button
							class="bg-[#fab33c] text-[#000] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5"
							@click="handleShowTicket()">
							Cobrar</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Ticket cobro -->
		<div class="bg-white w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10"
			v-show="showTicket && !loadingTransactions">
			<button class="bg-[#26245C] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
				@click="closeTicket()">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</button>

			<div class="flex flex-col items-center mt-8" id="ticketsale">
				<div class="w-full md:w-1/3 lg:w-1/3 bg-white shadowCard p-2 items-center text-center">
					<p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
					<p class="text-lg font-bold mt-5">Ticket de venta <br> {{ saleData.externalid }}</p>
					<p class="text-sm mt-5">Fecha y Hora: <strong class="front-bold">{{ moment(saleData.trandate).utc().format('DD/MMM/YYYY HH:mm:ss') }}</strong></p>
					<p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
					<p class="text-sm">Lo atendió el vendedor: <strong class="font-bold">{{ saleData.seller?.firstname ? saleData.seller?.firstname : "" + " " + saleData.seller?.lastname ? saleData.seller?.lastname : "" }}</strong></p>
					<p class="text-sm">Lo atendió el cajero: <strong class="font-bold">{{ saleData.cashier?.firstname ? saleData.cashier?.firstname : "" + " " + saleData.cashier?.lastname ? saleData.cashier?.lastname : "" }}</strong></p>
					<p class="text-sm">Correo Electronico: <strong class="font-bold">{{ saleData.cashier?.email }}</strong></p>
					<p class="text-sm">Cliente: <strong class="font-bold">{{ saleData.customer?.companyname ? saleData.customer?.companyname : saleData.customer?.firstname + " " + saleData.customer?.lastname }}</strong></p>
					<p class="text-sm">Tipo de cliente: <strong class="font-bold">{{ saleData.customer?._drt_custom_tipo_cliente == 1 ? 'Contado' : saleData.customer?._drt_custom_tipo_cliente == 2 ? 'Credito' : 'Desconocido' }}</strong></p>
					<hr class="hrDotted mt-5 mb-2">
					<p class="text-md font-bold mt-5 mb-5">Articulos</p>
					<!-- <div class="" v-for="item in saleData.SaleArticles" :key="item">
						<p class="text-sm text-"><strong>{{ item.id_item }}</strong> <br> {{ item.quiantity }} x ${{ item.units }} = ${{ item.lineTotal }} <strong>IVA Incl</strong></p>
						<hr class="hrLine">
					</div> -->
					<div class="grid grid-cols-6">
						<p class="text-[10.5px] text-center"><strong>Artículo</strong></p>
						<p class="text-[10.5px] text-center"><strong>Unidad</strong></p>
						<p class="text-[10.5px] text-center"><strong>Cantidad</strong></p>
						<p class="text-[10.5px] text-center"><strong>Entrega</strong></p>
						<p class="text-[10.5px] text-center"><strong>Precio Unitario</strong></p>
						<p class="text-[10.5px] text-center"><strong>SubTotal</strong></p>
					</div>
					<div class="" v-for="item in saleData.SaleArticles" :key="item">
    					<div class="grid grid-cols-6 mb-2">
        					<p class="text-[9.5px] text-center">{{ item.id_item }} <br> {{ item.article?.displayname }} <br> {{ item.article?.salesdescription }}</p>
        					<p class="text-[9.5px] text-center">{{ item.shop_units?.nsname }}</p>
        					<p class="text-[9.5px] text-center">{{ item.quiantity }}</p>
							<p class="text-[9.5px] text-center"><strong>{{ item.delivery_type == 1 ? 'Tienda' : item.delivery_type == 2 ? 'Domicilio' : item.delivery_type == 3 ? 'Recoge' : 'Desconocido' }}</strong></p>
        					<p class="text-[9.5px] text-center">${{ Number(item.rate).toFixed(2) }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.lineTotal).toFixed(2) }}</p>
    					</div>
						<div v-if="item.article?.custitem_tipo_articulo === 'Kit'">
							<div class="grid grid-cols-5 mb-2" v-for="component in item.article.components" :key="component">
								<p class="text-[9.5px] text-center">{{ component.article.itemid }} <br> {{ component.article.displayname }}</p>
								<p class="text-[9.5px] text-center">{{ component.unit.nsname }}</p>
								<p class="text-[9.5px] text-center">{{ component.quantity }}</p>
								<p class="text-[9.5px] text-center">---</p>
								<p class="text-[9.5px] text-center">Componente <br> {{ item.id_item }}</p>
							</div>
						</div>
					</div>
					<p class="text-md font-bold mt-5 mb-2">Metodos de pago</p>
					<div class="" v-for="payment in methodsPayments" :key="payment">
						<p class="text-sm text-" v-if="payment.method == 1"><strong>Tarjeta credito: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 2"><strong>Tarjeta debito: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 3"><strong>Efectivo: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
						<!-- <p class="text-sm text-" v-if="payment.method == 3"><strong>Efectivo - </strong> ${{ (payment.amount).toFixed(2) }}</p> -->
						<p class="text-sm text-" v-if="payment.method == 4"><strong>Saldo a favor del cliente: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 5"><strong>Crédito del cliente: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 6"><strong>Transferencia: </strong> ${{ Number(payment.amount).toFixed(2) }}</p>
					</div>
					<hr class="hrDotted mt-5">
					<p class="text-sm mt-5"><strong>Total:</strong> ${{ Number(saleData.totalSale).toFixed(2) }}</p>
					<p class="text-sm"><strong>Cambio:</strong> ${{ Number(formMethodPayment.change).toFixed(2) }}</p>
					<p class="text-xs"><strong>IVA Incluido</strong></p>
					<p class="text-xs"><strong>Pagado</strong></p>
					<p class="text-xs mt-5">Atencion al cliente y ventas por telefono en: <br> Gracias por su compra <br> Para cualquier cambio o Devolucion <br> Presentar ticket o Factura de compra <br> Hasta 30 dias posteriores de su compra <br>
						 Cuentanos como te atendimos en <br> Redes Sociales: <br> Pagina de internet: <br>Fecha y hora de la compra: {{ moment(saleData.trandate).utc().format('DD/MMM/YYYY HH:mm:ss') }} <br>
						 # de Ticket: {{ saleData.externalid }}</p>
				</div>
			</div>
			<button class="bg-[#fab33c] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
				@click="handlePrintTicket()">
				Imprimir
			</button>
		</div>

		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loadingTransactions">
			<Loader msg="Cargando información"/>
		</div>
	</div>

	<!-- modal methods paymets -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalMethodPayment">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity"></div>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white pb-4 pt-5">
						<div class="w-full p-5">
							<div class="mt-3 text-center">
								<h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Métodos de
									pago
								</h3>

								<div class="flex flex-wrap w-full mb-6 mt-5">
									<div class="w-full mb-6 md:mb-0">
										<label
											class="block uppercase w-full tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Seleccione el tipo de pago
										</label>
										<select
											class="appearance-none block w-full h-10 bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mr-3"
											v-model="formMethodPayment.method">
											<option value="1">Tarjeta credito</option>
											<option value="2">Tarjeta debito</option>
											<option value="3">Efectivo</option>
											<option value="4">Saldo a favor del Cliente</option>
											<option value="5" v-if="saleData.customer._drt_custom_tipo_cliente == 1">Crédito del cliente</option>
											<option value="6">Transferencia</option>
										</select>
									</div>
									<div class="flex flex-wrap w-full mb-6 mt-5">
									<div class="w-full mb-6 md:mb-0">
										<label
											class="block uppercase w-full tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Ingrese el monto del pago
										</label>

										<div class="relative mb-6">
											<div
												class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
													fill="currentColor"
													class="bi bi-currency-dollar w-4 h-4 text-gray-500"
													viewBox="0 0 16 16">
													<path
														d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z" />
												</svg>
											</div>
											<input type="number" id="input-group-1"
												class="block w-full ps-10 p-2.5 bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
												placeholder="" v-model="formMethodPayment.amount">
										</div>
									</div>
								</div>

									<div class="relative transform overflow-hidden bg-white text-left transition-all sm:w-full sm:max-w-lg" v-if="formMethodPayment.method == 5 && formMethodPayment.amount > saleData.customer.saldo_disponible">
										<div class="bg-white">
											<!-- Modal header -->
											<div class="flex items-center justify-between">
												<h3 class="text-md text-center font-semibold text-white bg-[#26245C] p-2">
													El cliente no cuenta con suficiente credito, solicite una extención para realizar la venta
												</h3>
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
																	placeholder="Michael Odonell" v-model="formSupervisor.user" />

																<p>Contraseña del supervisor</p>	
																<input type="password" id="simple-search"
																	class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
																	v-model="formSupervisor.password" />
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-[#26245C] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#2b2961] sm:mt-0 sm:w-auto"
							@click="handleAddMethodPayment()">Agregar</button>
						<button type="button"
							class="mt-3 mr-2 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleShowMethodPayment()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal open cja -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalOpenCashier">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleModalOpenCashier()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
							<h3 class="text-xl font-semibold text-gray-900">
								Apertura de caja
							</h3>
							<button @click="handleModalOpenCashier()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3 text-center">
								<div class="flex flex-col w-full mb-6 mt-5">
									<div class="flex flex-col w-full items-center" v-if="!verified_cash">
										<label for="simple-search">Apertura</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="amount_cash_open" type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div>
										<!--<label for="simple-search">Monto fuera del rango</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="rango_fuera" type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div>
										<label for="simple-search">Monto dentro del rango</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="rango_dentro" type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div>-->
										<div class="relative w-full">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-currency-dollar" viewBox="0 0 16 16">
													<path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z"/>
												</svg>
											</div>
											<select disabled class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
												<option value="mxn">Pesos mexicanos(MXN)</option>
											</select>
										</div>
									</div>
									<div class="flex flex-col w-full items-center" v-else>
										<label for="simple-search">Apertura</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="cashier_open_info.mount_open" disabled type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div>
										<!-- <label for="simple-search">Monto fuera del rango</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="rango_fuera" disabled type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div>
										<label for="simple-search">Monto dentro del rango</label>
										<div class="relative w-full mb-2">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
												<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
												<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
												<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
												<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
												</svg>
											</div>
											<input v-model="rango_dentro" disabled type="number" id="simple-search"
												class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
												placeholder="Monto base" />
										</div> -->
										<div class="relative w-full">
											<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-currency-dollar" viewBox="0 0 16 16">
													<path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z"/>
												</svg>
											</div>
											<select disabled class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
												<option value="mxn">Pesos mexicanos(MXN)</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-[#fab33c] px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#fab43cc5] sm:mt-0 sm:w-auto"
							@click="openCash()">Abrir caja</button>
						<button type="button"
							class="mt-3 mr-2 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleModalOpenCashier()">Cancelar</button>
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
								Componentes <strong>{{ infoArticleKit.article.displayname }}</strong>
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
													<th scope="col" class="px-5 py-4">Deescripción</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b dark:border-neutral-500 text-center bg-[#e8e8e8]"
													v-for="item in infoArticleKit.article.components" :key="item">
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
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.shadow-sl {
	box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
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