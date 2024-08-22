<script setup>
import { onMounted, ref, inject } from 'vue';
import { useMenuStore } from '../../stores/menu';
import OpenReturnView from './OpenReturnView.vue';
import OpenReturnViewStatus from './ReturnsStatus.vue';
import OpenReturnStatusView from './OpenReturnStatusView.vue';
import { useInvoicesStore } from '../../stores/invoices';
import moment from 'moment';

//components
import Loader from '../../components/Loader.vue';

//Variables
const toast = inject('toast')
const menuStore = useMenuStore()
const invoicesStore = useInvoicesStore()
const invoices_list = ref([])
const searchText = ref("")
const loader_returns = ref(false)
const user_info = ref({})

//methods
onMounted(async() => {
	loader_returns.value = true
	invoices_list.value = invoicesStore.objInvoices
	console.log("invoices_list antes", invoices_list.value)
	//invoices_sums()
	user_info.value = JSON.parse(localStorage.USER_INFO);
	console.log("invoices_list", invoices_list.value)
	loader_returns.value = false
})

const includesSomeWordsItemsfilter = (original, buscadas) => {
	return buscadas.split(' ').every(p => original.includes(p))
}

const invoices_sums = () => {
	if (invoices_list.value.length > 0) {
		invoices_list.value.forEach(invoice => {
			let tax = 0
			let total = 0
			invoice.articles.forEach(article => {
				tax += Number(article.total_tax)
				total += Number(article.total)
			});
			invoice.total_invoice = (Number(total) + Number(tax)).toFixed(2)
		});
	}
}

const searchInvoices = () => {
	let newObj = []
	let companyName = ""
	invoices_list.value = invoicesStore.objInvoices

	if (searchText.value.length <= 0) {
		invoices_list.value = invoicesStore.objInvoices
	} else {
		invoicesStore.objInvoices.filter(obj => {
			let verified = false
			if (includesSomeWordsItemsfilter(obj.origin_sale.externalid.toLowerCase(), searchText.value.toLowerCase())) {
				verified = includesSomeWordsItemsfilter(obj.origin_sale.externalid.toLowerCase(), searchText.value.toLowerCase())
			} else {
				if(obj.customer.companyname == null){
					verified = includesSomeWordsItemsfilter(obj.customer.firstname.toLowerCase() + " " + obj.customer.lastname.toLowerCase(), searchText.value.toLowerCase())
				}else{
					verified = includesSomeWordsItemsfilter(obj.customer.companyname.toLowerCase(), searchText.value.toLowerCase())
				}
			}
			if (verified) {
				newObj.push(obj);
			} else {
				companyName = searchText.value
			}
		});

		if (newObj.length === 0) {
			//itemsStore.inventoryItemsList = await itemsStore.inventoryItemsList
			invoices_list.value = []
			toast.open({
				message: `No se encontraron facturas a nombre de ${companyName}`,
				type: 'warning'
			})
		} else {
			//itemsStore.inventoryItemsList = newObj
			invoices_list.value = newObj;
		}
	}

	console.log("invoices_list filter", invoices_list.value)
}

const refreshFilter = () => {
	loader_returns.value = true
	invoices_list.value = invoicesStore.objInvoices
	searchText.value = ""
	loader_returns.value = false
}

const openReturn = (objInvoice) => {
	invoicesStore.obj_invoice_choice = objInvoice
	menuStore.handleReturn('viewReturn')
}

</script>

<template>
	<div class="flex bg-[#26245C] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24" v-if="menuStore.listReturns">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader_returns">
			<Loader msg="Cargando información"/>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-if="!loader_returns">
			<div class="flex flex-col md:flex-row">
				<p class="text-4xl md:text-3xl text-[#26245C] font-semibold text-center w-full md:w-auto">Devoluciones
				</p>
				<div class="col-span-2" v-if="user_info.cf_drt_custom_rol_id == 3 || user_info.cf_drt_custom_rol_id == 4">
					<button @click="menuStore.handleReturn('viewReturnStatus')"
						class="bg-[#26245C] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">Gestionar
						Solicitud</button>
				</div>
			</div>

			<div class="flex flex-col md:flex-row w-full mt-5">
				<div class="bg-[#F5F5F5] text-[#26245C] w-full p-10 rounded-3xl shadow-xl mb-5 md:mb-3 mr-0 md:mr-2">
					<div class="w-full">
						<label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
							Ingrese el id de la venta o nombre del cliente para realizar la busqueda de devolución
						</label>
						<div class="flex items-center">
							<label for="simple-search" class="sr-only">Buscar</label>
							<div class="relative w-full">
								<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
									<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
											stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
									</svg>
								</div>
								<input type="text" id="simple-search"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="Buscar factura por id de la venta o nombre del cliente..."
									v-model="searchText" />
							</div>
							<button @click="searchInvoices()"
								class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
								<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
									viewBox="0 0 20 20">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
										stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
								</svg>
								<span class="sr-only">Search</span>
							</button>
							<button @click="refreshFilter()"
								class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#fab33c] hover:bg-[#fbc05e] focus:ring-4 focus:outline-none focus:ring-[#fab33c]">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
									class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
									<path fill-rule="evenodd"
										d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
									<path
										d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
								</svg>
								<span class="sr-only">Search</span>
							</button>
						</div>
					</div>
				</div>
				<div class="bg-[#F5F5F5] text-[#26245C] w-full p-10 rounded-3xl shadow-xl mb-5 md:md-3 ml-0 md:ml-2">
					<div class="flex flex-col items-center justify-center">
						<!-- <div class="flex items-center h-5">
							<input id="helper-radio" aria-describedby="helper-radio-text" type="radio" value=""
								class="w-8 h-8 text-[#26245C] bg-[#fff] border-gray-300 focus:ring-blue-500 focus:ring-2">
						</div> -->
						<div class="flex flex-wrap w-full text-sm bg-white p-5 rounded-3xl shadow-lg cursor-pointer text-[#26245C] hover:bg-[#26245C] hover:text-white mb-3"
							@click="openReturn(invoice)" v-for="invoice in invoices_list" :key="invoice">
							<p class="font-medium text-xl mr-3">{{ invoice.customer?.companyname ?
								invoice.customer?.companyname : invoice.customer?.firstname + " " +
								invoice.customer?.lastname }}</p>
							<p class="text-xs font-normal">Factura electronica {{ invoice.origin_sale.externalid }}
								<br> {{ moment(invoice.trandate).format('DD/MMM/YYYY') }} / <strong
									class="font-black">${{ invoice?.total_invoice }}</strong>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<OpenReturnView v-else-if="menuStore.viewReturn" />
	<OpenReturnViewStatus v-else-if="menuStore.viewReturnStatus" />
	<OpenReturnStatusView v-else-if="menuStore.viewOpenReturnStatus" />
</template>