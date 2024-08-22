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
const reembolso_inmediato = ref(false)
const form_reason = ref({
	return_date: new Date().toISOString().substr(0, 10),
	return_type: 0,
	reason_return: ""
})
const loader_rma = ref(false)
const discounts_flag = ref(false)

//Methods
onMounted(() => {
	console.log("invoicesStore.obj_invoice_choice", invoicesStore.obj_invoice_choice)
	if(Object.entries(invoicesStore.obj_invoice_choice).length > 0){
		obj_invoice.value = invoicesStore.obj_invoice_choice

		if(obj_invoice.value.descuento_global > 0){
			discounts_flag.value = true
		}

		obj_invoice.value.articles.forEach(article => {
			if(article.article.custitem_tipo_articulo == "Promo" || article.article.custitem_tipo_articulo == "Regalo"){
				discounts_flag.value = true
			}
			article.quantity_return = Number(0)
			article.total_return = Number(0)
			article.tax_return = Number(0)
			article.rate = Number(article.rate)
			article.quiantity = Number(article.quiantity)
			article.total = Number(article.total)
			article.total_tax = Number(article.total_tax)
			article.returned_qty = Number(article.returned_qty)
		})

		obj_invoice.value.total_return = 0

		user_info.value = JSON.parse(localStorage.USER_INFO);
	}else{
		obj_invoice.value = {}
	}

	console.log("obj_invoice", obj_invoice.value)
})

const recalculate_return = () => {
	let amount = 0
	let tax = 0
	let amount_total = 0
	obj_invoice.value.articles.forEach(article => {
		amount += article.total_return
		tax += article.total_return * 0.16.toFixed(2)
		amount_total = amount + tax
	})
	obj_invoice.value.total_return = amount_total
	console.log("amount", amount)
	console.log("tax", tax)
	console.log("amount_total", amount_total)
	console.log("objinvoice", obj_invoice.value)
}

const handleAddArticleReturn = (index) => {
	loader_rma.value = true;
	const article_to_return = obj_invoice.value.articles[index]

	if (article_to_return.quantity_return < article_to_return.quiantity) {
		article_to_return.quantity_return = Number(article_to_return.quantity_return) + 1
		article_to_return.total_return = Number(article_to_return.total_return) + Number(article_to_return.rate)
		article_to_return.tax_return = article_to_return.total_return * 0.16

		/* article_to_return.total_return = (article_to_return.total_return).toFixed(2)
		article_to_return.tax_return = (article_to_return.tax_return).toFixed(2) */
	}
	recalculate_return()
	loader_rma.value = false;
}

const handleRemoveArticleReturn = (index) => {
	loader_rma.value = true;
	const article_to_return = obj_invoice.value.articles[index]

	if (article_to_return.quantity_return > 0) {
		article_to_return.quantity_return = Number(article_to_return.quantity_return) - 1
		article_to_return.total_return = Number(article_to_return.total_return) - Number(article_to_return.rate)
		article_to_return.tax_return = article_to_return.total_return * 0.16
	}
	recalculate_return()
	loader_rma.value = false;
}

const handleCreateReturn = async() => {
	loader_rma.value = true;
	const articles_return = []

	obj_invoice.value.articles.forEach(article => {
		if(article.quantity_return > 0){
			articles_return.push({
				article_id: article.id_item,
				quantity: article.quantity_return,
				pricelevel: article.pricelevel,
				currency: article.currency,
				rate: article.rate,
				units: article.units,
				total: article.total_return,
				total_tax: article.total_return * 0.16
			})
		}
	});

	const return_obj = {
		invoice_origin_id: obj_invoice.value.internalid,
		request_employee_id: user_info.value.internalid,
		employee_approve_id: null,
		location_id: user_info.value.location_id,
		subsidiary_id: user_info.value.subsidiary_id,
		customer_id: obj_invoice.value.id_customer,
		reason_id: form_reason.value.return_type,
		item_receipt: null,
		trandate: form_reason.value.return_date,
		pos_comment: form_reason.value.reason_return,
		status_approved: false,
		reembolso: reembolso_inmediato.value,
		articles:articles_return
	}
	console.log('objeto del RMA: ', return_obj)
	
	const resp_rma = await returnsStore.createRMA(return_obj)

	if(resp_rma.status == "success"){
		toast.open({
			message: `${resp_rma.msg}`,
			type: 'success'
		})
	}else{
		toast.open({
			message: `${resp_rma.msg}`,
			type: 'error'
		})
	}
	loader_rma.value = false;

	menuStore.handleReturn('listReturn')
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
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center">Devoluciones</p>
				<div class="col-span-2 w-full md:w-auto">
					<button @click="menuStore.handleReturn('listReturn')"
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
								<br> {{  moment(obj_invoice?.trandate).format('DD/MMM/YYYY') }} / <strong class="font-black">${{ obj_invoice?.total_invoice }}</strong>
							</p>
						</div>
					</div>
					<div class="p-5 bg-red-200 rounded-3xl mt-5 shadow-lg text-xl font-bold" v-if="discounts_flag">
						No puede realizar devoluciones sobre esta venta. Contiene promociones aplicadas.
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
																<!-- <th scope="col" class="px-5 py-4">Cantidad ya devueltos</th> -->
																<th scope="col" class="px-5 py-4">Artículo</th>
																<th scope="col" class="px-5 py-4">Precio unitario</th>
																<th scope="col" class="px-5 py-4">Cantidad comprada</th>
																<th scope="col" class="px-5 py-4">Total comprado</th>
																<th scope="col" class="px-5 py-4">Impuestos a devolver</th>
																<th scope="col" class="px-5 py-4">Total devolver</th>
															</tr>
														</thead>
														<tbody>
															<tr class="border-b text-center items-center" v-for="(article, index) in obj_invoice.articles" :key="article">
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
																	<div class="inline-flex" v-if="!discounts_flag">
																		<button @click="handleRemoveArticleReturn(index)" class="bg-white" v-if="article.article.custitem_tipo_articulo != 'Kit'">
																			<svg xmlns="http://www.w3.org/2000/svg" width="16"
																				height="16" fill="currentColor"
																				class="bi bi-dash-circle-fill h-7 w-7 hover:text-blue-900"
																				viewBox="0 0 16 16">
																				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z" />
																			</svg>
																		</button>
																		<div class="text-xl font-bold pl-2 pr-2">{{ article.quantity_return }}</div>
																		<button @click="handleAddArticleReturn(index)" class="bg-white" v-if="article.article.custitem_tipo_articulo != 'Kit'">
																			<svg xmlns="http://www.w3.org/2000/svg" width="16"
																				height="16" fill="currentColor"
																				class="bi bi-plus-circle-fill h-7 w-7 hover:text-blue-900"
																				viewBox=" 0 0 16 16">
																				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
																			</svg>
																		</button>
																	</div>
																</td>
																<!-- <td class="whitespace-nowrap px-2 py-4">{{ article.quantity_return }}</td> -->
																<td class="whitespace-nowrap px-2 py-4">{{ article.article?.displayname }} <br>{{ article.article?.upccode }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(article.rate).toFixed(2) }}</td>
																<td class="whitespace-nowrap px-2 py-4">{{ article.quiantity }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(article.total).toFixed(2) }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(article.tax_return).toFixed(2) }}</td>
																<td class="whitespace-nowrap px-2 py-4">${{ Number(article.total_return).toFixed(2) }}</td>
															</tr>
														</tbody>
													</table>
													<p class="text-right p-5 font-medium text-lg">Total a devolver: <strong class="font-extrabold text-xl">${{ Number(obj_invoice.total_return).toFixed(2)}}</strong></p>
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
									<p class="inline-block p-4">Solicitud de autoización de devolución</p>
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
													id="grid-last-name" type="date" :value="form_reason.return_date" disabled>
											</div>
										</div>
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0" v-if="!discounts_flag">
												<label
													class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
													for="grid-last-name">
													Tipo de devolución
												</label>
												<select v-model="form_reason.return_type" class="appearance-none block w-full bg-white border border-gray-800 shadow-md rounded-3xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
													<option value="0" selected>Seleccione...</option>
													<option :value="return_obj.id" v-for="return_obj in returnsStore.objReturns" :key="return_obj.id">{{ return_obj.name }}</option>
												</select>
											</div>
										</div>
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0" v-if="!discounts_flag">
												<input type="checkbox" id="checkbox" v-model="reembolso_inmediato" />
												<label class="pl-2 uppercase text-gray-700 text-xs font-bold mb-2">
													¿Requiere reembolso de efectivo inmediato?
												</label>
											</div>
										</div>
										<div class="flex flex-wrap -mx-3 mb-6">
											<div class="w-full px-3 mb-6 md:mb-0" v-if="!discounts_flag">
												<label
													class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
													for="grid-last-name">
													Motivo de devolución
												</label>
												<textarea v-model="form_reason.reason_return" cols="30" rows="10"
													class="appearance-none block w-full bg-white border border-gray-800 shadow-md rounded-3xl py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"></textarea>
											</div>
										</div>
										<div class="pb-10">
											<button v-if="!discounts_flag" @click="handleCreateReturn()" class="bg-[#fab33c] text-black w-full md:w-auto lg:w-auto font-semibold px-8 py-4 rounded-xl float-right ml-5 shadow-inp">
												Generar solicitud de devolución
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