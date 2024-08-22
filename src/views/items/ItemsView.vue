<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useItemsStore } from '../../stores/items';
import { useLocationsStore } from '../../stores/locations';

//components
import ShowItemView from './ShowItemView.vue';
import NewItemView from './NewItemView.vue';

//Variables
const toast = inject('toast')
const user_info = ref({});
const menuStore = useMenuStore()
const itemsStore = useItemsStore()
const locationsStore = useLocationsStore()
const locations_list = ref({});
const locationActual = ref()
const listItems = ref([])
const searchText = ref("")
const formSearch = ref({
	tipo: null,
	marca_id: null,
	submarca_id: null
})
const loader = ref(false)
const datosPaginados = ref([])
const elementosPorPagina = 30
const paginaActual = ref(1)
const brands = ref([])
const subbrands = ref([])

//methods
onMounted(async () => {
	loader.value = true
	await locationsStore.getLocations();
	brands.value = await itemsStore.GetBrands()
	subbrands.value = await itemsStore.GetSubBrands()
	locations_list.value = locationsStore.locations;
	user_info.value = JSON.parse(localStorage.USER_INFO);
	//listItems.value = await itemsStore.getListInventoryItemsFilter(user_info.value.location_id)
	locationActual.value = user_info.value.location_id
	getDataPagina(1)
	loader.value = false
})

const totalPaginas = () => {
	try {
		return Math.ceil(listItems.value.length / elementosPorPagina)	
	} catch (error) {
		return 0
	}
}

const totalArticulos = () => {
	try {
		return listItems.value.length
	} catch (error) {
		return 0
	}
}

const getDataPagina = (noPagina) => {
	try {
		console.info("noPagina", noPagina)
		paginaActual.value = noPagina
		let ini = (noPagina * elementosPorPagina) - elementosPorPagina
		let fin = (noPagina * elementosPorPagina)
		datosPaginados.value = []
		datosPaginados.value = listItems.value.slice(ini, fin)
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
		datosPaginados.value = listItems.value.slice(ini, fin)	
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

const refreshFilter = async () => {
	loader.value = true
	listItems.value = [];
	//listItems.value = await itemsStore.getListInventoryItemsFilter(user_info.value.location_id)
	getDataPagina(1)
	searchText.value = ""
	formSearch.value = {
		tipo: null,
		marca_id: null,
		submarca_id: null
	}
	loader.value = false
}

const handleSelectItem = async (internalId) => {
	console.log("internalid", internalId)
	await itemsStore.getItemInfo(internalId)
	menuStore.handleItems('viewItem');
}

const includesSomeWordsItemsfilter = (original, buscadas) => {
    return buscadas.split(' ').some(p => original.includes(p))
}

const filterItemVByNameOrUpc = async () => {
	let newObj = [];
	console.log("formtext", formSearch.value)
	try {
		const obj_search = await itemsStore.searchItemSale(searchText.value, formSearch.value)
		if(obj_search.data.length > 0){
			console.info("obj_search.data", obj_search.data)
			newObj = obj_search.data
			listItems.value = newObj;
			getDataPagina(1)
		}else{
			refreshFilter()
		}
	} catch (error) {
		refreshFilter()
		toast.open({
			message: `No se encontro el articulo`,
			type: 'warning'
		})
	}
}

const filterItem = async () => {
	console.log("filter")
	console.log("searchText", searchText.value);
	let newObj = [];

	if(searchText.value.length <= 0){
		newObj = []
	}else{
		try {
			const obj_search = await itemsStore.getListInventoryItem(searchText.value)
			console.log("obj_search.data.length", obj_search.data.length)
			if(obj_search.data.length > 0){
				console.info("obj_search.data", obj_search.data)
				newObj = obj_search.data
				listItems.value = newObj;
				getDataPagina(1)
			}else{
				refreshFilter()
			}
		} catch (error) {
			refreshFilter()
			toast.open({
				message: `No se encontro el articulo`,
				type: 'warning'
			})
		}
	}
}

const handleChangeInventory = async (event) => {
	loader.value = true
	const store_id = event.target.value
	locationActual.value = store_id
	listItems.value = await itemsStore.getListInventoryItemsFilter(store_id);
	getDataPagina(1)
	loader.value = false
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24" v-if="menuStore.listItem">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader">
			<div>
				<div class="grid grid-cols-1 lg:grid-cols-1">
					<div class="bg-color-bunsi min-h-screen">
						<div class="flex flex-col min-h-screen justify-center items-center px-10 lg:px-10 md:px-24">
							<!-- <img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block" :src="logoDtt"> -->
							<div class="loader mt-5"></div>
							<p class="mt-2 uppercase text-xl text-[#26245C]">Cargando información</p>
							<p class="text-xs text-[#26245C]">por favor espere...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-else>
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center w-full md:w-auto">Lista de artículos</p>
				<div class="col-span-2">
					<!-- <button @click="menuStore.handleItems('newItems')"
						class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Nuevo
						producto
						+</button> -->
					<button class="bg-[#D8D9D8] text-[#8D8D8C] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Exportar CSV</button>
					<button class="bg-[#D8D9D8] text-[#8D8D8C] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right shadow-inp">Importar CSV</button>
				</div>
			</div>


			<div class="shadow-md sm:rounded-lg mt-10">
				<div class="flex w-full items-center">
					<label for="simple-search" class="sr-only">Buscar</label>
					<div class="w-1/3 mr-2">
						<label for="sltipo">Nombre / Código UPC</label>
						<div class="relative w-full">
							<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
								<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
								</svg>
							</div>
							<input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="Buscar articulo..." v-model="searchText" />
						</div>
					</div>
					<div class="w-1/6 mr-2">
						<label for="sltipo">Tipo (Opcional)</label>
						<select v-model="formSearch.tipo" id="sltipo" name="sltipo" class="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
							<option :value="null" selected>Escoja una opción</option>
							<option value="Kit">Kit</option>
							<option value="Inventario">Inventario</option>
						</select>
					</div>
					<div class="w-1/6 mr-2">
						<label for="slmarca">Marca (Opcional)</label>
						<select v-model="formSearch.marca_id" id="slmarca" name="slmarca" class="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
							<option :value="null" selected>Escoja una opción</option>
							<option :value="brand.nsid" v-for="brand in brands.data" :key="brand">{{ brand.name }}</option>
						</select>
					</div>
					<div class="w-1/6 mr-2">
						<label for="slsubmarca">Sub Marca (Opcional)</label>
						<select v-model="formSearch.submarca_id" id="slsubmarca" name="slsubmarca" class="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
							<option :value="null" selected>Escoja una opción</option>
							<option :value="subbrand.nsid" v-for="subbrand in subbrands.data" :key="subbrand">{{ subbrand.name }}</option>
						</select>
					</div>
					<button @click="filterItemVByNameOrUpc()" @keypress.enter="filterItemVByNameOrUpc()" class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
					<button @click="refreshFilter()"
						class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise w-6 h-6" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
							<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
				</div>

				<div class="flex flex-row w-full">
					<div class="flex flex-col w-1/2">
						<div class="mt-2">Total de páginas: {{ totalPaginas() }} - Elementos por página: {{ elementosPorPagina }}</div>
						<div class="s">Total de Artículos: {{ totalArticulos() }}</div>
							<nav aria-label="Page navigation example">
								<ul class="inline-flex -space-x-px text-sm">
									<li>
										<a @click="getPreviousPage()" class="flex items-center cursor-pointer justify-center px-3 h-8 ms-0 leading-tight text-white bg-[#26245C] border border-e-0 border-[#26245C] rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Previous</a>
									</li>
									<li>
										<select class="w-18 text-xs h-8" @change="getDataPaginaChange($event)" v-model="paginaActual">
											<option v-for="pagina in totalPaginas()" :key="pagina" :value="pagina">
												{{ pagina }}
											</option>
										</select>
									</li>
									<li>
										<a @click="getNextPage()" class="flex items-center cursor-pointer justify-center px-3 h-8 leading-tight text-white bg-[#26245C] border border-[#26245C] rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</a>
									</li>
								</ul>
							</nav>
							<div class="">Mostrando página: {{ paginaActual }} de {{ totalPaginas() }}</div>
					</div>
					<!-- <div class="flex flex-row w-1/2 justify-end justify-self-end">
						<div class="flex flex-col mt-8">
							<div class="">Filtro por tienda</div>
							<select class="text-xs h-8" @change="handleChangeInventory($event)" v-model="locationActual">
								<option :value="locations.internalid" v-for="locations in locations_list" :key="locations.internalid">
									{{ locations.name }}
								</option>
							</select>
						</div>
					</div> -->
				</div>

				<!-- TABLA ARTICULOS -->
				<div class="flex flex-col overflow-x-auto">
					<div class="sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
							<div class="overflow-x-auto">
								<table class="min-w-full text-left text-sm font-light mt-5">
									<thead class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
										<tr v-if="datosPaginados.length === 0">
											<th></th>
										</tr>
										<tr v-else>
											<th scope="col" class="px-5 py-4">
												<!-- <div class="flex flex-col items-center">
													<input id="checkbox-all-search" type="checkbox"
														class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
													<label for="checkbox-all-search" class="sr-only">checkbox</label>
												</div> -->
											</th>
											<th scope="col" class="px-5 py-4">Artículo</th>
											<th scope="col" class="px-5 py-4">Cod Artículo</th>
											<th scope="col" class="px-5 py-4">Precio</th>
											<th scope="col" class="px-5 py-4">Und medida</th>
											<!-- <th scope="col" class="px-5 py-4">Categoria</th>
											<th scope="col" class="px-5 py-4">Ubicación</th> -->
											<th scope="col" class="px-5 py-4">Stock</th>
										</tr>
									</thead>
									<tbody>
										<tr v-if="datosPaginados.length === 0">
											<p class="text-xl text-gray-900 dark:text-white text-center">No hay coincidencias de Artículos, realice la busqueda</p>
										</tr>
										<tr class="border-b dark:border-neutral-500 text-center" v-for="item in datosPaginados" :key="item.internalid" v-else>
											<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
												<div class="flex flex-wrap justify-center">
													<!-- <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"> -->
													<svg @click="handleSelectItem(item.internalid)" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-search ml-2 hover:cursor-pointer" viewBox="0 0 16 16">
														<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
													</svg>
												</div>
											</td>
											<td class="whitespace-nowrap px-2 py-4">{{ item.displayname }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ item.upccode }}</td>
											<td class="whitespace-nowrap px-2 py-4">${{ Number(item.PriceList[0]?.price_unitprice).toFixed(2)}}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ item.unitdata?.nsname }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ item.inventario[0]?.inventario }}
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
	<ShowItemView v-else-if="menuStore.openItem" />
	<NewItemView v-else-if="menuStore.newItem" />
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