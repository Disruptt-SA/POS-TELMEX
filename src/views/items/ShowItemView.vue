<script setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useItemsStore } from '../../stores/items';

//components

//Variables
const menuStore = useMenuStore();
const itemsStore = useItemsStore();
const optionSubList = ref("descuentos");
const itemInfoView = ref({
	internalid: "001",
	name: "",
	unitType: "",
	reference: "",
	codeBar: "",
	articletype: "",
	stock: [],
	priceList: [],
	unitList: [],
	components: []
})
const stockData = ref({})

//methods
onMounted(async () => {
	console.log("itemsStore.itemInfo[0]", itemsStore.itemInfo[0])
	console.log("id", itemsStore.itemInfo[0].internalid);

	if(itemsStore.itemInfo[0].custitem_tipo_articulo != 'Kit'){
		itemInfoView.value = {
			internalid: itemsStore.itemInfo[0].internalid ? itemsStore.itemInfo[0].internalid : 'Error',
			name: itemsStore.itemInfo[0].displayname ? itemsStore.itemInfo[0].displayname : null,
			unitType: itemsStore.itemInfo[0].unitdata.nsname ? itemsStore.itemInfo[0].unitdata.nsname : null,
			reference: itemsStore.itemInfo[0].salesdescription ? itemsStore.itemInfo[0].salesdescription : null,
			codeBar: itemsStore.itemInfo[0].upccode ? itemsStore.itemInfo[0].upccode : null,
			stock: itemsStore.itemInfo[0].inventario ? itemsStore.itemInfo[0].inventario : [],
			priceList: itemsStore.itemInfo[0].PriceList ? itemsStore.itemInfo[0].PriceList : [],
			unitList: itemsStore.itemInfo[0].unitlist ? itemsStore.itemInfo[0].unitlist : [],
			articletype: "inventario"
		}
	}else{
		itemInfoView.value = {
			internalid: itemsStore.itemInfo[0].internalid ? itemsStore.itemInfo[0].internalid : 'Error',
			name: itemsStore.itemInfo[0].displayname ? itemsStore.itemInfo[0].displayname : null,
			unitType: "N/A",
			reference: itemsStore.itemInfo[0].salesdescription ? itemsStore.itemInfo[0].salesdescription : null,
			codeBar: itemsStore.itemInfo[0].upccode ? itemsStore.itemInfo[0].upccode : null,
			stock: "N/A",
			priceList: itemsStore.itemInfo[0].PriceList ? itemsStore.itemInfo[0].PriceList : [],
			unitList: [],
			components: itemsStore.itemInfo[0].components ? itemsStore.itemInfo[0].components : [],
			articletype: "kit"
		}
	}
	//stockData.value = await itemsStore.getItemInfoStock(itemsStore.itemInfo[0].internalid);
	//console.log(stockData.value);
})

const changeSubList = (option) => {
	optionSubList.value = option;
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10">
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center">Detalle del producto -
					<strong>{{ itemInfoView.internalid }}</strong>
				</p>
				<div class="col-span-2">
					<!-- <button
						class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Guardar</button> -->
					<button @click="menuStore.handleItems('listItems')"
						class="bg-[#26245C] text-white w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Volver</button>
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
									<input v-model="itemInfoView.name"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" disabled>
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Unidad de medida
									</label>
									<input v-model="itemInfoView.unitType"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" disabled>
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Referencia
									</label>
									<input v-model="itemInfoView.reference"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" disabled>
								</div>
								<div class="w-full md:w-1/4 px-3">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Código del producto
									</label>
									<input v-model="itemInfoView.codeBar"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text" disabled>
								</div>
							</div>
							<!-- <div class="flex flex-wrap -mx-3">
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Categoría
									</label>
									<input v-model="itemInfo.category"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Valor unitario
									</label>
									<input v-model="itemInfo.unitPrice"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Ubicación por tienda
									</label>
									<input v-model="itemInfo.location"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Disponibilidad en stock
									</label>
									<input v-model="itemInfo.stock"
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
							</div> -->
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
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'descuentos' }">Nivel de
							precio</button>
					</li>
					<li class="me-2" v-if="itemInfoView.articletype == 'inventario'">
						<button class="inline-block p-4" @click="changeSubList('inventario')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'inventario' }">Detalle de
							inventario</button>
					</li>
					<li class="me-2" v-if="itemInfoView.articletype == 'inventario'">
						<button class="inline-block p-4" @click="changeSubList('tipounidad')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'tipounidad' }">Tipo de
							unidad</button>
					</li>
					<li class="me-2" v-if="itemInfoView.articletype == 'kit'">
						<button class="inline-block p-4" @click="changeSubList('componentes')"
							:class="{ 'bg-[#fff] text-[#26245C] font-bold': optionSubList === 'componentes' }">Componentes</button>
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
												<tr class="border-b" v-for="priceList in itemInfoView.priceList"
													:key="priceList">
													<td class="whitespace-nowrap px-2 py-4">{{ priceList.pricelevel_name
														}}
													</td>
													<td class="whitespace-nowrap px-2 py-4">{{ priceList.quantity }}
													</td>
													<td class="whitespace-nowrap px-2 py-4">${{ Number(priceList.price_unitprice).toFixed(2) }}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-if="itemInfoView.articletype == 'inventario'" class="p-4 bg-white rounded-lg md:p-8" id="inventario" role="tabpanel"
						aria-labelledby="inventario-tab" v-show="optionSubList === 'inventario'">
						<div class="flex flex-col overflow-x-auto">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead class="border-b font-medium bg-slate-200">
												<tr>
													<th scope="col" class="px-2 py-4">Stock</th>
													<th scope="col" class="px-2 py-4">Locación</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b" v-for="stock in itemInfoView.stock" :key="stock">
													<td class="px-2 py-4">{{ stock.inventario }}</td>
													<td class="py-4">{{ stock.store.name }}</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-if="itemInfoView.articletype == 'inventario'" class="p-4 bg-white rounded-lg md:p-8" id="tipounidad" role="tabpanel"
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
												<tr class="border-b" v-for="unit in itemInfoView.unitList" :key="unit">
													<td class="whitespace-nowrap px-2 py-4">{{ unit.nsname }}</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div v-if="itemInfoView.articletype == 'kit'" class="p-4 bg-white rounded-lg md:p-8" id="componentes" role="tabpanel"
						aria-labelledby="componentes-tab" v-show="optionSubList === 'componentes'">
						<div class="flex flex-col overflow-x-auto">
							<div class="sm:-mx-6 lg:-mx-8">
								<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div class="overflow-x-auto">
										<table class="min-w-full text-left text-sm font-light">
											<thead class="border-b font-medium bg-slate-200">
												<tr>
													<th scope="col" class="px-2 py-4">Artículo</th>
													<th scope="col" class="px-2 py-4">Descripción</th>
													<th scope="col" class="px-2 py-4">Codigo UPC</th>
												</tr>
											</thead>
											<tbody>
												<tr class="border-b" v-for="component in itemInfoView.components" :key="component">
													<td class="whitespace-nowrap px-2 py-4">{{ component.article.displayname }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ component.article.salesdescription }}</td>
													<td class="whitespace-nowrap px-2 py-4">{{ component.article.upccode }}</td>
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