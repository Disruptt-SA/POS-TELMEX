<script setup>
import { onMounted, ref, inject } from 'vue';
import OpenReturnStatusView from './OpenReturnStatusView.vue';
import { useMenuStore } from '../../stores/menu';
import { useReturnsStore } from '../../stores/returns';

const toast = inject('toast')
const menuStore = useMenuStore()
const returnsStore = useReturnsStore()
const user_info = ref({})

const list_rmas=ref([])

//methods
onMounted(async() => {
	list_rmas.value = await returnsStore.getRmas()
	user_info.value = JSON.parse(localStorage.USER_INFO);
	if(list_rmas.value?.data){
		list_rmas.value.data.forEach(rma => {
			let total_rma = 0
			let status_str = ''
			rma.articles.forEach(article => {
				total_rma += Number(article.total)
			});
			if(rma.status_approved === null){
				status_str = "Pendiente por aprobar"
			}
			if(rma.status_approved === true){
				status_str = "Aprobado"
			}
			if(rma.status_approved === false){
				status_str = "Rechazado"
			}
			if(rma.item_receipt === null){
				status_str = "Recepcionar Artículos"
			}
			rma.total_rma = (total_rma + (total_rma * 0.16)).toFixed(2)
			rma.status_str = status_str
		});
	}
})

const openReturn = (objInvoice) => {
	console.log("rma", objInvoice)
	returnsStore.objReturnChoice = objInvoice
	menuStore.handleReturn('viewOpenReturnStatus')
}

const ordenarAsc = (p_array_json, p_key) => {
   p_array_json.sort(function (a, b) {
      return a[p_key] > b[p_key];
   });
}

const timbrado_rma = async(cmID) => {
	try {
		const respTimbradoRma = await returnsStore.timbrarRma(cmID)
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
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10">
			<div class="flex flex-col md:flex-row">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center w-full md:w-auto">Devoluciones</p>
				<div class="col-span-2" v-if="user_info.cf_drt_custom_rol_id == 3 || user_info.cf_drt_custom_rol_id == 4">
					<button @click="menuStore.handleReturn('listReturn')"
						class="bg-[#26245C] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Volver</button>
				</div>
			</div>

			<div class="shadow-md sm:rounded-lg mt-10">
				<div class="flex items-center">
					<label for="simple-search" class="sr-only">Buscar</label>
					<div class="relative w-1/6">
						<p>Estado</p>
						<div class="absolute inset-y-0 start-0 flex items-center ps-3 pt-3 pointer-events-none">
							<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
							</svg>
						</div>
						<select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
							<option value="todos">Todos</option>
						</select>
					</div>
					<div class="relative w-1/6 ml-2">
						<p>Cliente</p>
						<div class="absolute inset-y-0 start-0 flex items-center ps-3 pt-3 pointer-events-none">
							<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
							</svg>
						</div>
						<input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar articulo..." v-model="searchText" />
					</div>
					<div class="relative w-1/6 ml-2">
						<p>Rango de fecha</p>
						<div class="absolute inset-y-0 start-0 flex items-center ps-3 pt-3 pointer-events-none">
							<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
							</svg>
						</div>
						<select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
							<option value="todos">Todos</option>
							<option value="todos">Hoy</option>
							<option value="todos">Ultimos 3 días</option>
							<option value="todos">Ultimos 7 días</option>
							<option value="todos">Ultimos 15 días</option>
							<option value="todos">Ultimo mes</option>
							<option value="todos">Ultimos 3 meses</option>
							<option value="todos">Ultimos 6 meses</option>
							<option value="todos">Ultimo año</option>
						</select>
					</div>
					<button class="p-4 ms-2 mt-4 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
					<button
						class="p-4 ms-2 mt-4 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
							<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
				</div>

				<div class="flex flex-row w-full">
					<div class="flex flex-col w-1/2">
						<div class="mt-2">Total de páginas: null - Elementos por página: null</div>
						<div class="s">Total de Artículos: null</div>
							<nav aria-label="Page navigation example">
								<ul class="inline-flex -space-x-px text-sm">
									<li>
										<a class="flex items-center cursor-pointer justify-center px-3 h-8 ms-0 leading-tight text-white bg-[#26245C] border border-e-0 border-[#26245C] rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Previous</a>
									</li>
									<li>
										<select class="w-18 text-xs h-8">
											<option>
												1
											</option>
										</select>
									</li>
									<li>
										<a class="flex items-center cursor-pointer justify-center px-3 h-8 leading-tight text-white bg-[#26245C] border border-[#26245C] rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</a>
									</li>
								</ul>
							</nav>
							<div class="">Mostrando página: null de null</div>
					</div>
					<div class="flex flex-row w-1/2 justify-end justify-self-end">
						<div class="flex flex-col mt-8">
							<div class="">Filtro por tienda</div>
							<select class="text-xs h-8">
								<option>
									tienda
								</option>
							</select>
						</div>
					</div>
				</div>

				<!-- TABLA ARTICULOS -->
				<div class="flex flex-col overflow-x-auto">
					<div class="sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
							<div class="overflow-x-auto">
								<table class="min-w-full text-left text-sm font-light mt-5">
									<thead class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
										<!-- <tr v-if="datosPaginados.length === 0">
											<th></th>
										</tr> -->
										<tr>
											<th scope="col" class="px-5 py-4">Acciones</th>
											<th scope="col" class="px-5 py-4">Cliente</th>
											<th scope="col" class="px-5 py-4">Fecha</th>
											<th scope="col" class="px-5 py-4">No. Factura</th>
											<th scope="col" class="px-5 py-4">No. Devolución</th>
											<th scope="col" class="px-5 py-4">RMA timbrada</th>
											<th scope="col" class="px-5 py-4">Total</th>
											<th scope="col" class="px-5 py-4">Motivo de devolución</th>
											<th scope="col" class="px-5 py-4">Estado</th>
										</tr>
									</thead>
									<tbody>
										<!-- <tr v-if="datosPaginados.length === 0">
											<p class="text-xl text-gray-900 dark:text-white text-center">Esta tienda no tiene Artículos en su stock</p>
										</tr> -->
										<tr class="border-b dark:border-neutral-500 text-center" v-for="rma in list_rmas?.data" :key="rma">
											<td class="whitespace-nowrap px-2 py-4">
												<div class="flex flex-wrap justify-center">
													<!-- <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"> -->
													<svg @click="openReturn(rma)" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-search ml-2 hover:cursor-pointer hover:text-[#fab33c] hover:" viewBox="0 0 16 16">
														<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
													</svg>
													<svg v-if="rma.credit_memo?.uuid === null" @click="rma.credit_memo?.internalid" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-bell ml-2 hover:cursor-pointer hover:text-[#fab33c]" viewBox="0 0 16 16">
														<path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
													</svg>
												</div>
											</td>
											<td class="whitespace-nowrap px-2 py-4">{{ rma.customer?.companyname }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ rma.trandate }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ rma.invoice_origin_id }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ rma.internalid }}</td>
											<td class="whitespace-nowrap px-2 py-4">
												<div class="items-center">
													<div v-if="rma.credit_memo?.uuid === null" class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50" role="alert">
														<span class="font-medium">RMA no timbrada!</span> <br> Reintente con el timbrado <br> manual.
													</div>
													<div v-if="rma?.credit_memo === null" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
														<span class="font-medium">Credit memo no creado!</span> <br> No se puedo crear el credit memo, <br> no podra realizar el timbrado manual.
													</div>

													<svg v-if="rma.credit_memo?.uuid === null" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell-slash-fill w-8 h-8 text-yellow-800 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
														<path d="M5.164 14H15c-1.5-1-2-5.902-2-7q0-.396-.06-.776zm6.288-10.617A5 5 0 0 0 8.995 2.1a1 1 0 1 0-1.99 0A5 5 0 0 0 3 7c0 .898-.335 4.342-1.278 6.113zM10 15a2 2 0 1 1-4 0zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75z"/>
													</svg>
													<svg v-else-if="rma?.credit_memo === null" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill w-8 h-8 text-red-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
														<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
													</svg>
													<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill w-8 h-8 text-green-900 ml-[40%] mr-[40%]" viewBox="0 0 16 16">
														<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
													</svg>
												</div>
											</td>
											<td class="whitespace-nowrap px-2 py-4">${{ rma.total_rma }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ rma.reason?.name }}</td>
											<td class="whitespace-nowrap px-2 py-4">
												<div class="text-gray-800 text-lg font-medium me-2 px-2.5 py-0.5 rounded-full" :class="{'bg-slate-400':rma.status_str === 'Pendiente por aprobar', 'bg-green-200':rma.status_str === 'Aprobado', 'bg-red-200':rma.status_str === 'Rechazado', 'bg-blue-200':rma.status_str === 'Recepcionar Artículos'}">
													{{ rma.status_str === 'Pendiente por aprobar' ? "Pendiente por aprobar" : '' }}{{ rma.status_str === 'Aprobado' ? "Aprobado" : '' }}{{ rma.status_str === 'Rechazado' ? "Rechazado" : '' }}{{ rma.status_str === 'Recepcionar Artículos' ? "Recepcionar Artículos" : '' }}
												</div>
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
</template>

<style lang="scss" scoped>
</style>