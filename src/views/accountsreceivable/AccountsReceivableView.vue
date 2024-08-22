<script setup>
import { onMounted, ref, inject } from 'vue';
import { useCustomersStore } from '../../stores/customer';
import { useInvoicesStore } from '../../stores/invoices';
import { useSaleStore } from '../../stores/sale';
import { useLocationsStore } from '../../stores/locations';
import posLogo from '../../assets/pos_logo.png';
import moment from 'moment';
import { useMenuStore } from '../../stores/menu';

//components
import Loader from '../../components/Loader.vue';

const toast = inject('toast')
const customerStore = useCustomersStore();
const locationsStore = useLocationsStore();
const invoicesStore = useInvoicesStore();
const saleStore = useSaleStore()

const menuStore = useMenuStore();
const customerNameSrc = ref("")
const showTicket = ref(false)
const modalMethodPayment = ref(false)
const methodsPayments = ref([])
const formMethodPayment = ref({
	method: "",
	amount: 0,
	totalPaid: 0,
	change: 0
})
const inpSearchClient = ref("")
const objSearchClient = ref([])
const loader_search_client = ref(false)
const modalSearchClient = ref(false)
const objSelectClient = ref({})
const objInvoiceDue = ref([])
const objResumeDue = ref({
	saldo_favor:0,
	total_adeudado_pagar:0,
	total_remanente_pendiente:0,
	total_due:0
})
const objDueAccounts = ref({
	trandate: new Date(),
})

onMounted(() => {
	
})

const filterClient = async() => {
	try {
		loader_search_client.value = true
		const bodySearch = {
			"name" : inpSearchClient.value.toLowerCase(),
			"withEstimates": true
		}
		const objSearch = await customerStore.getCustomerWithObj(bodySearch)
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

const resetFilterClient = () => {
	objSearchClient.value = []
	inpSearchClient.value = ""
}

const handleSelectClient = async (client) => {
	if(client._drt_custom_tipo_cliente == 2 || client._drt_custom_tipo_cliente == null){
		toast.open({
			message: `No puede seleccionar este cliente, no es de tipo credito`,
			type: 'warning'
		})
		return false
	}
	objSelectClient.value = client;
	console.log("client", client)
	await searchInvoiceDue(client.internalid)
	console.log("objInvoiceDue", objInvoiceDue.value)
	modalSearchClient.value = !modalSearchClient.value
}

const handleShowMethodPayment = () => {
	if(methodsPayments.value.length > 0){
		toast.open({
			message: `No puede puede egregar mas de un metodo de pago`,
			type: 'warning'
		})
		return false
	}

	modalMethodPayment.value = !modalMethodPayment.value
	formMethodPayment.value = {
		method: "",
		amount: 0,
		totalPaid: 0,
		change: 0
	}
}

const handleSearchClient = () => {
	modalSearchClient.value = !modalSearchClient.value
}

const searchInvoiceDue = async(customerId) => {
	try {
		const response = await invoicesStore.getInvoiceDueCustomer(customerId)
		if(response.code == 200){
			if(response.data.length > 0){
				objInvoiceDue.value = response.data
				objInvoiceDue.value.forEach(element => {
					const pendientePago = Number(element.total_credito) - Number(element.credito_pagado)
					element.pendiente_pago = Number(pendientePago).toFixed(2)
					element.monto_pagar = 0
					element.remanente_pendiente = Number(pendientePago).toFixed(2)
					element.total_credito = Number(element.total_credito).toFixed(2) 
				});
			}else{
				toast.open({
					message: `El cliente no tiene facturas pendientes por pagar`,
					type: 'warning'
				})
			}
		}else{
			toast.open({
				message: `Ocurrio un error al obtener las facturas del cliente.`,
				type: 'warning'
			})
			console.error("msg", response.msg)
		}
	} catch (error) {
		toast.open({
			message: `Ocurrio un error, si el problema persiste favor de notificarselo al supervisor`,
			type: 'error'
		})
		console.error("Error al obtener las facturas por pagar del cliente", error)
	}
}

const recalculate = () => {
	let total = 0
	let change_cash = 0
	methodsPayments.value.forEach(payment => {
		const amount = Number(payment.amount)
		total += amount
	});

	if(total > objResumeDue.value.total_adeudado_pagar){
		change_cash = total - objResumeDue.value.total_adeudado_pagar
	}else{
		change_cash = 0
	}

	formMethodPayment.value.change = change_cash
	formMethodPayment.value.totalPaid = total
}

const handleAddMethodPayment = async() => {
	console.log("methodsPayments", methodsPayments.value)

	if(formMethodPayment.value.method != 3){
		if(formMethodPayment.value.amount > objResumeDue.value.total_adeudado_pagar){
			toast.open({
				message: `El monto de pago debe ser igual al monto a pagar.`,
				type: 'warning'
			})
			return false
		}else if(formMethodPayment.value.amount < objResumeDue.value.total_adeudado_pagar){
			toast.open({
				message: `El monto de pago debe ser igual al monto a pagar.`,
				type: 'warning'
			})
			return false
		}else if(formMethodPayment.value.amount == objResumeDue.value.total_adeudado_pagar){
			methodsPayments.value.push(formMethodPayment.value)
			formMethodPayment.value = {
				method: "",
				amount: 0,
				totalPaid: 0,
				change: 0
			}
			recalculate()

			modalMethodPayment.value = !modalMethodPayment.value
			console.log("paymentmethods", formMethodPayment.value)
		}
	}else{
		methodsPayments.value.push(formMethodPayment.value)
		formMethodPayment.value = {
			method: "",
			amount: 0,
			totalPaid: 0,
			change: 0
		}
		recalculate()

		modalMethodPayment.value = !modalMethodPayment.value
		console.log("paymentmethods", formMethodPayment.value)
	}
}

const handleCalculateLine = (index) => {
	const monto_a_pagar = Number(objInvoiceDue.value[index].monto_pagar)
	const pendiente_de_pago = Number(objInvoiceDue.value[index].pendiente_pago)
	const remanente = (pendiente_de_pago - monto_a_pagar).toFixed(2)

	if(monto_a_pagar > pendiente_de_pago){
		toast.open({
			message: `El monto de pago no puede ser mayor al monto pendiente por pagar.`,
			type: 'warning'
		})
		objInvoiceDue.value[index].monto_pagar = 0
		return false
	}

	if(monto_a_pagar < 0){
		toast.open({
			message: `El monto de pago no puede ser un valor negativo`,
			type: 'warning'
		})
		objInvoiceDue.value[index].monto_pagar = 0
		return false
	}

	objInvoiceDue.value[index].remanente_pendiente = remanente
	recalculateDue()
}

const recalculateDue = () => {
	let total_adeudado = 0
	let total_remanente = 0
	let total_pagar = 0
	objInvoiceDue.value.forEach(due => {
		total_adeudado += Number(due.monto_pagar)
		total_remanente += Number(due.remanente_pendiente)
		total_pagar += Number(due.monto_a_pagar)
	});

	objResumeDue.value = {
		saldo_favor:0,
		total_adeudado_pagar: total_adeudado,
		total_remanente_pendiente: total_remanente,
		total_due: total_pagar
	}
}

const handleCancelCharge = () => {
	saleData.value = []
	showCharge.value = !showCharge.value;
}

const handleCancelmethodPayment = (index) => {
	methodsPayments.value.splice(index, 1)
	recalculate()
}

const handleShowTicket = () => {
	let total = 0
	methodsPayments.value.forEach(payment => {
		const amount = Number(payment.amount)
		total += amount
	});

	const user_info = JSON.parse(localStorage.USER_INFO)

	objDueAccounts.value.id_cashier = saleStore.cashierInfo
	objDueAccounts.value.cashier_name = saleStore.cashierName
	objDueAccounts.value.customer_id = objSelectClient.value.internalid
	objDueAccounts.value.location_id = user_info.location_id
	objDueAccounts.value.obj_invoices_due = objInvoiceDue.value
	objDueAccounts.value.metodos_pago = methodsPayments.value
	objDueAccounts.value.resume = objResumeDue.value
	console.log("objDueAccounts.value", objDueAccounts.value)


	if (objDueAccounts.value.id_cashier == 0) {
		toast.open({
			message: `No esta definido el cajero, por favor seleccione uno...`,
			type: 'warning'
		})
		return false;
	}else{
		showTicket.value = !showTicket.value
	}
}

const handlePrintTicket = async () => {
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

	try {
		const obj_payments_due = []

		objDueAccounts.value.obj_invoices_due.forEach(due => {
			obj_payments_due.push({
				invoiceId: due.internalid,
				amount: due.monto_pagar
			})
		});

		const obj_peticion = {
			customerId: objDueAccounts.value.customer_id,
			location_id: objDueAccounts.value.location_id,
			metodo_pago_id: objDueAccounts.value.metodos_pago[0].method,
			payments: obj_payments_due
		}

		const respPayments = await invoicesStore.createCreditPayments(obj_peticion)
		console.log("resppayments", respPayments)

		if (respPayments.status == "error") {
			toast.open({
				message: `${respPayments.msg}`,
				type: 'error'
			})
			showTicket.value = false
		}else if(respPayments.status == "success"){
			toast.open({
				message: `Pago realizado correctamente`,
				type: 'success'
			})

			methodsPayments.value = []
			inpSearchClient.value = ""
			objSearchClient.value = []
			objSelectClient.value = {}
			objInvoiceDue.value = []
			objResumeDue.value = {
				saldo_favor:0,
				total_adeudado_pagar:0,
				total_remanente_pendiente:0,
				total_due:0
			}

			showTicket.value = false
		}
	} catch (error) {
		toast.open({
			message: `Error al crear el pago, ${error}`,
			type: 'error'
		})
	}
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10 rounded-3xl" v-show="!showTicket">
			<div class="lg:grid lg:grid-cols-4">
				<div class="w-full px-2 bg-white rounded-lg lg:col-span-3">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white rounded-t-lg bg-[#26245C] w-1/3"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2 w-full">
							<p class="inline-block p-4 text-center text-lg font-bold">Lista de transacciones pendientes por pagar</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<!-- <div class="bg-[#26245C] p-2 md:p-8 rounded-b-lg rounded-e-lg">
							<div class="w-full">
								<input
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="grid-last-name" type="text"
									placeholder="Ingrese el nombre o código del articulo">
							</div>
						</div> -->

						<!-- TABLA Busqueda de Artículos -->
						<div class="flex flex-col overflow-x-auto bg-white">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead
												class="border border-[#26245c73] font-medium text-center bg-[#D9D9D9] text-[#26245C]">
												<tr>
													<th scope="col" class="px-5 py-4">Transacción</th>
													<th scope="col" class="px-5 py-4">Fecha</th>
													<th scope="col" class="px-5 py-4">Total</th>
													<th scope="col" class="px-5 py-4">Pendiente de pago</th>
													<th scope="col" class="px-5 py-4">Monto a pagar</th>
													<th scope="col" class="px-5 py-4">Remanente</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border border-[#26245c73] dark:border-neutral-500 text-center"
													v-for="(invoiceDue, index) in objInvoiceDue" :key="invoiceDue">
													<td class="whitespace-nowrap px-2 py-4">{{ invoiceDue.origin_sale.externalid }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ moment(invoiceDue.trandate).format('MM/DD/YYYY hh:mm:ss') }}</td>
													<td class="whitespace-nowrap px-2 py-4">${{ Number(invoiceDue.total_credito).toFixed(2) }}</td>
													<td class="whitespace-nowrap px-2 py-4">${{ Number(invoiceDue.pendiente_pago).toFixed(2) }}</td>
													<td class="whitespace-nowrap px-2 py-4">
														<input v-on:input="handleCalculateLine(index)" v-model="invoiceDue.monto_pagar" @click.left="handleCalculateLine(index)" @click.right="handleCalculateLine(index)" @keydown.enter="handleCalculateLine(index)" @keydown.tab="handleCalculateLine(index)" type="number">
													</td>
													<!-- <td class="whitespace-nowrap px-2 py-4">X Disponible</td> -->
													<td class="whitespace-nowrap px-2 py-4">${{ Number(invoiceDue.remanente_pendiente).toFixed(2) }}</td>
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
							<p class="appearance-none block w-full p-2 text-center font-semibold text-lg bg-gray-50 text-gray-700 border border-gray-300 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 shadow-sl">{{ moment(objDueAccounts?.trandate).format('MM/DD/YYYY hh:mm') }}</p>
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full mt-2">
							<button @click="handleSearchClient()"
								class="bg-[#fab33c] w-full text-[#000] mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-sm mb-3">
								Buscar Cliente</button>
						</div>
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								información del cliente
							</label>
							<div class="flex flex-row">
								<p class="appearance-none block w-full p-2 bg-gray-200 text-gray-900 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400">{{ objSelectClient.companyname ? objSelectClient.companyname : objSelectClient.firstname + " " + objSelectClient.lastname }}</p>
								<p class="appearance-none block w-full p-2 bg-gray-200 text-gray-900 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 mr-3 disabled:bg-gray-400 disabled:border-gray-400">{{ objSelectClient._drt_custom_tipo_cliente == 1 ? 'Credito' : 'Contado' }}</p>
							</div>
						</div>
					</div>
					<div class="bg-[#26245C] text-white flex flex-wrap p-3 rounded-lg mb-2">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
								Metodo de pago
							</label><!-- methodsPayments -->
							<button @click="handleShowMethodPayment"
								class="bg-[#fab33c] text-[#000] mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-sm mb-3">
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
							<p class="text-lg font-medium mt-2">Cambio <br> ${{ Number(formMethodPayment.change).toFixed(2) }}</p>
							<p class="text-2xl font-bold mt-2">Pagado <br> ${{ Number(formMethodPayment.totalPaid).toFixed(2) }}</p>
						</div>
					</div>
					<div class="flex flex-wrap p-3 rounded-lg mb-2 shadow-sl">
						<div class="w-full">
							<label class="block uppercase tracking-wide text-2xl font-bold mb-2 text-[#26245C]"
								for="grid-last-name">
								Resumen
							</label>
							<!-- <p class="text-lg text-[#26245C] font-thin">Saldo a favor</p>
							<p class="text-md font-semibold mb-2">$500.00</p> -->
							<p class="text-lg text-[#26245C] font-thin">Total adeudado a pagar</p>
							<p class="text-md font-semibold mb-2">${{ Number(objResumeDue.total_adeudado_pagar).toFixed(2) }}</p>
							<p class="text-lg text-[#26245C] font-thin">Total remanente pendiente</p>
							<p class="text-md font-semibold mb-2">${{ Number(objResumeDue.total_remanente_pendiente).toFixed(2) }}</p>
							<hr class="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4">
							<p class="text-2xl text-[#26245C] font-bold">Total a pagar</p>
							<p class="monto-total">${{ Number(objResumeDue.total_adeudado_pagar).toFixed(2) }}</p><!-- total_due -->
						</div>
					</div>
					<div class="flex flex-row">
						<button @click="menuStore.handleMenu()"
							class="bg-[#26245C] text-[#fff] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5">
							Cancelar</button>
						<button @click="handleShowTicket()"
							class="bg-[#fab33c] text-[#000] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5">
							Cobrar</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal ticket -->
		<div class="bg-white w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10"
			v-show="showTicket">
			<button class="bg-[#26245C] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
				@click="handleShowTicket()">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</button>

			<div class="flex flex-col items-center mt-8" id="ticketsale">
				<div class="w-full md:w-1/2 lg:w-1/2 bg-white shadowCard p-4 items-center text-center">
					<p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
					<p class="text-lg font-bold mt-5">Ticket de cuentas por cobrar</p>
					<p class="text-sm mt-5">Fecha: <strong> {{ moment(objDueAccounts?.trandate).format('DD/MMM/YYYY HH:mm:ss') }}</strong></p>
					<p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
					<p class="text-sm">Lo atendió: <strong class="font-bold">{{ objDueAccounts?.cashier_name }}</strong></p>
					<p class="text-sm">Cliente: <strong class="font-bold">{{ objSelectClient.companyname ? objSelectClient.companyname : objSelectClient.firstname + " " + objSelectClient.lastname }}</strong></p>
					<hr class="hrDotted mt-5 mb-5">
					<!-- <p class="text-md font-bold mt-5">Articulos</p> -->
					<!-- <div class="" v-for="item in saleData.SaleArticles" :key="item">
						<p class="text-sm text-"><strong>{{ item.id_item }}</strong> <br> {{ item.quiantity }} x ${{ item.units }} = ${{ item.lineTotal }} <strong>IVA Incl</strong></p>
						<hr class="hrLine">
					</div> -->
					<div class="" v-for="transacction in objDueAccounts.obj_invoices_due" :key="transacction">
						<div class="grid grid-cols-1 gap-2">
							<p class="text-xs text-center"><strong>#Trans.</strong>: {{ transacction.origin_sale.externalid }}</p>
							<p class="text-sm"><strong>Saldo Anterior</strong>: ${{ transacction.pendiente_pago }}</p> <!-- Nueva columna transacction.total_credito -->
							<p class="text-sm"><strong>Importe Pagado</strong>: ${{ transacction.monto_pagar }}</p>
							<p class="text-sm"><strong>Importe Pendiente</strong>: ${{ transacction.remanente_pendiente }}</p>
						</div>
						<hr class="hrLine mt-2 mb-2">
					</div>
					<hr class="hrDotted mt-5">
					<p class="text-md font-bold mt-5">Metodos de pago</p>
					<div class="" v-for="payment in objDueAccounts.metodos_pago" :key="payment">
						<p class="text-sm text-" v-if="payment.method == 1"><strong>Tarjeta credito</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 2"><strong>Tarjeta debito</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 3"><strong>Efectivo</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 4"><strong>Saldo a favor del cliente</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 5"><strong>Crédito del cliente</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<p class="text-sm text-" v-if="payment.method == 6"><strong>Transferencia</strong> <br> ${{ (payment.amount).toFixed(2) }}</p>
						<hr class="hrLine">
					</div>
					<hr class="hrDotted mt-5">
					<!-- <p class="text-xl mt-5"><strong>Total pagado:</strong> ${{ (payment.amount).toFixed(2) }}</p> -->
					<p class="text-xl mt-5"><strong>Total pagado:</strong> ${{ objDueAccounts?.resume?.total_adeudado_pagar }}</p>
					<p class="text-sm"><strong>Saldo Pendiente:</strong> ${{ objDueAccounts?.resume?.total_remanente_pendiente }}</p>
					<p class="text-sm"><strong>Cambio:</strong> ${{ (formMethodPayment.change).toFixed(2) }}</p>
					<!-- <p class="text-xs"><strong>IVA Incluido</strong></p> -->
					<p class="text-lg mt-5"><strong>Pagado</strong></p>
					<p class="text-xs mt-5">Gracias por su compra <br> Agradecemos su Preferencia <br> Este no es un Comprobante Fiscal</p>
				</div>
			</div>
			<button class="bg-[#fab33c] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
				@click="handlePrintTicket()">
				Imprimir
			</button>
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
							<button @click="handleSearchClient()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
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
												:key="client">{{ client.internalid }} - {{ client.companyname ? client.companyname : client.firstname + ' ' + client.lastname }}
												<button @click="handleSelectClient(client)"
													class=" bg-[#fab33c] p-2 rounded-lg hover:bg-[#f8c56d]">Seleccionar</button>
											</li>
										</ul>
									</div>
								</div>
								<div class="flex flex-col w-full" v-else>
									<Loader msg="Cargando información"/>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleSearchClient()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal methods paymets -->
	<div class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalMethodPayment">
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

.monto-total {
    font-size: 2em; /* Tamaño del texto del monto total */
    font-weight: bold; /* Opcional: negrita */
}
</style>