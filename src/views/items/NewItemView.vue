<script setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useUnitsTypeStore } from '../../stores/unitstype';
import { useLocationsStore } from '../../stores/locations';

//components

//Variables
const menuStore = useMenuStore();
const unitsTypeStore = useUnitsTypeStore();
const locationsStore = useLocationsStore();
const optionSubList = ref("descuentos");
const formData = ref({
	displayname: "",
	baseunit: "",
	salesdescription: "",
	upccode: "",
	category: "",
	unitprice: "",
	location: "",
	stock: ""
})

//methods
onMounted(async () => {
	await unitsTypeStore.getListUnitsType();
	formData.value.location = locationsStore.location_id;
})

const changeSubList = (option) => {
	optionSubList.value = option;
}

const saveItem = () => {
	console.log("item", formData.value)
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10">
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center">Detalle del producto</p>
				<div class="col-span-2">
					<button @click="saveItem()"
						class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Guardar</button>
					<button @click="menuStore.handleClient('listItems')"
						class="bg-[#26245C] text-white w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Cancelar</button>
				</div>
			</div>

			<!-- Informacion principal -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] rounded-t-lg bg-[#26245C]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Datos Generales</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-wrap -mx-3 mb-6">
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Nombre producto
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.displayname">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Unidad de medida
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										v-model="formData.baseunit">
										<option :value="unitstype.id" v-for="unitstype in unitsTypeStore.unitsTypeList"
											:key="unitstype.id">{{ unitstype.name }}</option>
									</select>
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Referencia
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.salesdescription">
								</div>
								<div class="w-full md:w-1/4 px-3">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Código del producto
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.upccode">
								</div>
							</div>
							<div class="flex flex-wrap -mx-3">
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Categoría
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.category">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Valor unitario
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.unitprice">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Ubicación por tienda
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										v-model="formData.location">
										<option :value="location.internalid" v-for="location in locationsStore.locations"
											:key="location.internalid" :selected="formData.location == location.internalid">
											{{ location.name }}</option>
									</select>
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Disponibilidad en stock
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" v-model="formData.stock">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Sublists -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] rounded-t-lg bg-[#26245C]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<button class="inline-block p-4" @click="changeSubList('descuentos')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'descuentos' }">Descuentos</button>
					</li>
					<li class="me-2">
						<button class="inline-block p-4" @click="changeSubList('inventario')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'inventario' }">Detalle de
							inventario</button>
					</li>
					<li class="me-2">
						<button class="inline-block p-4" @click="changeSubList('tipounidad')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'tipounidad' }">Tipo de
							unidad</button>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="descuentos" role="tabpanel"
						aria-labelledby="descuentos-tab" v-show="optionSubList === 'descuentos'">
						<div class="flex flex-col overflow-x-auto">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead class="border-b font-medium bg-slate-200">
												<tr>
													<th scope="col" class="px-2 py-4">Nivel de precio</th>
													<th scope="col" class="px-2 py-4">Descuentos</th>
													<th scope="col" class="px-2 py-4">QTY</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b">
													<td class="whitespace-nowrap px-2 py-4">Precio base</td>
													<td class="whitespace-nowrap px-2 py-4"></td>
													<td class="whitespace-nowrap px-2 py-4">$0.000.00</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="p-4 bg-white rounded-lg md:p-8" id="inventario" role="tabpanel"
						aria-labelledby="inventario-tab" v-show="optionSubList === 'inventario'">
						<div class="flex flex-wrap -mx-3 mb-6">
							<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
								<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
									for="grid-last-name">
									Vista
								</label>
								<select
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
									<option value="Prueba">Prueba 1</option>
									<option value="Prueba">Prueba 2</option>
								</select>
							</div>
							<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
								<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
									for="grid-last-name">
									Locación
								</label>
								<select
									class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
									<option value="Guadalajara">Guadalajara</option>
									<option value="Guadalajara">Monterrey</option>
									<option value="Guadalajara">CDMX</option>
								</select>
							</div>
						</div>
						<div class="flex flex-col overflow-x-auto">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead class="border-b font-medium bg-slate-200">
												<tr>
													<th scope="col" class="px-2 py-4">Número de inventario</th>
													<th scope="col" class="px-2 py-4">Status</th>
													<th scope="col" class="px-2 py-4">Locación</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b">
													<td class="px-2 py-4">PLOIK890</td>
													<td class="py-4">Disponible</td>
													<td class="py-4">CDMX</td>
												</tr>
												<tr class="border-b">
													<td class="px-2 py-4">PLOIK890</td>
													<td class="py-4">Disponible</td>
													<td class="py-4">CDMX</td>
												</tr>
												<tr class="border-b">
													<td class="px-2 py-4">PLOIK890</td>
													<td class="py-4">Disponible</td>
													<td class="py-4">CDMX</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="p-4 bg-white rounded-lg md:p-8" id="tipounidad" role="tabpanel"
						aria-labelledby="tipounidad-tab" v-show="optionSubList === 'tipounidad'">
						<div class="flex flex-col overflow-x-auto">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead class="border-b font-medium bg-slate-200">
												<tr>
													<th scope="col" class="px-2 py-4">Unidad</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b">
													<td class="whitespace-nowrap px-2 py-4">PLOIK890</td>
												</tr>
												<tr class="border-b">
													<td class="whitespace-nowrap px-2 py-4">PLOIK890</td>
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
</style>