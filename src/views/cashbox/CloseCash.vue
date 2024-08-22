<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useCashStore } from '../../stores/cash';
import { useLocationsStore } from '../../stores/locations';
import moment from 'moment';
import posLogo from '../../assets/pos_logo.png';
import JsBarcode from 'jsbarcode';

//components
import Loader from '../../components/Loader.vue';

//Variables
const locationsStore = useLocationsStore();
const menuStore = useMenuStore();
const cashStore = useCashStore();
const toast = inject('toast')
const loader = ref(false)
const loader_save = ref(false)
const obj_cashbox = ref({
	total_coins:0,
	total_tickets:0,
	total_vouchers:0,
	total_withdrawals:0,
	total_with_withdrawals:0,
	total:0,
	employeeInfo:{},
	dateClose:Date.now(),
	id:""
})
const obj_cashbox_line = ref([])
const withdrawals_obj = ref([])
const user_info = ref({})
const msg_close = ref({
	msg:"",
	status:""
})
const modalConfimationClose = ref(false)
const showTicket = ref(false)
const verified_cash = ref(false)
const close_type = ref("total")
const obj_close_back = ref({})
const obj_retiros_back = ref([])
const cashier_information = ref({})

//methods
onMounted(async () => {
	withdrawals_obj.value = JSON.parse(localStorage.withdrawals_info)
	user_info.value = JSON.parse(localStorage.USER_INFO)
	cashier_information.value = JSON.parse(localStorage.cashier_info)

	withdrawals_obj.value.forEach(withdrawal => {
		obj_cashbox.value.total_withdrawals +=Number(withdrawal.total)
	});

	let total_system = Number(cashier_information.value.mount_open) + Number(cashier_information.value.total_cash_sales) + Number(cashier_information.value.total_vouch_sales)

	const now = Date.now()
	const numrandom = Math.floor(Math.random() * (999999 - 100000) + 100000)
	let tran_type = "CC"
	obj_cashbox.value.id = tran_type + "-" + now + "" +  numrandom
	obj_cashbox.value.employeeInfo = user_info.value
	obj_cashbox.value.total_system = total_system
	obj_cashbox.value.variance = 0
	JsBarcode("#barcode", obj_cashbox.value.id, {
		width:1,
		fontSize:12
	});
})


const handleAddNewLineCashBox = () => {
	let end = false
	if(obj_cashbox_line.value.length > 0){
		obj_cashbox_line.value.forEach(element => {
			if(element.denomination <= 0){
				toast.open({
					message: `La denominación no puede ser en valor negativo.`,
					type: 'warning'
				})
				end = true
			}else if(element.cantidad <= 0){
				toast.open({
					message: `La cantidad de monedas o billetes no puede ser en valor negativo.`,
					type: 'warning'
				})
				end = true
			}
		});
	}
	if(end){
		return false
	}
	let new_line = {
		type:0,
		denomination:0,
		cantidad:1,
		total:0
	}
	obj_cashbox_line.value.push(new_line)
}

const handleChangeNumber = (index) => {
	try {
		console.log('index? ', index)
		handleCalculateLine(index)
	} catch (error) {
		console.error('ERROR on handleChangeNumber(): ', error)
	}
}

const handleCalculateLine = (index) => {
	const denomination = obj_cashbox_line.value[index].denomination
	const n_coins = obj_cashbox_line.value[index].cantidad

	if(denomination < 0){
		toast.open({
			message: `La denominación no puede ser en valor negativo.`,
			type: 'warning'
		})

		return false
	}
	if(n_coins < 0){
		toast.open({
			message: `La cantidad de monedas o billetes no puede ser en valor negativo.`,
			type: 'warning'
		})

		return false
	}

	const total = denomination * obj_cashbox_line.value[index].cantidad
	obj_cashbox_line.value[index].total = total
	recalculateCashBox()
}

const handleDeleteLine = (index) => {
	obj_cashbox_line.value.splice(index, 1)
	recalculateCashBox()
}

const recalculateCashBox = () => {
	obj_cashbox.value.total_coins = 0
	obj_cashbox.value.total_tickets = 0
	obj_cashbox.value.total_vouchers = 0
	obj_cashbox.value.total_with_withdrawals = 0
	obj_cashbox.value.total = 0

	obj_cashbox_line.value.forEach(cash => {
		console.log("cash.type", cash.type)
		switch (Number(cash.type)) {
			case 1://Billetes
				console.log("billetes", cash.total)
				obj_cashbox.value.total_tickets += cash.total
			break;
			case 2://Monedas
				obj_cashbox.value.total_coins += cash.total
			break;
			case 3://Tickets
				obj_cashbox.value.total_vouchers += cash.total
			break;
		}
	});

	obj_cashbox.value.total_with_withdrawals = obj_cashbox.value.total_tickets + obj_cashbox.value.total_coins + obj_cashbox.value.total_vouchers + obj_cashbox.value.total_withdrawals
	obj_cashbox.value.total = obj_cashbox.value.total_tickets + obj_cashbox.value.total_coins + obj_cashbox.value.total_vouchers

	obj_cashbox.value.variance = obj_cashbox.value.total - obj_cashbox.value.total_system
}

const close_cashier = (type) => {
	console.log("obj_cashbox", obj_cashbox.value)
	console.log("type", type)
	const user_info = JSON.parse(localStorage.USER_INFO);
	const cashier_info_ls = JSON.parse(localStorage.cashier_info);
	const withdrawals_info_ls = JSON.parse(localStorage.withdrawals_info);
	const tipo = type == 'parcial' ? 1 : 2
	obj_retiros_back.value = []
	const now = Date.now()

	withdrawals_info_ls.forEach(retiro => {
		// console.log('obj_retiros_back????', obj_retiros_back.value)
		obj_retiros_back.value.push({
			date_cash_down:new Date(retiro.dateWithdrawal),
			id_employee: retiro.employeeInfo.internalid,
			amount: retiro.total,
			reason: retiro.reason
		})
	});

	obj_close_back.value = {
		internalid: "12345",
		id_employee: user_info.internalid,
		date_cash: moment(now).format('DD-MM-YYYY hh:mm:ss'),
		total: obj_cashbox.value.total,
		type_cut: tipo,
		manager: 8,
		mount_open: cashier_info_ls.mount_open,
		total_cash_report: obj_cashbox.value.total_tickets + obj_cashbox.value.total_coins,
		total_vouch_report: obj_cashbox.value.total_vouchers,
		total_cash_down_report: obj_cashbox.value.total_withdrawals,
		match: true,
		total_cash: cashier_info_ls.total_cash_sales,
		total_vouch: cashier_info_ls.total_vouch_sales,
		total_cash_down: obj_cashbox.value.total_withdrawals,
		total_in_coins: obj_cashbox.value.total_coins,
    	total_in_bills: obj_cashbox.value.total_tickets,
		total_variances: obj_cashbox.value.variance,
		retiros:obj_retiros_back.value
	}
	console.log("obj_close_back", obj_close_back.value)

	if(!verifyCashier()){
		toast.open({
			message: `No se ha realizado la apertura de caja, por favor aperturelo para continuar`,
			type: 'warning'
		})
		return false
	}
	if(obj_cashbox_line.value.length === 0){
		toast.open({
			message: `No se puede realizar el corte de caja, realice el conteo de efectivo y vouchers...`,
			type: 'warning'
		})
		return false
	}
	const cashier_info = JSON.parse(localStorage.cashier_info)
	console.log('cashier_info? ', cashier_info)

	const total_cashier = cashier_info.mount_open + cashier_info.total_cash_sales + cashier_info.total_vouch_sales
	console.log('total_cashier? ', total_cashier)

	const total_close_cashier = obj_cashbox.value.total
	console.log('total_close_cashier? ', total_close_cashier)

	// * variables para los calculos
	const minimo_total_cashier = (Number(total_cashier) - Number(cashier_info.monto_fuera_rango))
	console.log('minimo_total_cashier? ', minimo_total_cashier)
	
	const maximo_total_cashier = (Number(total_cashier) + Number(cashier_info.monto_dentro_rango))
	console.log('maximo_total_cashier? ', maximo_total_cashier)


	if(total_close_cashier == total_cashier){
		msg_close.value.status = 1
		msg_close.value.msg = "Correcto"
	}else if(total_close_cashier > maximo_total_cashier || total_close_cashier < minimo_total_cashier){
		msg_close.value.status = 2
		msg_close.value.msg = "Fuera del rango"
	}else if(total_close_cashier < maximo_total_cashier || total_close_cashier > minimo_total_cashier){
		msg_close.value.status = 3
		msg_close.value.msg = "Dentro del rango"
	}

	handleModalConfimationClose()
}

const confirmCloseCashier = async() => {
	try {
		loader_save.value = true
		const response = await cashStore.closeCashier(obj_close_back.value)
		console.log("response", response)
		if(response.status == 200){
			if(response.data.code == 200){
				toast.open({
					message: `Corte de caja realizado correctamente`,
					type: 'success'
				})
				cashStore.resetCashierLocalStorage()
				handleModalConfimationClose()
				handleShowTicket()
				loader_save.value = false
			}else{
				toast.open({
					message: `Hubo un error al guardar el corte de caja. Error: ${response.data.msg}`,
					type: 'error'
				})
			}
		}else{
			toast.open({
				message: `Hubo un error al guardar el corte de caja. Error: ${response.data.msg}`,
				type: 'error'
			})
		}
		loader_save.value = false
	} catch (error) {
		loader_save.value = false
		toast.open({
			message: `Hubo un error al guardar el corte de caja. Error: ${error}`,
			type: 'error'
		})
	}
}

const handleModalConfimationClose = () => {
	modalConfimationClose.value = !modalConfimationClose.value
}

const handleShowTicket = () => {
	showTicket.value = !showTicket.value
}

const verifyCashier = () => {
	const cashier_open_info = JSON.parse(localStorage.cashier_info)
	if(cashier_open_info != null){
		if(cashier_open_info.mount_open > 0){
		verified_cash.value = true
		}else{
			verified_cash.value = false
		}
	}else{
		verified_cash.value = false
	}
	return verified_cash.value
}

const deleteLine = (index) => {
	obj_cashbox_line.value.splice(index, 1)
	recalculateCashBox()
}

const handlePrintTicket = () => {
	const prtHtml = document.getElementById('ticketsale').innerHTML;
	const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
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
		</html>`)

	WinPrint.document.close()
	WinPrint.focus()
	WinPrint.print()

	try {
		const cashier_info = JSON.parse(localStorage.cashier_info)
		const total_cashier = cashier_info.mount_open + cashier_info.total_cash_sales + cashier_info.total_vouch_sales

		const obj_cash_close = {
			id_employee:user_info.value.internalid,
			date_cash:new Date(obj_cashbox.value.dateClose),
			total: obj_cashbox.value.total,
			type_cut: close_type.value,
			manager: user_info.value.internalid,
			mount_open: cashier_info.mount_open,
			total_cash_report: cashier_info.total_cash_sales,
			total_vouch_report: cashier_info.total_vouch_sales,
			total_cash_down_report: obj_cashbox.value.total_withdrawals,
			match: cashier_info == total_cashier,
			total_cash: obj_cashbox.value.total_coins + obj_cashbox.value.total_tickets,
			total_vouch: obj_cashbox.value.total_vouchers,
			total_cash_down: obj_cashbox.value.total_withdrawals,
			total_variances: 0,
		}

		console.log("obj_cash_close", obj_cash_close)

		cashStore.resetCashierLocalStorage()
		localStorage.setItem("withdrawals_info", JSON.stringify([]))

		obj_cashbox.value = {
			total_coins:0,
			total_tickets:0,
			total_vouchers:0,
			total_withdrawals:0,
			total_with_withdrawals:0,
			total:0,
			employeeInfo:{},
			dateClose:Date.now(),
			id:""
		}
		obj_cashbox_line.value = []
		withdrawals_obj.value = []

		toast.open({
			message: `Corte de caja realizada correctamente`,
			type: 'success'
		})

		showTicket.value = false
	} catch (error) {
		toast.open({
			message: `No se pudo realizar el corte de caja, ERROR:${error}`,
			type: 'error'
		})
	}
}
</script>

<template>
	<div class="flex bg-[#468aa2] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader">
			<Loader :msg="'Cargando información'"/>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-if="!loader && !showTicket">
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#000000] font-semibold text-center w-full md:w-auto">Cierre de caja</p>
			</div>
			<div class="grid grid-cols-4">
				<div class="col-span-3">
					<!-- TABLA EFECTIVO -->
					<div class="flex flex-col overflow-x-auto py-2 pe-5">
						<div class="sm:-mx-6 lg:-mx-8">
							<button @click="handleAddNewLineCashBox()" class="bg-[#468aa2] text-[#ffffff] font-semibold px-5 py-2 ml-9 rounded-xl shadow-inp mt-5">Agregar nueva linea</button>
							<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
								<div class="overflow-x-auto">
									<table class="min-w-full text-left text-sm font-light">
										<thead class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
											<tr>
												<th scope="col" class="px-5 py-4"></th>
												<th scope="col" class="px-5 py-4">Tipo a contar</th>
												<th scope="col" class="px-5 py-4">Denominación</th>
												<th scope="col" class="px-5 py-4">Cantidad</th>
												<th scope="col" class="px-5 py-4">Total</th>
											</tr>
										</thead>
										<tbody>
											<tr class="border-b dark:border-neutral-500 text-center" v-for="(cash, index) in obj_cashbox_line" :key="cash">
												<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
													<div class="flex flex-wrap justify-center">
														<!-- <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"> -->
														<svg @click="handleDeleteLine(index)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash w-6 h-6 hover:cursor-pointer" viewBox="0 0 16 16">
															<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
															<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
														</svg>
													</div>
												</td>
												<td class="whitespace-nowrap px-2 py-4">
													<div class="relative w-full">
														<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-coin" viewBox="0 0 16 16">
																<path fill-rule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0"/>
																<path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z"/>
																<path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z"/>
																<path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567"/>
															</svg>
														</div>
														<select @click.left="handleCalculateLine(index)" @click.right="handleCalculateLine(index)" @keydown.enter="handleCalculateLine(index)" @keydown.tab="handleCalculateLine(index)" v-model="cash.type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5">
															<option value="0">Seleccione</option>
															<option value="1">Billetes</option>
															<option value="2">Monedas</option>
															<option value="3">Vouchers</option>
														</select>
													</div>
												</td>
												<td class="whitespace-nowrap px-2 py-4">
													<div class="relative w-full">
														<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
																<path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
																<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
																<path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
															</svg>
														</div>
														<input v-on:input="handleCalculateLine(index)" @click.left="handleCalculateLine(index)" @click.right="handleCalculateLine(index)" @keydown.enter="handleCalculateLine(index)" @keydown.tab="handleCalculateLine(index)" v-model="cash.denomination" type="number" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="" />
													</div>
												</td>
												<td>
													<div class="relative w-full">
														<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-123" viewBox="0 0 16 16">
																<path d="M2.873 11.297V4.142H1.699L0 5.379v1.137l1.64-1.18h.06v5.961zm3.213-5.09v-.063c0-.618.44-1.169 1.196-1.169.676 0 1.174.44 1.174 1.106 0 .624-.42 1.101-.807 1.526L4.99 10.553v.744h4.78v-.99H6.643v-.069L8.41 8.252c.65-.724 1.237-1.332 1.237-2.27C9.646 4.849 8.723 4 7.308 4c-1.573 0-2.36 1.064-2.36 2.15v.057zm6.559 1.883h.786c.823 0 1.374.481 1.379 1.179.01.707-.55 1.216-1.421 1.21-.77-.005-1.326-.419-1.379-.953h-1.095c.042 1.053.938 1.918 2.464 1.918 1.478 0 2.642-.839 2.62-2.144-.02-1.143-.922-1.651-1.551-1.714v-.063c.535-.09 1.347-.66 1.326-1.678-.026-1.053-.933-1.855-2.359-1.845-1.5.005-2.317.88-2.348 1.898h1.116c.032-.498.498-.944 1.206-.944.703 0 1.206.435 1.206 1.07.005.64-.504 1.106-1.2 1.106h-.75z"/>
															</svg>
														</div>
														<input v-on:input="handleChangeNumber(index)" @click.left="handleCalculateLine(index)" @click.right="handleCalculateLine(index)" @keydown.enter="handleCalculateLine(index)" @keydown.tab="handleCalculateLine(index)" v-model="cash.cantidad" type="number" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="" />
														<!-- <input @click.left="handleCalculateLine(index)" @click.right="handleCalculateLine(index)" @keydown.enter="handleCalculateLine(index)" @keydown.tab="handleCalculateLine(index)" v-model="cash.cantidad" type="number" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="" /> -->
													</div>
												</td>
												<td class="whitespace-nowrap px-2 py-4">${{ Number(cash.total).toFixed(2) }}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
					<!-- TABLA RETIROS -->
					<div class="flex flex-col overflow-x-auto py-2 pe-5">
						<p class="bg-[#468aa2] text-white p-2 text-md font-semibold">Retiros realizados</p>
						<div class="sm:-mx-6 lg:-mx-8">
							<div class="inline-block min-w-full sm:px-6 lg:px-8">
								<div class="overflow-x-auto">
									<table class="min-w-full text-left text-sm font-light">
										<thead class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
											<tr>
												<th scope="col" class="px-5 py-4">Folio</th>
												<th scope="col" class="px-5 py-4">Empleado</th>
												<th scope="col" class="px-5 py-4">Fecha y hora</th>
												<th scope="col" class="px-5 py-4">Monto</th>
												<th scope="col" class="px-5 py-4">Motivo</th>
											</tr>
										</thead>
										<tbody>
											<tr class="border-b dark:border-neutral-500 text-center" v-for="withdrawals in withdrawals_obj" :key="withdrawals">
												<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">{{ withdrawals.id }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{ withdrawals.employeeInfo?.firstname + ' ' + withdrawals.employeeInfo?.lastname }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{ moment(withdrawals?.dateWithdrawal).format('DD/MMM/YYYY HH:mm:ss') }}</td>
												<td>${{ Number(withdrawals.total).toFixed(2) }}</td>
												<td class="whitespace-nowrap px-2 py-4">{{ withdrawals.reason }}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="p-5 mt-12">
					<div class="bg-gray-100 p-5 shadow-inner">
						<p class="text-[#000000] text-2xl font-bold">Resumen</p>
						<p class="text-[#000000] text-md font-bold w-full mt-2">Billetes: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_tickets).toFixed(2) }}</strong></p>
						<p class="text-[#000000] text-md font-bold w-full mt-2">Monedas: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_coins).toFixed(2) }}</strong></p>
						<p class="text-[#000000] text-md font-bold w-full mt-2">Vouchers: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_vouchers).toFixed(2) }}</strong></p>
						<p class="text-[#000000] text-md font-bold w-full mt-2">Retiros: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_withdrawals).toFixed(2) }}</strong></p>
						<hr class="w-full h-0.5 mx-auto bg-gray-300 border-0 rounded my-4">
						<p class="text-[#000000] text-md font-bold w-full mt-2">Total sistema: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_system).toFixed(2) }}</strong></p>
						<p class="text-[#000000] text-md font-bold w-full mt-2">Varianza: <strong class="text-right ml-5">${{ Number(obj_cashbox.variance).toFixed(2) }}</strong></p>
						<hr class="w-full h-0.5 mx-auto bg-gray-300 border-0 rounded my-4">
						<p class="text-[#000000] text-md font-bold w-full mt-2">Total con retiros: <strong class="text-right ml-5">${{ Number(obj_cashbox.total_with_withdrawals).toFixed(2) }}</strong></p>
						<p class="text-[#000000] text-xl font-bold w-full mt-2">Total: <strong class="text-right ml-5">${{ Number(obj_cashbox.total).toFixed(2) }}</strong></p>
					</div>
					<div class="flex lg:flex-row md:flex-col mt-5 w-full items-center justify-center">
						<button @click="close_cashier('total')" class="bg-[#468aa2] text-[#ffffff] w-auto md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Cierre completo</button>
						<button @click="close_cashier('parcial')" class="bg-[#468aa2] text-[#ffffff] w-auto md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Cierre Parcial</button>
						<!-- <button class="bg-[#D8D9D8] text-[#8D8D8C] w-auto md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Cierre Parcial</button> -->
					</div>
				</div>
			</div>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="showTicket && !loader">
			<button class="bg-[#000000] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
				@click="handleShowTicket()">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</button>

			<div class="flex flex-col items-center mt-10" id="ticketsale">
				<div class="w-full md:w-1/2 lg:w-1/3 bg-white shadowCard p-4 items-center text-center">
					<p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
					<p class="text-lg font-bold mt-5">Cierre de caja <br> {{ obj_cashbox.id }}</p>
					<p class="text-sm mt-5">Fecha <strong>{{ moment(obj_cashbox?.dateClose).format('DD/MMM/YYYY HH:mm:ss') }}</strong></p>
					<p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
					<p class="text-sm">Empleado: <strong class="font-bold">{{ obj_cashbox.employeeInfo?.firstname + ' ' + obj_cashbox.employeeInfo?.lastname }}</strong></p>
					<p class="text-sm mt-5"><strong>Billetes:</strong> ${{ Number(obj_cashbox.total_tickets).toFixed(2) }}</p>
					<p class="text-sm mt-5"><strong>Monedas:</strong> ${{ Number(obj_cashbox.total_coins).toFixed(2) }}</p>
					<p class="text-sm mt-5"><strong>Vouchers:</strong> ${{ Number(obj_cashbox.total_vouchers).toFixed(2) }}</p>
					<p class="text-sm mt-5"><strong>Retiros en efectivo:</strong> ${{ Number(obj_cashbox.total_withdrawals).toFixed(2) }}</p>
					<p class="text-sm mt-5"><strong>Total:</strong> ${{ Number(obj_cashbox.total_with_withdrawals).toFixed(2) }}</p>
					<div class="w-full text-right">
						<svg class="w-full" id="barcode"></svg>
					</div>
				</div>
			</div>
			<button class="bg-[#468aa2] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
				@click="handlePrintTicket()">
				Imprimir
			</button>
		</div>
	</div>

	<!-- modal confirmation -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalConfimationClose">
		<div class="fixed inset-0 bg-[#000000] bg-opacity-75 transition-opacity" @click="handleModalConfimationClose()"></div>
		<div class="fixed inset-0 z-10 w-screen" v-if="loader_save">
			<Loader :msg="'Guardando cierre de caja'"/>
		</div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto" v-else>
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white">
						<!-- Modal header -->
						<div class="flex items-center justify-between border-b rounded-t p-2">
							<button @click="handleModalConfimationClose()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
								<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
						<div class="p-2">
							<div class="mt-3 text-center">
								<h3 class="text-xl font-semibold text-gray-900">
									{{ msg_close.status === 1 ? "El cierre de caja esta correcto" : msg_close.status === 2 ? "El cierre de caja esta fuera del rango" : msg_close.status === 3 ? "El cierre de caja esta dentro del rango" : "" }}
								</h3>
								<p class="text-md font-semibold mt-5">
									¿Desea continuar?
								</p>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 ml-2 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold bg-[#468aa2] text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#4689a2d5] sm:mt-0 sm:w-auto"
							@click="confirmCloseCashier()">Aceptar</button>
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleModalConfimationClose()">Cancelar</button>
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

/* HTML: <div class="loader"></div> */
.loader {
	width: 190px;
	height: 24px;
	box-shadow: 0 5px 0 #000000;
	background: linear-gradient(#000000 0 0) 50%/3px 100% no-repeat;
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
	--c: #000000;
	clip-path: inset(0 0 0 50%);
}

@keyframes l3 {
	100% {
		background-position: calc(100%/3) 0
	}
}
</style>