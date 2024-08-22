<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useCustomersStore } from '../../stores/customer';

//components
import NewClientView from './NewClientView.vue';
import UpdateClientView from './UpdateClientView.vue';
import Loader from '../../components/Loader.vue';

//Variables
const toast = inject('toast')
const menuStore = useMenuStore();
const customerStore = useCustomersStore();
const searchText = ref("");
const listClients = ref([]);
const datosPaginados = ref([]);
const loader = ref(false)
const elementosPorPagina = 30
const paginaActual = ref(1)
const tipoBusqueda = ref(1)

//methods
onMounted(async () => {
	loader.value = true
	listClients.value = await customerStore.getListCustomers();
	console.log("listClients.value", listClients.value)
	getDataPagina(1)
	loader.value = false
})

const refreshFilter = async () => {
	loader.value = true
	listClients.value = await customerStore.getListCustomers();
	getDataPagina(1)
	searchText.value = ""
	loader.value = false
}

const handleRefreshFilter = async () => {
	if(searchText.value.length <= 1){
		loader.value = true
		listClients.value = await customerStore.getListCustomers();
		getDataPagina(1)
		searchText.value = ""
		loader.value = false
	}
}

const totalPaginas = () => {
	return Math.ceil(listClients.value.length / elementosPorPagina)
}

const totalClientes = () => {
	try {
		return listClients.value.length
	} catch (error) {
		return 0
	}
}

const getDataPagina = (noPagina) => {
	try {
		paginaActual.value = noPagina
		let ini = (noPagina * elementosPorPagina) - elementosPorPagina
		let fin = (noPagina * elementosPorPagina)
		datosPaginados.value = []
		datosPaginados.value = listClients.value.slice(ini, fin)
	} catch (error) {
		datosPaginados.value = []
	}
}

const getDataPaginaChange = (event) => {
	try {
		let noPagina = event.target.value
		paginaActual.value = noPagina
		let ini = (noPagina * elementosPorPagina) - elementosPorPagina
		let fin = (noPagina * elementosPorPagina)
		datosPaginados.value = []
		datosPaginados.value = listClients.value.slice(ini, fin)
	} catch (error) {
		datosPaginados.value = []
	}
}

const getPreviousPage = (noPagina) => {
	if (paginaActual.value > 1) {
		paginaActual.value--
	}
	getDataPagina(paginaActual.value)
}

const getNextPage = (noPagina) => {
	if (paginaActual.value < totalPaginas()) {
		paginaActual.value++
	}
	getDataPagina(paginaActual.value)
}

const includesSomeWordsClientfilter = (original, buscadas) => {
    return buscadas.split(' ').some(p => original.includes(p))
}

const filterClient = () => {
	let newObj = [];

	try {
		if (searchText.value.length <= 0) {
			listClients.value = customerStore.customersList;
		} else {
			customerStore.customersList.filter(obj => {
				if (obj.companyname != null) {
					const verified = includesSomeWordsClientfilter(obj.companyname.toLowerCase(), searchText.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
					/* if (obj.companyname.toLowerCase().startsWith(searchText.value.toLowerCase())) {
						newObj.push(obj);
					} */
				}else if(obj.firstname != null && obj.lastname != null){
					const verified = includesSomeWordsClientfilter(obj.firstname.toLowerCase() + " " + obj.lastname.toLowerCase(), searchText.value.toLowerCase())
					if (verified) {
						newObj.push(obj);
					}
				}
			});

			if (newObj.length === 0) {
				console.log("no se encontro al cliente");
				listClients.value = customerStore.customersList;
			} else {
				listClients.value = newObj;
				getDataPagina(1)
			}
		}
	} catch (error) {
		listClients.value = customerStore.customersList;
	}
}

const selectClient = (internalid) => {
	customerStore.customerId = internalid;
	menuStore.handleClient('updateClient')
}

const searchClient = async() => {
	try {
		const bodySearch = {}
		if(tipoBusqueda.value == 1){
			bodySearch.name = searchText.value.toLowerCase()
		}else if(tipoBusqueda.value == 2){
			bodySearch.rfc = searchText.value.toLowerCase()
		}else{
			bodySearch.name = searchText.value.toLowerCase()
		}
		console.log(bodySearch)
		const objSearch = await customerStore.getCustomerWithObj(bodySearch)
		if(objSearch.data?.length > 0){
			listClients.value = objSearch.data
			getDataPagina(1)
		}else{
			listClients.value = []
			toast.open({
				message: `No se encontro al cliente`,
				type: 'warning'
			})
		}
	} catch (error) {
		listClients.value = []
		toast.open({
			message: `Error al buscar al cliente <br> ${error}`,
			type: 'error'
		})
	}
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24" v-if="menuStore.listClient">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader">
			<Loader msg="Cargando información"/>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-else>
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center w-full md:w-auto">Clientes</p>
				<div class="col-span-2">
					<button @click="menuStore.handleClient('newClients')"
						class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Nuevo
						Cliente
						+</button>
					<button
						class="bg-[#D8D9D8] text-[#8D8D8C] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Exportar
						CSV</button>
					<button
						class="bg-[#D8D9D8] text-[#8D8D8C] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right shadow-inp">Importar
						CSV</button>
				</div>
			</div>


			<div class="shadow-md sm:rounded-lg mt-10">
				<!-- <div class="relative">
					<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
						<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
						</svg>
					</div>
					<input type="search" id="search"
						class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#fab33c] focus:border-[#fab33c]"
						placeholder="Buscar cliente" v-model="searchText" v-on:keyup.delete="filterClient()" required>
					<button
						class="text-white absolute end-2.5 bottom-2.5 bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c] font-medium rounded-lg text-sm px-4 py-2"
						@click="filterClient()">Buscar</button>
				</div> -->

				<div class="flex items-center">
					<label for="simple-search" class="sr-only">Buscar</label>
					<div class="flex w-full">
						<div class="w-1/6 mr-2">
							<label for="sltipo">Tipo Busqueda</label>
							<select v-model="tipoBusqueda" id="sltipo" name="sltipo" class="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
								<option value="1" selected>Nombre</option>
								<option value="2">RFC</option>
							</select>
						</div>
						<div class="w-full mr-2">
							<label for="sltipo">{{ tipoBusqueda == 1 ? 'Nombre Cliente' : 'RFC Cliente' }}</label>
							<div class="relative w-full">
								<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
									<svg class="w-4 h-4 text-gray-500" aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
											stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
									</svg>
								</div>
								<input type="text" id="simple-search"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
									placeholder="Buscar cliente..." v-model="searchText" @keypress.enter="searchClient()" @keydown.delete="handleRefreshFilter()" />
							</div>
						</div>
					</div>
					<button @click="searchClient()"
						class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
							viewBox="0 0 20 20">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
					<button @click="refreshFilter()"
						class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
							class="bi bi-arrow-clockwise w-6 h-6" viewBox="0 0 16 16">
							<path fill-rule="evenodd"
								d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
							<path
								d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
				</div>

				<div class="mt-2">Total de páginas: {{ totalPaginas() }} - Elementos por página: {{ elementosPorPagina
					}}</div>
				<div class="s">Total de clientes: {{ totalClientes() }}</div>
				<nav aria-label="Page navigation example">
					<ul class="inline-flex -space-x-px text-sm">
						<li>
							<a @click="getPreviousPage()"
								class="flex items-center cursor-pointer justify-center px-3 h-8 ms-0 leading-tight text-white bg-[#26245C] border border-e-0 border-[#26245C] rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Previous</a>
						</li>
						<li>
							<select class="w-18 text-xs h-8" @change="getDataPaginaChange($event)"
								v-model="paginaActual">
								<option v-for="pagina in totalPaginas()" :key="pagina" :value="pagina">
									{{ pagina }}
								</option>
							</select>
						</li>


						<li>
							<a @click="getNextPage()"
								class="flex items-center cursor-pointer justify-center px-3 h-8 leading-tight text-white bg-[#26245C] border border-[#26245C] rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</a>
						</li>
					</ul>
				</nav>
				<div class="mb-2">Mostrando página: {{ paginaActual }} de {{ totalPaginas() }}</div>

				<!-- <div class="flex flex-col items-center">
					<span class="text-sm text-gray-700 dark:text-gray-400">
						Showing <span class="font-semibold text-gray-900 dark:text-white">1</span> to <span
							class="font-semibold text-gray-900 dark:text-white">10</span> of <span
							class="font-semibold text-gray-900 dark:text-white">{{ listClients.value.length }}</span>
						Entries
					</span>
					<div class="inline-flex mt-2 xs:mt-0">
						<button @click="getPreviousPage()"
							class="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Prev
						</button>
						<button @click="getNextPage()"
							class="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Next
						</button>
					</div>
				</div> -->

				<!-- TABLA CLIENTES -->
				<div class="flex flex-col overflow-x-auto">
					<div class="sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
							<div class="overflow-x-auto">
								<table class="min-w-full text-left text-sm font-light">
									<thead
										class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
										<tr>
											<th scope="col" class="px-5 py-4">
												<!-- <div class="flex flex-col items-center">
													<input id="checkbox-all-search" type="checkbox"
														class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
													<label for="checkbox-all-search" class="sr-only">checkbox</label>
												</div> -->
											</th>
											<th scope="col" class="px-5 py-4">Nombre Cliente</th>
											<th scope="col" class="px-5 py-4">RFC</th>
											<th scope="col" class="px-5 py-4">Télefono</th>
											<th scope="col" class="px-5 py-4">Dirección de envio</th>
											<th scope="col" class="px-5 py-4">Dirección de facturación</th>
											<!-- <th scope="col" class="px-5 py-4">Comentarios</th> -->
										</tr>
									</thead>
									<tbody>
										<tr class="border-b dark:border-neutral-500 text-center"
											v-for="client in datosPaginados" :key="client">
											<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
												<div class="flex flex-wrap justify-center">
													<!-- <input id="checkbox-table-search-1" type="checkbox"
														class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"> -->
													<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
														class="bi bi-search ml-2 cursor-pointer w-7 h-7 hover:text-[#fab33c]"
														viewBox="0 0 16 16" @click="selectClient(client.internalid)">
														<path
															d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
													</svg>
												</div>
											</td>
											<td class="whitespace-nowrap px-2 py-4">{{ client.companyname ? client.companyname : client.firstname + " " + client.lastname }}</td>
											<td class="whitespace-nowrap px-2 py-4" :class="client._drt_custom_rfc ? '' : 'bg-slate-200'">{{ client._drt_custom_rfc }}</td>
											<td class="whitespace-nowrap px-2 py-4" :class="client.phone ? '' : 'bg-slate-200'">{{ client.phone }}</td>
											<td class="whitespace-nowrap px-2 py-4">
												<select class="w-64 lg:w-80 p-3 rounded-xl shadow-sl">21
													<option :value="direction.internalid" v-for="direction in client.directions" :key="direction.internalid">{{ `Calle ${direction.calle} ${direction.numero_e} ${direction.numero_i} ${direction.colonia} ${direction.codigopostal} ${direction.municipio} ` }}</option>
												</select>
											</td>
											<td class="whitespace-nowrap px-2 py-4">
												<select class="w-64 lg:w-80 p-3 rounded-xl shadow-sl">
													<option :value="direction.internalid" v-for="direction in client.directions" :key="direction.internalid">{{ `Calle ${direction.calle} ${direction.numero_e} ${direction.numero_i} ${direction.colonia} ${direction.codigopostal} ${direction.municipio} ` }}</option>
												</select>
											</td>
											<!-- <td class="whitespace-nowrap px-2 py-4 border-l-2">Cell</td> -->
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
	<NewClientView v-else-if="menuStore.newClient" />
	<UpdateClientView v-else-if="menuStore.updateClient" />
</template>