<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useInvoicesStore } from '../../stores/invoices';
import { useReturnsStore } from '../../stores/returns';
import moment from 'moment';

//Components

//Variables
const menuStore = useMenuStore()
const toast = inject('toast')
const user_info = ref({})
const invoicesStore = useInvoicesStore()
const returnsStore = useReturnsStore()
const obj_invoice = ref({})
const articles_return = ref([])
const form_reason = ref({
	return_date: new Date().toISOString().substr(0, 10),
	return_type: 0,
	reason_return: ""
})
const loader_rma = ref(false)
const rma_obj_full = ref({})

//Methods
onMounted(async() => {
	console.log("cargando vista")
	if(Object.entries(returnsStore.objReturnChoice).length > 0){
		obj_invoice.value = returnsStore.objReturnChoice

		let total_return = 0
		obj_invoice.value.articles.forEach(article => {
			total_return += Number(article.total) + Number(article.total_tax)
		})

		obj_invoice.value.total_return = total_return

		user_info.value = JSON.parse(localStorage.USER_INFO);

		try {
			rma_obj_full.value = await returnsStore.getRmaById(obj_invoice.value.internalid)
			if(rma_obj_full.value){
				if(rma_obj_full.value.code == 200){
					console.log("Se obtuvo correctamente la info del rma", rma_obj_full.value)
				}else{
					console.error("Error al obtener la info del rma", rma_obj_full.value.msg)
				}
			}
		} catch (error) {
			console.error("Error al obtener la info del rma", error)
		}
	}else{
		obj_invoice.value = {}
	}
})

const recalculate_return = () => {
	let amount = 0
	obj_invoice.value.articles.forEach(article => {
		amount += article.total_return
	})
	obj_invoice.value.total_return = (amount).toFixed(2)
}

const handleAddArticleReturn = (index) => {
	loader_rma.value = true;
	const article_to_return = obj_invoice.value.articles[index]

	if (article_to_return.quantity_return < article_to_return.quiantity) {
		article_to_return.quantity_return = Number(article_to_return.quantity_return) + 1
		article_to_return.total_return = Number(Number(article_to_return.total_return) + Number(article_to_return.rate)).toFixed(2)
	}
	recalculate_return()
	loader_rma.value = false;
}

const handleRemoveArticleReturn = (index) => {
	const article_to_return = obj_invoice.value.articles[index]

	if (article_to_return.quantity_return > 0) {
		article_to_return.quantity_return = Number(article_to_return.quantity_return) - 1
		article_to_return.total_return = Number(article_to_return.total_return) - Number(article_to_return.rate)
	}
	recalculate_return()
}

const handleAproved = async(id) => {
	loader_rma.value = true;
	let obj_status ={
		employee_id: user_info.value.internalid,
		status_approved:true
	}

	console.log("obj_invoice", obj_invoice.value)

	const resp_changeStatus = await returnsStore.updateRmaStatus(obj_invoice.value.internalid, obj_status)
	if(resp_changeStatus.code === 200){
		toast.open({
			message: `${resp_changeStatus.msg}`,
			type: 'success'
		})
		try {
			const respCreditMemo = await returnsStore.createCreditMemo(obj_invoice.value.internalid)
			if(respCreditMemo.code == 200){
				toast.open({
					message: `${respCreditMemo.msg}`,
					type: 'success'
				})
				try {
					const respTimbradoRma = await returnsStore.timbrarRma(respCreditMemo.data.internalid)
					if(respTimbradoRma.code == 200){
						toast.open({
							message: `${respTimbradoRma.msg}`,
							type: 'success'
						})
					}else{
						toast.open({
							message: `${respTimbradoRma.msg}`,
							type: 'warning'
						})
						console.warn("Timbrado RMA", respTimbradoRma.msg)
					}
				} catch (error) {
					toast.open({
						message: `${error}`,
						type: 'error'
					})
					console.error("Timbrado RMA", error)
				}
			}else{
				toast.open({
					message: `${respCreditMemo.msg}`,
					type: 'warning'
				})
				console.warn("Nota de credito", respCreditMemo.msg)
			}
		} catch (error) {
			toast.open({
				message: `${error}`,
				type: 'error'
			})
			console.error("Nota de credito", error)
		}
		loader_rma.value = false;
		menuStore.handleReturn('listReturn')
	}else{
		toast.open({
			message: `${resp_changeStatus.msg}`,
			type: 'error'
		})
		loader_rma.value = false;
	}
}

const handleDecline = async(id) => {
	loader_rma.value = true;
	let obj_status ={
		employee_id: user_info.value.internalid,
		status_approved:false
	}

	const resp_changeStatus = await returnsStore.updateRmaStatus(obj_invoice.value.internalid, obj_status)
	if(resp_changeStatus.code === 200){
		toast.open({
			message: `${resp_changeStatus.msg}`,
			type: 'success'
		})
		loader_rma.value = false;
		menuStore.handleReturn('listReturn')
	}else{
		toast.open({
			message: `${resp_changeStatus.msg}`,
			type: 'error'
		})
		loader_rma.value = false;
	}
}

const timbrado_rma = async() => {
	try {
		console.log('id de nota de credito? ', rma_obj_full.value.data?.credit_memo.internalid)
		const respTimbradoRma = await returnsStore.timbrarRma(rma_obj_full.value.data?.credit_memo.internalid)
		console.log("respTimbradoRma", respTimbradoRma)
		if(respTimbradoRma.code == 200){
			toast.open({
				message: `${respTimbradoRma.msg}`,
				type: 'success'
			})
		}else{
			toast.open({
				message: `${respTimbradoRma.msg}`,
				type: 'warning'
			})
			console.warn("Timbrado RMA", respTimbradoRma.msg)
		}
	} catch (error) {
		toast.open({
			message: `${error}`,
			type: 'error'
		})
		console.error("Timbrado RMA", error)
	}
}

const itemsReceipt = async() => {
	try {
		const resp = await returnsStore.updateRmaItemReceipt(obj_invoice.value.internalid)
		if(resp.code != 200){
			toast.open({
				message: `Error al recibir los Artículos <b/> ${resp.msg}`,
				type: 'error'
			})
		}
		if(resp.code == 200){
			toast.open({
				message: `RMA actualizada correctamente`,
				type: 'success'
			})
			menuStore.handleReturn('listReturn')
		}
	} catch (error) {
		toast.open({
			message: `ocurrio un error al recibir los Artículos <b/> ${error}`,
			type: 'error'
		})
	}
}

</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader_rma">
			<div>
				<div class="grid grid-cols-1 lg:grid-cols-1">
					<div class="bg-color-bunsi min-h-screen">
						<div class="flex flex-col min-h-screen justify-center items-center px-10 lg:px-10 md:px-24">
							<img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block" :src="logoDtt">
							<div class="loader mt-5"></div>
							<p class="mt-2 uppercase text-xl text-[#26245C]">Guardando devolución</p>
							<p class="text-xs text-[#26245C]">por favor espere...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="bg-[#ffffff] w-full rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10"  v-if="!loader_rma">
			<div class="flex flex-col md:flex-row">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center">Gestión de devolución</p>
				<div class="col-span-2 w-full md:w-auto">
					<button @click="menuStore.handleReturn('viewReturnStatus')"
						class="bg-[#26245C] text-white w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Cancelar
					</button>
				</div>
			</div>

			<div class="flex">
				<div class="bg-[#F5F5F5] text-[#26245C] w-full p-10 rounded-3xl shadow-xl mb-5 mt-5">
					<p class="text-[#26245C] font-extrabold text-2xl mb-3">Factura N.{{ obj_invoice?.internalid }}</p>
					<div class="flex items-center justify-center">
						<div class="flex flex-wrap w-full text-sm bg-white p-5 rounded-3xl shadow-lg text-[#26245C]">
							<p class="font-medium text-xl mr-3">{{ obj_invoice?.customer?.companyname }}</p>
							<p class="text-xs font-normal">Factura electronica N.{{ obj_invoice?.internalid }}
								<br> {{  moment(obj_invoice?.trandate).format('DD/MMM/YYYY') }} / <strong class="font-black">${{ obj_invoice?.total_return }}</strong>
							</p>
							<div class="text-gray-800 text-lg font-medium me-2 px-2.5 py-0.5 rounded-full ml-3" :class="{'bg-slate-400':obj_invoice.status_str === 'Pendiente por aprobar', 'bg-green-200':obj_invoice.status_str === 'Aprobado', 'bg-red-200':obj_invoice.status_str === 'Rechazado'}">
								{{ obj_invoice.status_str === 'Pendiente por aprobar' ? "Pendiente por aprobar" : '' }}{{ obj_invoice.status_str === 'Aprobado' ? "Aprobado" : '' }}{{ obj_invoice.status_str === 'Rechazado' ? "Rechazado" : '' }}
							</div>
							<div class="" v-if="rma_obj_full.data?.credit_memo == null || rma_obj_full.data?.credit_memo?.uuid == null && rma_obj_full.data?.status_approved == true && obj_invoice.item_receipt">
								<svg v-if="rma_obj_full.data?.credit_memo == null || rma_obj_full.data?.credit_memo?.uuid != null" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill w-8 h-8 text-green-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
									<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
								</svg>
								<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill w-8 h-8 text-red-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
									<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
								</svg>
							</div>
						</div>
					</div>
					<div class="flex flex-row">
						<!-- Informacion principal -->
						<div class="w-full mt-5 mr-0 md:mr-3 bg-white border border-gray-200 rounded-lg shadow">
							<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] rounded-t-lg bg-[#26245C]"
								id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
								<li class="me-2">
									<p class="inline-block p-4">Factura electrónica {{ obj_invoice?.internalid }}</p>
								</li>
							</ul>
							<div id="defaultTabContent">
								<div class="bg-white rounded-lg" id="about" role="tabpanel" aria-labelledby="about-tab">
									<div class="flex flex-col overflow-x-auto">
										<div class="sm:-mx-6 lg:-mx-8">
											<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
												<div class="overflow-x-auto">
													<table class="min-w-full text-left text-sm font-light">
														<thead class="border-b font-medium text-center bg-slate-200">
															<tr>
																<!-- <th scope="col" class=""></th> -->
																<th scope="col" class="px-5 py-4">Cantidad a devolver</th>
																<th scope="col" class="px-5 py-4">Artículo</th>
																<th scope="col" class="px-5 py-4">Precio unitario</th>
																<th scope="col" class="px-5 py-4">Impuestos a devolver</th>
																<th scope="col" class="px-5 py-4">Total devolver</th>
															</tr>
														</thead>
														<tbody>
															<tr class="border-b text-center items-center" v-for="(article) in obj_invoice.articles" :key="article">
																<!-- <td
																	class="whitespace-nowrap px-2 py-4 font-medium border-l-2">
																	<div
																		class="flex flex-col items-center hover:cursor-pointer">
																		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill w-6 h-6" viewBox="0 0 16 16">
																			<path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
																		</svg>
																	</div>
																</td> -->
																<td class="whitespace-nowrap px-2 py-4">
																	<div class="inline-flex">
																		<!-- <button @click="handleRemoveArticleReturn(index)" class="bg-white">
																			<svg xmlns="http://www.w3.org/2000/svg" width="16"
																				height="16" fill="currentColor"
																				class="bi bi-dash-circle-fill h-7 w-7 hover:text-blue-900"
																				viewBox="0 0 16 16">
																				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z" />
																			</svg>
																		</button> -->
																		<div class="text-xl font-bold pl-2 pr-2">{{ article.quantity }}</div>
																		<!-- <button @click="handleAddArticleReturn(index)" class="bg-white">
																			<svg xmlns="http://www.w3.org/2000/svg" width="16"
																				height="16" fill="currentColor"
																				class="bi bi-plus-circle-fill h-7 w-7 hover:text-blue-900"
																				viewBox=" 0 0 16 16">
																				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
																			</svg>
																		</button> -->
																	</div>
																</td>
																<td class="whitespace-nowrap px-2 py-4">{{ article.article?.displayname }} <br>{{ article.article?.upccode }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ article.rate }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(article.total_tax).toFixed(2)}}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(Number(article.total) + Number(article.total_tax)).toFixed(2) }}</td>
															</tr>
														</tbody>
													</table>
													<p class="text-right p-5 font-medium text-lg">Total a devolver: <strong class="font-extrabold text-xl">${{ Number(obj_invoice.total_return).toFixed(2) }}</strong></p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Solicitud de autoización de devolución -->
						<div class="w-full mt-5 ml-0 md:ml-3 bg-white border border-gray-200 rounded-lg shadow">
							<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] rounded-t-lg bg-[#26245C]"
								id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
								<li class="me-2">
									<p class="inline-block p-4">Solicitud de autorización de devolución</p>
								</li>
							</ul>
							<div id="defaultTabContent">
								<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel"
									aria-labelledby="about-tab">
									<div class="w-full">
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0">
												<label
													class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
													for="grid-last-name">
													Fecha de devolución
												</label>
												<input
													class="appearance-none block w-full bg-white border border-gray-800 shadow-md rounded-3xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:bg-slate-200"
													id="grid-last-name" type="date" :value="obj_invoice.trandate" disabled>
											</div>
										</div>
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0">
												<label
													class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
													for="grid-last-name">
													Tipo de devolución
												</label>
												<select disabled v-model="obj_invoice.return_reason_id" class="appearance-none block w-full bg-white border border-gray-800 shadow-md rounded-3xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:bg-slate-200">
													<option value="0" selected>Seleccione...</option>
													<option :value="return_obj.id" v-for="return_obj in returnsStore.objReturns" :key="return_obj.id">{{ return_obj.name }}</option>
												</select>
											</div>
										</div>
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0">
												<label
													class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
													for="grid-last-name">
													Motivo de devolución
												</label>
												<textarea disabled v-model="obj_invoice.pos_comment" cols="30" rows="10"
													class="appearance-none block w-full bg-white border border-gray-800 shadow-md rounded-3xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:bg-slate-200"></textarea>
											</div>
										</div>
										<div class="pb-10">
											<button @click="timbrado_rma()" v-if="(rma_obj_full.data?.credit_memo != null || rma_obj_full.data?.credit_memo?.internalid) && (rma_obj_full.data?.credit_memo?.uuid == null && rma_obj_full.data?.status_approved == true) && (obj_invoice.item_receipt || rma_obj_full.data?.credit_memo?.internalid) && (rma_obj_full.data?.credit_memo?.uuid == null && rma_obj_full.data?.status_approved == true) && (obj_invoice.item_receipt || rma_obj_full.data?.credit_memo?.internalid) && (rma_obj_full.data?.credit_memo?.uuid == null && rma_obj_full.data?.status_approved == true) && obj_invoice.item_receipt" class="bg-blue-400 hover:bg-blue-500 text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp">
											<!-- <button @click="timbrado_rma()" v-if="rma_obj_full.data?.credit_memo == null || rma_obj_full.data?.credit_memo[0]?.internalid && rma_obj_full.data?.credit_memo[0]?.uuid == null && rma_obj_full.data?.status_approved == true && obj_invoice.item_receipt || rma_obj_full.data?.credit_memo[0]?.internalid && rma_obj_full.data?.credit_memo[0]?.uuid == null && rma_obj_full.data?.status_approved == true && obj_invoice.item_receipt || rma_obj_full.data?.credit_memo[0]?.internalid && rma_obj_full.data?.credit_memo[0]?.uuid == null && rma_obj_full.data?.status_approved == true && obj_invoice.item_receipt" class="bg-blue-400 hover:bg-blue-500 text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp"> -->
												Timbrar
											</button>
											<button @click="itemsReceipt()" v-if="!obj_invoice.item_receipt" class="bg-green-400 hover:bg-green-500 text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp">
												Recibir Artículos
											</button>
											<button @click="handleAproved()" v-if="obj_invoice.item_receipt && obj_invoice.status_approved == null" class="bg-green-400 hover:bg-green-500 text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp">
												Aprobar
											</button>
											<button @click="handleDecline()" v-if="obj_invoice.item_receipt && obj_invoice.status_approved == null" class="bg-red-400 hover:bg-red-500 text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp">
												Rechazar
											</button>
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
</template>