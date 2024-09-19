<script setup>
import { inject, onMounted, ref } from 'vue';

//stores
import { useMenuStore } from '../stores/menu';
import { useLocationsStore } from '../stores/locations';
import { useItemsStore } from '../stores/items';
import { useSaleStore } from '../stores/sale';
import { useEmployeeStore } from '../stores/employee';
import { useCashStore } from '../stores/cash';
import { useLoginStore } from '../stores/login';
import { useSubsidiaryStore } from '../stores/subsidiary';
import { useRolStore } from '../stores/rol';
import { useCustomersStore } from '../stores/customer';
import { useUnitsStore } from '../stores/units';
import { useInvoicesStore } from '../stores/invoices';
import { useReturnsStore } from '../stores/returns';

//Variables
const user_info = ref({});
const toast = inject('toast')
const props = defineProps({
	menuOpen: Boolean
})
const menuStore = useMenuStore();
const locationsStore = useLocationsStore();
const itemsStore = useItemsStore();
const saleStore = useSaleStore();
const employeeStore = useEmployeeStore();
const loginStore = useLoginStore();
const subsidiaryStore = useSubsidiaryStore();
const rolStore = useRolStore();
const customerStore = useCustomersStore();
const unitsStore = useUnitsStore();
const itemStore = useItemsStore();
const invoicesStore = useInvoicesStore();
const returnsStore = useReturnsStore();

const locations_list = ref([]);
const employees_list = ref([]);
const openMobileNavbar = ref(false);
const today_date = ref(new Date().toLocaleDateString());
const cashier_id = ref(0)
const seller_id = ref(0)
const location_name = ref("");
const loader_items = ref(false);
const sync_data = ref(false)
const syncText = ref("")
const modalConfimationClose = ref(false)
const cashStore = useCashStore();

//Methods
onMounted(async () => {
	loader_items.value = true
	user_info.value = JSON.parse(localStorage.USER_INFO);
	await locationsStore.getLocations();
	//await itemsStore.getListInventoryItems(user_info.value.location_id);
	locations_list.value = locationsStore.locations;
	employees_list.value = await employeeStore.getEmployees()
	console.log("employees", employees_list.value)

	if(user_info.value.cf_drt_custom_rol_id == 2){
		cashier_id.value = user_info.value.internalid
	}

	locations_list.value.forEach(location => {
		if(location.internalid == user_info.value.location_id){
			location_name.value = location.name
			locationsStore.location_user = location.name
		}
	});
	loader_items.value = false
})

const openNavbar = () => {
	openMobileNavbar.value = !openMobileNavbar.value;
}

const emit = defineEmits(['handleOpenMenu'])

const handleChangeInventory = async (event) => {
	const store_id = event.target.value
	await locationsStore.setLocation(store_id)
	await itemsStore.getListInventoryItems(store_id)
}

const handleChangeSeller = (event) => {
	const employee = event.target.value
	seller_id.value =  employee
	saleStore.sellerInfo = employee
	for (let employee_obj of employees_list.value.data) {
		if (employee_obj.internalid == employee) {
			saleStore.sellerName = employee_obj.firstname + " " + employee_obj.lastname
		}
	}
}

const handleChangeCashier = (event) => {
	const employee = event.target.value
	cashier_id.value =  employee
	saleStore.cashierInfo = employee
	for (let employee_obj of employees_list.value.data) {
		if (employee_obj.internalid == employee) {
			saleStore.cashierName = employee_obj.firstname + " " + employee_obj.lastname
		}
	}
}

const handleCloseSesion = () => {
	handleModalConfimationClose()
}

const handleModalConfimationClose = () => {
	modalConfimationClose.value = !modalConfimationClose.value
}

const closeSesion = () => {
	const cash_cashier = JSON.parse(localStorage.cashier_info)

	if(Object.keys(cash_cashier).length > 0){
		if(cash_cashier.mount_open > 0){
			toast.open({
				message: `No se ha realizado el cierre de caja, por favor haga el conteo de efectivo y vouchers para cerrar sesión`,
				type: 'warning'
			})
			handleModalConfimationClose()
		}else{
			cashStore.resetCashierLocalStorage()
			localStorage.setItem("withdrawals_info", JSON.stringify([]))
			localStorage.setItem("USER_INFO", JSON.stringify([]))
			handleModalConfimationClose()
			location.reload();
		}
	}
}

const syncData = async() => {
	sync_data.value = true
	syncText.value = "Sincronizando Subsidiarias...";
	const resSyncSubsidiary = await subsidiaryStore.syncSubsidiary();
	syncText.value = "Sincronizando Ubicaciones...";
	const resSyncLocations = await locationsStore.syncLocations();
	syncText.value = "Sincronizando Roles...";
	const resSyncRol = await rolStore.syncRol();
	syncText.value = "Sincronizando Empleados...";
	const resSyncEmployees = await employeeStore.syncEmployees();
	syncText.value = "Sincronizando Clientes...";
	const resSyncCustomer = await customerStore.syncCustomers();
	syncText.value = "Sincronizando Direcciones de clientes...";
	const resSyncCustomerDirections = await customerStore.syncDirections();
	syncText.value = "Sincronizando unidades de medida";
	const resSyncUnitsStore = await unitsStore.syncUnits();
	syncText.value = "Sincronizando lista de cfdis";
	const resSyncCfdi = await customerStore.syncCfdiList();
	syncText.value = "Sincronizando lista de Articulos";
	const resSyncItem = await itemStore.syncItems();
	syncText.value = "Sincronizando inventarios";
	const resSyncInventorys = await itemStore.syncInventorys();
	syncText.value = "Sincronizando lista de precios";
	const resSyncItemsPrices = await itemStore.syncItemsPrices();
	/*  syncText.value = "Obteniendo lista de Articulos";
	const resGetItems = itemStore.getListItems(); */
	syncText.value = "Obteniendo lista de facturas";
	const resSyncInvoice = await invoicesStore.getInvoices();
	syncText.value = "Sincronizando lista de razones";
	const resSyncReasons = await returnsStore.syncReturns();
	syncText.value = "Obteniendo lista de razones";
	const resGetReasons = await returnsStore.getReturns();
	sync_data.value = false
}
</script>

<template>
	<nav class="border-gray-200 bg-gray-50 top-0 z-40 flex-no-wrap fixed w-full p-4 h-36 md:h-auto md:pt-2 lg:h-auto lg:pt-2">
		<div class="w-full flex flex-wrap items-center justify-between p-2">
			<div class="flex items-center space-x-3 rtl:space-x-reverse">
				<button class="text-[#01a0c7] flex hover:bg-black rounded-full p-2" @click="menuStore.handleMenu()">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
						class="bi bi-list w-12 h-12" viewBox="0 0 16 16">
						<path fill-rule="evenodd"
							d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
					</svg>
				</button>
				<img src="../assets/img/logo/telmex_logo.png" class="h-10 hidden lg:block" alt="DisrupTT Logo" />
				<div class="flex items-center bg-transparent lg:bg-transparent rounded-xl p-2"
					v-show="menuStore.optionSelected === 'sales' && !menuStore.openMenu && !loader_items">
					<label class="text-black font-bold mr-2 text-lg">Vendedor</label>
					<select @change="handleChangeSeller($event)"
						class="focus:outline-none focus:ring focus:ring-transparent bg-white rounded-xl text-xl sm:w-[200px] md:w-[250px] lg:w-[250px]" v-model="seller_id">
						<option value="0" selected>Seleccione...</option>
						<option :value="employee.internalid" v-for="employee in employees_list.data" :key="employee">{{
							employee.firstname }} {{ employee.lastname }}</option>
					</select>
				</div>
				<div class="flex items-center bg-transparent lg:bg-slate-400 rounded-xl p-2"
					v-show="menuStore.optionSelected === 'orders' && !menuStore.openMenu && !loader_items || menuStore.optionSelected === 'cxc' && !menuStore.openMenu && !loader_items">
					<label class="text-black font-bold mr-2 text-lg">Cajero</label>
					<select @change="handleChangeCashier($event)" class="focus:outline-none focus:ring focus:ring-transparent bg-white rounded-xl text-xl w-[250px]" v-model="cashier_id" :disabled="user_info.cf_drt_custom_rol_id == 2">
						<option value="0" selected>Seleccione...</option>
						<option :value="employee.internalid" v-for="employee in employeeStore.listEmployees.data" :key="employee">{{
							employee.firstname }} {{ employee.lastname }}</option>
					</select>
				</div>
			</div>
			<button data-collapse-toggle="navbar-solid-bg" type="button"
				class="inline-flex items-center p-2 w-40 h-12 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
				aria-controls="navbar-solid-bg" aria-expanded="false" @click="openNavbar()">
				<span class="sr-only">Open main menu</span>
				<p>Información General</p>
				<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M1 1h15M1 7h15M1 13h15" />
				</svg>
			</button>
			<div class="w-full md:block md:w-auto" id="navbar-solid-bg" :class="{ 'hidden': !openMobileNavbar }">
				<ul v-if="loader_items" class="flex flex-col items-center font-medium mt-4 rounded-lg bg-gray-50 md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent p-8 md:p-0">
					<li class="flex items-center">
						<div role="status">
							<svg aria-hidden="true" class="w-12 h-12 text-black animate-spin fill-[#fab33c]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
								<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
							</svg>
							<span class="sr-only">Cargando...</span>
						</div>
					</li>
				</ul>
				<ul v-else-if="sync_data" class="flex flex-col items-center font-medium mt-4 rounded-lg bg-gray-50 md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent p-8 md:p-0">
					<li class="flex items-center">
						<div role="status">
							<svg aria-hidden="true" class="w-12 h-12 text-black animate-spin fill-[#fab33c]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
								<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
							</svg>
							<p>{{ syncText }}</p>
						</div>
					</li>
				</ul>
				<ul v-else class="flex flex-col items-center font-medium mt-4 rounded-lg bg-gray-50 md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent p-8 md:p-0">
					<!-- <li class="flex items-center">
						<svg @click="syncData()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat w-8 h-8" viewBox="0 0 16 16">
							<path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
							<path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
						</svg>
					</li> -->
					<li class="flex items-center">
						<img src="../assets/img/svg/calendarioNavbar.svg" class="mr-2 w-8" />
						<p class="block py-2 px-3 md:p-0 text-black rounded text-sm font-extrabold" aria-current="page">
							Fecha
							<br>
							{{ today_date }}
						</p>
					</li>
					<li class="flex items-center mt-5 md:mt-0">
						<img src="../assets/img/svg/locationNavbar.svg" class="mr-2 w-8" />
						<p class="text-black text-sm font-extrabold" aria-current="page">
							Modulo
							<br>
							<!-- <select
								class="border-0 bg-transparent pl-0 focus:outline-none focus:ring focus:ring-transparent pt-0 pb-0"
								@change="handleChangeInventory($event)" disabled>
								<option :value="locations.internalid" v-for="locations in locations_list"
									:key="locations.internalid">{{ locations.name }}</option>
							</select> -->
							{{ location_name }}
						</p>
					</li>
					<li class="flex items-center mt-5 md:mt-0">
						<img src="../assets/img/svg/userNavbar.svg" class="mr-2 w-8" />
						<p class="block py-2 px-3 md:p-0 text-black rounded text-sm font-extrabold" aria-current="page">
							{{ `${user_info.firstname} ${user_info.lastname}` }}
							<br>
							{{ user_info.rol?.name }}
						</p>
					</li>
					<li class="flex items-center mt-5 md:mt-0 hover:cursor-pointer" @click="handleCloseSesion()">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right w-12 h-12 text-black" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
							<path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
						</svg>
						<p class="block py-2 px-3 md:p-0 text-black rounded text-sm font-extrabold ml-2" aria-current="page">Cerrar <br> sesión</p>
					</li>
				</ul>
			</div>
		</div>
	</nav>

	<!-- modal confirmation -->
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="modalConfimationClose">
		<div class="fixed inset-0 bg-[#26245C] bg-opacity-75 transition-opacity" @click="handleModalConfimationClose()"></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
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
								<p class="text-xl font-semibold mt-5 mb-5">
									¿Desea cerrar sesión?
								</p>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button type="button"
							class="mt-3 ml-2 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold bg-[#01a0c7] text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#019fc7c8] sm:mt-0 sm:w-auto"
							@click="closeSesion()">Aceptar</button>
						<button type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							@click="handleModalConfimationClose()">Cancelar</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>