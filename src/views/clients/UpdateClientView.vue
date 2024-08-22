<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import { useCustomersStore } from '../../stores/customer';
import { useCountryStore } from '../../stores/country';

//components
import Loader from '../../components/Loader.vue';

//Variables
const menuStore = useMenuStore()
const customerStore = useCustomersStore()
const countryStore = useCountryStore()
const load_info = ref(true)
const load_info_save = ref( false)
const toast = inject('toast')
const client_info = ref({
	internalid: 0,
	externalid: null,
	idCuenta: null,
	subsidiary: 4,
	isperson: "t",
	companyname: "",
	firstname: "",
	lastname: "",
	_drt_custom_rfc: "",
	custentity_mx_rfc: "",
	_drt_custom_regimen_fiscal: null,
	_drt_custom_uso_cfdi: null,
	_drt_custom_tipo_cliente: null,
	custentity_drt_send_email_invoice: "",
	custentity_drt_send_email_customerpayment: "",
	phone: "",
	pricelevel: 4,
	terms: null,
	_drt_pos_salesrep: null,
	isinactive: "f",
	denviodefecto: null,
	dfacturaciondefecto: null,
	tokenAutenticacion: null,
	regimen_fiscal: null,
	_drt_pos_origen_pos: "t",
	syncns: false,
	syncmsg: null
});
const client_directions = ref({});
const modalAddAddress = ref(false);
const buttonAddAddress = ref("Agregar");
const indexUpdateAddress = ref();
const formAddress = ref({
	internalid: null,
	externalid: null,
	customerid: null,
	etiquetadireccion: null,
	pais: null,
	codigopostal: null,
	estado: null,
	municipio: null,
	colonia: null,
	ciudad: null,
	calle: null,
	numero_e: null,
	numero_i: null,
	referencia: null,
	syncns: false,
	syncmsg: null
});
const payments_terms = ref([])
const payments_forms = ref([])
const objAddress = ref([]);
const saveClient = ref(false);
const txtBtnSbe = ref("Guardar"); 
const cfdiList = ref([])
const state_list = ref([])
const regimenFiscal = ref([
	{
		nsid:1,
		name:"601 - General de Ley Personas Morales"
	},
	{
		nsid:2,
		name:"603 - Personas Morales con Fines no Lucrativos"
	},
	{
		nsid:11,
		name:"605 - Sueldos y Salarios e Ingresos Asimilados a Salarios"
	},
	{
		nsid:12,
		name:"606 - Arrendamiento"
	},
	{
		nsid:10,
		name:"607 - Régimen de Enajenación o Adquisición de Bienes"
	},
	{
		nsid:13,
		name:"608 - Demás ingresos"
	},
	{
		nsid:4,
		name:"610 - Residentes en el Extranjero sin Establecimiento Permanente en México"
	},
	{
		nsid:14,
		name:"611 - Ingresos por Dividendos (socios y accionistas)"
	},
	{
		nsid:15,
		name:"612 - Personas Físicas con Actividades Empresariales y Profesionales"
	},
	{
		nsid:16,
		name:"614 - Ingresos por intereses"
	},
	{
		nsid:19,
		name:"615 - Régimen de los ingresos por obtención de premios"
	},
	{
		nsid:17,
		name:"616 - Sin obligaciones fiscales"
	},
	{
		nsid:5,
		name:"620 - Sociedades Cooperativas de Producción que Optan por Diferir sus Ingresos"
	},
	{
		nsid:18,
		name:"621 - Incorporación Fiscal"
	},
	{
		nsid:6,
		name:"622 - Actividades Agrícolas, Ganaderas, Silvícolas Y Pesqueras"
	},
	{
		nsid:7,
		name:"623 - Opcional para Grupos de Sociedades"
	},
	{
		nsid:8,
		name:"624 - Coordinados"
	},
	{
		nsid:22,
		name:"625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas"
	},
	{
		nsid:23,
		name:"626 - Régimen Simplificado de Confianza"
	}
])

//methods
onMounted(async () => {
	load_info.value = true;
	client_info.value = await customerStore.getCustomerWithId(customerStore.customerId);
	client_directions.value = await customerStore.getCustomerDirections(customerStore.customerId)
	cfdiList.value = await customerStore.getCfdis()
	await countryStore.getCountrys()
	payments_terms.value = await customerStore.paymentTermList()
	payments_forms.value = await customerStore.formPaymentList()

	client_directions.value.forEach(client_direction => {
		countryStore.country_list.forEach(country => {
			if(client_direction.paisid == country.id){
				console.info("entro a la busqueda")
				client_direction.pais = country.name
				if(country.id == client_direction.paisid){
					state_list.value = country.states
				}
				country.states.forEach(state => {
				if(client_direction.estadoid == state.id){
					client_direction.estado = state.name
				}
			})
		}
		})
	})

	load_info.value = false;
	console.log("customer info", client_info.value);
	console.log("client_directions", client_directions.value);
})

const getRandomInt = (min, max) => {
	return Math.floor(Math.random() * (max - min) + min);
}

const handleShowAddAddress = () => {
	modalAddAddress.value = !modalAddAddress.value;
	formAddress.value = {
		internalid: null,
		externalid: null,
		customerid: null,
		etiquetadireccion: null,
		pais: null,
		codigopostal: null,
		estado: null,
		municipio: null,
		colonia: null,
		ciudad: null,
		calle: null,
		numero_e: null,
		numero_i: null,
		referencia: null,
		syncns: false,
		syncmsg: null
	}
	buttonAddAddress.value = "Agregar";
}

const handleUpdateClient = async (customerId) => {
	load_info_save.value = true
	saveClient.value = true;
	txtBtnSbe.value = "Guardando, espere por favor...";
	console.log("client_info.value[0]", client_info.value[0])
	client_info.value[0].custentity_drt_send_email_customerpayment = client_info.value[0].custentity_drt_send_email_invoice
	const respSaveClient = await customerStore.updateClient(customerId, client_info.value[0]);
	console.log("respupdate", respSaveClient);
	if (respSaveClient.data.code === 200) {
		for (let index = 0; index < client_directions.value.length; index++) {
			const element = client_directions.value[index];
			console.log("element address", element);
			if (element.internalid === null) {
				const internalIdAddress = getRandomInt(5000000, 10000000);
				console.log("element", element);
				element.customerid = Number(customerId);
				element.internalid = Number(internalIdAddress);
				element.codigopostal = Number(element.codigopostal);
				const respSaveAddress = await customerStore.saveNewAddress(element);
				console.log("respSaveAddress", respSaveAddress);
			}else{
				element.codigopostal = Number(element.codigopostal);
				const respUpdateAddress = await customerStore.updateAddress(element.internalid, element);
				console.log("respUpdateAddress", respUpdateAddress);
			}
		}
		toast.open({
			message: "Cliente actualizado correctamente",
			type: 'success'
		})
	}else{
		toast.open({
			message: `Ocurrio un error al intentar actualizar los datos del cliente <br/> Error: ${respSaveClient.data.msg}`,
			type: 'error'
		})
	}
	load_info_save.value = false
	/* await customerStore.syncCustomers(); */
	txtBtnSbe.value = "Guardar"
	saveClient.value = false;
}

const handleAddNewAddress = () => {
	switch (buttonAddAddress.value) {
		case "Agregar":
			client_directions.value.push(formAddress.value);
			countryStore.country_list.forEach(country => {
				if(formAddress.value.paisid == country.id){
					formAddress.value.pais = country.name
					country.states.forEach(state => {
						if(formAddress.value.estadoid == state.id){
							formAddress.value.estado = state.name
						}
					})
				}
			});
			break;
		case "Actualizar":
			client_directions.value[indexUpdateAddress.value] = formAddress.value;
			break;
	}
	modalAddAddress.value = !modalAddAddress.value;
}

const handleUpdateAddress = (index) => {
	buttonAddAddress.value = "Actualizar";
	formAddress.value = client_directions.value[index];
	indexUpdateAddress.value = index;
	modalAddAddress.value = !modalAddAddress.value;
}

const handleSelectCountry = (event) => {
	try {
		let countryId = event.target.value
		console.log("countryId", countryId)
		if(countryId != 0){
			countryStore.country_list.forEach(country => {
				if(country.id == countryId){
					state_list.value = country.states
				}
			});
		}else if(countryId === 0){
			state_list.value = []
		}
	} catch (error) {
		console.error(error)
		state_list.value = []
	}
}
</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-full rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10">
			<div v-if="load_info">
				<Loader msg="Cargando información del cliente"/>
			</div>
			<div v-else-if="load_info_save">
				<Loader msg="Guardando información del cliente"/>
			</div>

			<div v-else-if="!load_info && !load_info_save">
				<div class="flex flex-wrap justify-between">
					<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center">Cliente numero
						{{ client_info[0].nsid }}</p>
					<div class="col-span-2 w-full md:w-auto">
						<button
							class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp"
							@click="handleUpdateClient(client_info[0].internalid)">
							{{ txtBtnSbe }}</button>
						<button @click="menuStore.handleClient('listClients')"
							class="bg-[#26245C] text-white w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
							Cancelar</button>
					</div>
				</div>
				<!-- Informacion principal -->
				<div class="w-full mt-5 bg-white border border-gray-200 shadow">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] bg-[#26245C]"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2">
							<p class="inline-block p-4">Información Principal</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
							<div class="w-full">
								<div class="flex flex-wrap -mx-3 mb-6">
									<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Nombre(s)
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].firstname">
									</div>
									<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Apellidos
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].lastname">
									</div>
									<div class="w-full md:w-1/3 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Cliente
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].companyname">
									</div>
								</div>
								<div class="flex flex-wrap -mx-3 mb-6">
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Email
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text"
											v-model="client_info[0].custentity_drt_send_email_invoice">
									</div>
									<div class="w-full md:w-1/2 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Teléfono
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].phone">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="w-full bg-white border border-gray-200 shadow">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] bg-[#26245C]"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2">
							<p class="inline-block p-4">Información de faturación</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
							<div class="w-full">
								<div class="flex flex-wrap -mx-3 mb-6">
									<div class="w-full md:w-1/3 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											R.F.C
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0]._drt_custom_rfc">
									</div>
									<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Régimen fiscal
										</label>
										<select
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											v-model="client_info[0]._drt_custom_regimen_fiscal">
											<option :value="regimen.nsid" v-for="regimen in regimenFiscal" :key="regimen">{{ regimen.name }}</option>
										</select>
									</div>
									<div class="w-full md:w-1/3 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Uso CFDI
										</label>
										<select
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											v-model="client_info[0]._drt_custom_uso_cfdi">
											<option :value="cfdi.nsid" v-for="cfdi in cfdiList" :key="cfdi">{{ cfdi.name }}</option>
										</select>
									</div>
								</div>
								<div class="flex flex-wrap -mx-3 mb-6">
									<div class="w-full md:w-1/2 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Forma de pago
										</label>
										<select
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											v-model="client_info[0].custentity_metodo_pago">
											<option value="0" selected>Seleccione uno...</option>
											<option :value="formpayment.nsid" v-for="formpayment in payments_forms.data" :key="formpayment">{{ formpayment.name }}</option>
										</select>
									</div>
									<div class="w-full md:w-1/2 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Metodo de pago
										</label>
										<select
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											v-model="client_info[0].custentity_forma_pago">
											<option value="0" selected>Seleccione uno...</option>
											<option :value="paymentterm.nsid" v-for="paymentterm in payments_terms.data" :key="paymentterm">{{ paymentterm.name }}</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="w-full bg-white border border-gray-200 shadow">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] bg-[#26245C]"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2">
							<p class="inline-block p-4">Información de crédito</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
							<div class="w-full">
								<div class="flex flex-wrap -mx-3 mb-6">
									<div class="w-full md:w-1/3 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Saldo
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].saldo" disabled>
									</div>
									<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Credito disponible
										</label>
										<p class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">{{ "$" + client_info[0].credito_disponible }}</p>
									</div>
									<div class="w-full md:w-1/3 px-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Limite de credito
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="client_info[0].limite_credito_rango" disabled>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Direcciones -->
				<div class="w-full mt-5 bg-white border border-gray-200 shadow">
					<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#26245C] bg-[#26245C]"
						id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
						<li class="me-2">
							<p class="inline-block p-4">Dirección</p>
						</li>
					</ul>
					<div id="defaultTabContent">
						<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
							<button @click="handleShowAddAddress"
								class="bg-[#26245C] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
								Agregar</button>
							<div class="flex flex-col overflow-x-auto">
								<div class="sm:-mx-6 lg:-mx-8">
									<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
										<div class="overflow-x-auto">
											<table class="min-w-full text-left text-sm font-light">
												<thead class="border-b font-medium text-center bg-slate-200">
													<tr>
														<th scope="col" class="px-5 py-4">Calle</th>
														<th scope="col" class="px-5 py-4">Número exterior</th>
														<th scope="col" class="px-5 py-4">Número interior</th>
														<th scope="col" class="px-5 py-4">Colonia</th>
														<th scope="col" class="px-5 py-4">Ciudad</th>
														<th scope="col" class="px-5 py-4">Municipio</th>
														<th scope="col" class="px-5 py-4">Estado</th>
														<th scope="col" class="px-5 py-4">Pais</th>
														<!-- <th scope="col" class="px-5 py-4">Editar</th> -->
													</tr>
												</thead>
												<tbody>
													<tr class="border-b text-center items-center"
														v-for="(direction, index) in client_directions" :key="index">
														<td class="whitespace-nowrap px-2 py-4">{{ direction.calle }}</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.numero_e }}
														</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.numero_i }}
														</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.colonia }}</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.ciudad }}</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.municipio }}
														</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.estado }}</td>
														<td class="whitespace-nowrap px-2 py-4">{{ direction.pais }}</td>
														<td class="whitespace-nowrap px-2 py-4 font-medium border-l-2">
															<div class="flex flex-col items-center hover:cursor-pointer"
																@click="handleUpdateAddress(index)">
																<svg xmlns="http://www.w3.org/2000/svg" width="16"
																	height="16" fill="currentColor"
																	class="bi bi-pencil-fill w-6 h-6" viewBox="0 0 16 16">
																	<path
																		d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
																</svg>
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
			</div>
		</div>
	</div>

	<!-- modal add address -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalAddAddress">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity"></div>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
					<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Agregar
									dirección</h3>

								<div class="flex flex-wrap -mx-3 mb-6 mt-5">
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Calle
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.calle">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Codigo postal
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.codigopostal">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Número exterior
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.numero_e">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Número interior
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.numero_i">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Colonia
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.colonia">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Ciudad
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.ciudad">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Municipio
										</label>
										<input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.municipio">
									</div>
									<div class="w-full md:w-1/2 px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Pais
										</label>
										<select @change="handleSelectCountry($event)" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" v-model="formAddress.paisid">
											<option value="0">Seleccione un país</option>
											<option :value="country.id" v-for="country in countryStore.country_list" :key="country.id">{{ country.name }}</option>
										</select>
										<!-- <input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.pais"> -->
									</div>
									<div class="w-full px-3 mb-6 md:mb-0 mt-3">
										<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
											for="grid-last-name">
											Estado
										</label>
										<!-- <input
											class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
											id="grid-last-name" type="text" v-model="formAddress.estado"> -->
										<select @change="handleSelectCountry($event)" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" v-model="formAddress.estadoid">
											<option value="0">Seleccione un estado</option>
											<option :value="state.id" v-for="state in state_list" :key="state.id">{{ state.name }}</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="inline-flex w-full justify-center rounded-md bg-[#26245C] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#292863] sm:ml-3 sm:w-auto"
							@click="handleAddNewAddress">{{ buttonAddAddress }}</button>
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleShowAddAddress">Cancelar</button>
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