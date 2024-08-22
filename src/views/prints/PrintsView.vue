<script setup>
import { inject, onMounted, ref } from 'vue';

import moment from 'moment';
import { useSaleStore } from '../../stores/sale';
import seeTransactionInfo from './seeTransactionInfo.vue';
import { useMenuStore } from '../../stores/menu';
import { useItemsStore } from '../../stores/items';
import posLogo from '../../assets/pos_logo.png';
import { useLocationsStore } from '../../stores/locations';

//Components
import Loader from '../../components/Loader.vue';

//Variables
const locationsStore = useLocationsStore();
const showTicket = ref(false)
const menuStore = useMenuStore();
const toast = inject('toast')
const saleStore = useSaleStore()
const itemStore = useItemsStore()
const sales_list = ref([])
const estimate_list = ref([])
const filter_list = ref([])
const sale_ticket = ref({
	externalid:"00",
	trandate:"00-00-00",
	seller:"00",
	SaleArticles:{
		externalid:"00",
		quiantity:"00"
	},
	subtotalsale:0,
	taxSale:0,
	totalSale:0
})
const loader = ref(false)
const txtTransaction = ref("Ventas")
const formFilter = ref({
	selectOption:"sales",
	transaction:""
})
const sale_info = {}

//Methods
onMounted(async() => {
	loader.value = true
	showTicket.value = false;
	sales_list.value = await saleStore.getSales()
	estimate_list.value = await saleStore.getEstimates()
	filter_list.value = sales_list.value
	loader.value = false
})

const handleShowSaleTicket = (transactionId) => {
	loader.value = true
	filter_list.value.data.forEach(sale => {
		if(sale.internalid === transactionId){
			sale_ticket.value = sale
		}
	});
	let subtotal = 0
	let tax = 0
	let total = 0
	if(formFilter.value.selectOption === "sales"){
		if(sale_ticket.value.SaleArticles.length > 0){
			sale_ticket.value.SaleArticles.forEach(article => {
				subtotal += Number(article.total)
				tax += Number(article.total_tax)
			});
			total = Number(subtotal + tax)
			sale_ticket.value.SaleArticles.forEach(async(article) => {
                let article_obj = await itemStore.getItemInfo(article.id_item)
                article_obj = article_obj.data[0]
                console.log('article_obj? ', article_obj)
                let shop_unit_selected = {}
                if (article_obj.unitlist.length > 0) {
                    const units_list = article_obj.unitlist

                    units_list.forEach(unit => {
                        if (unit.nsid == article.units) {
                            shop_unit_selected = unit
                        }
                    });
                } else {
                    shop_unit_selected = {
                        nsname: article_obj.custitem_tipo_articulo
                    }
                }
                article.shop_units = shop_unit_selected
            })
		}
	}
	if(formFilter.value.selectOption === "estimates"){
		if(sale_ticket.value.EstimateArticles.length > 0){
			sale_ticket.value.EstimateArticles.forEach(article => {
				subtotal += Number(article.total)
				tax += Number(article.total_tax)
			});
			total = Number(subtotal + tax)
			sale_ticket.value.EstimateArticles.forEach(async(article) => {
				let article_obj = await itemStore.getItemInfo(article.id_item)
				article_obj = article_obj.data[0]
				console.log('article_obj? ', article_obj)
				let shop_unit_selected = {}
				if (article_obj.unitlist.length > 0) {
					const units_list = article_obj.unitlist

					units_list.forEach(unit => {
						if (unit.nsid == article.units) {
							shop_unit_selected = unit
						}
					});
				} else {
					shop_unit_selected = {
						nsname: article_obj.custitem_tipo_articulo
					}
				}
				article.shop_units = shop_unit_selected
			})
		}
	}
	sale_ticket.value.subtotalsale = subtotal
	sale_ticket.value.taxSale = tax
	sale_ticket.value.totalSale = total
	console.log("sale_ticket.value", sale_ticket.value)
	loader.value = false
	showTicket.value = !showTicket.value;
}

const handleCloseSaleTicket = () => {
	showTicket.value = !showTicket.value;
}

const filterSearch = async(option) =>{
	loader.value = true
	let filter_obj = []
	filter_list.value = []
	if(option === "search"){
		switch (formFilter.value.selectOption) {
			case "sales":
				if(formFilter.value.transaction === ""){
					filter_list.value = sales_list.value
				}else{
					sales_list.value.data.forEach(sale => {
						filter_list.value.data  = []
						if(sale.externalid === formFilter.value.transaction){
							filter_obj.push(sale)
						}
					});
					filter_list.value.data=filter_obj
				}
				txtTransaction.value = "Ventas"
				break;
			case "estimates":
				if(formFilter.value.transaction === ""){
					filter_list.value = estimate_list.value
				}else{
					estimate_list.value.data.forEach(estimate => {
						filter_list.value.data  = []
						if(estimate.externalid === formFilter.value.transaction){
							filter_obj.push(estimate)
						}
					});
					filter_list.value.data=filter_obj
				}
				txtTransaction.value = "Estimaciones"
				break;
		
			default:
				filter_list.value = sales_list.value
				break;
		}
	}else if(option === "clear"){
		filter_list.value = sales_list.value
		formFilter.value.selectOption = "sales"
		txtTransaction.value = "Ventas"
	}
	loader.value = false
}

const handlePrintTicket = async () => {
	//loader_sale.value = true;

	try {
		const prtHtml = document.getElementById('ticketsale').innerHTML;
		const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		let stylesHtml = '';
		for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
			stylesHtml += node.outerHTML;
		}
		WinPrint.document.write(`<!DOCTYPE html>
			<html>
			<head>
				${stylesHtml}
			</head>
			<body>
				${prtHtml}
			</body>
			</html>`);

		WinPrint.document.close();
		WinPrint.focus();
		WinPrint.print();

		handleCloseSaleTicket()

		toast.open({
			message: "Impresión realizada correctamente",
			type: 'success'
		})
	} catch (error) {
		toast.open({
			message: `Ocurrio un error al realizar la impresión. ERROR: ${error}`,
			type: 'error'
		})
	}

	//loader_sale.value = false;
}

const seeTransaction = async(saleobj) => {
	sale_info.value = saleobj
	loader.value = true
	showTicket.value = false

	switch (formFilter.value.selectOption) {
		case "sales":
			sale_info.value.SaleArticles.forEach(async (article) => {
				let article_obj = await itemStore.getItemInfo(article.id_item)
				article_obj = article_obj.data[0]
				let shop_unit_selected = {}
				let price_level_selected = {}
				if (article_obj.unitlist.length > 0) {
					const units_list = article_obj.unitlist

					units_list.forEach(unit => {
						if (unit.nsid == article.units) {
							shop_unit_selected = unit
						}
					});
					article.shop_units = shop_unit_selected
				}
				if (article_obj.PriceList.length > 0) {
					const price_list = article_obj.PriceList

					price_list.forEach(price => {
						if (article.pricelevel == -1) {
							price_level_selected = {
								pricelevel_name : "Personalizado"
							}
						}
						if (price.pricelevel_id == article.pricelevel) {
							price_level_selected = price
						}
					});
					article.price_level_selected = price_level_selected
				}
			});
				break;
			case "estimates":
				console.log("estimates", sale_info.value)
				sale_info.value.EstimateArticles.forEach(async (article) => {
					let article_obj = await itemStore.getItemInfo(article.id_item)
					article_obj = article_obj.data[0]
					let shop_unit_selected = {}
					let price_level_selected = {}
					if (article_obj.unitlist.length > 0) {
						const units_list = article_obj.unitlist

						units_list.forEach(unit => {
							if (unit.nsid == article.units) {
								shop_unit_selected = unit
							}
						});
						article.shop_units = shop_unit_selected
					}
					if (article_obj.PriceList.length > 0) {
						const price_list = article_obj.PriceList

						price_list.forEach(price => {
							if (article.pricelevel == -1) {
								price_level_selected = {
									pricelevel_name : "Personalizado"
								}
							}
							if (price.pricelevel_id == article.pricelevel) {
								price_level_selected = price
							}
						});
						article.price_level_selected = price_level_selected
					}
				});
				break;
	}
	console.log("saleinfo", sale_info.value)

	setTimeout(() => loader.value = false, 6000);
	setTimeout(() => menuStore.handlePrints('viewShowInfoPrint'), 6000);
}

const showInfo = () => {
	loader.value = false
	showTicket.value = false
	menuStore.handlePrints('viewShowInfoPrint')
}
</script>

<template>
	<div class="flex bg-[#468aa2] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] p-2 md:p-10 lg:p-10" v-if="loader">
			<Loader msg="Cargando información"/>
		</div>
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="!showTicket && !loader && menuStore.viewPrintsList">
			<p class="text-4xl md:text-3xl text-[#468aa2] font-semibold mb-5 text-center md:text-left">Impresiones</p>
			<div class="flex justify-between bg-[#F5F5F5] p-4 rounded-2xl shadowCard">
				<div class="flex flex-col w-full lg:flex-row items-center">
					<div class="fle flex-col mr-0 lg:mr-5 w-full lg:w-1/2">
						<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
							for="grid-last-name">
							Busqueda de transacción
						</label>
						<input v-model="formFilter.transaction" class="appearance-none block w-full bg-white text-gray-700 rounded-2xl py-2 px-2"
							id="grid-last-name" type="text">
					</div>
					<div class="fle flex-col w-full lg:w-1/2 mt-3 lg:mt-0">
						<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
							for="grid-last-name">
							Tipo
						</label>
						<select v-model="formFilter.selectOption" class="appearance-none block w-full bg-white text-gray-700 rounded-2xl py-2 px-2">
							<option value="sales">Ventas</option>
							<option value="estimates">Estimaciones</option>
						</select>
					</div>
					<button @click="filterSearch('search')" class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#468aa2] hover:bg-[#4689a2d5] focus:ring-4 focus:outline-none focus:ring-[#468aa2]">
						<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
					<button @click="filterSearch('clear')"
						class="p-2.5 ms-2 text-sm font-medium rounded-lg border text-white bg-[#468aa2] hover:bg-[#4689a2d5] focus:ring-4 focus:outline-none focus:ring-[#468aa2]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
							<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
							<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
						</svg>
						<span class="sr-only">Search</span>
					</button>
				</div>
			</div>


			<div class="shadow-md sm:rounded-lg mt-10">
				<!-- TABLA CLIENTES -->
				<div class="flex flex-col overflow-x-auto">
					<div class="sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
							<div class="overflow-x-auto">
								<table class="min-w-full text-left text-sm font-light">
									<thead class="border-b font-medium dark:border-neutral-500 text-center bg-slate-200">
										<tr>
											<th scope="col" class="px-5 py-4">Transacción</th>
											<th scope="col" class="px-5 py-4">Fecha</th>
											<th scope="col" class="px-5 py-4">Cliente</th>
											<th scope="col" class="px-5 py-4">Tipo de transacción</th>
											<th scope="col" class="px-5 py-4">Acciones</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b dark:border-neutral-500 text-center" v-for="sale in filter_list.data" :key="sale.internalid">
											<td class="whitespace-nowrap px-2 py-4">{{ sale.externalid }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ sale.trandate }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ sale.customer?.companyname != null ? sale.customer?.companyname : `${sale.customer?.firstname} ${sale.customer?.lastname}` }}</td>
											<td class="whitespace-nowrap px-2 py-4">{{ txtTransaction }}</td>
											<td class="whitespace-nowrap px-2 py-4 font-medium border-r-2 w-32">
												<div class="flex flex-wrap justify-center w-full">
													<button @click="seeTransaction(sale)"
														class="border-b-2 md:border-b-0 md:border-r-2 border-slate-600 p-2 hover:bg-slate-200 rounded">
														<img src="../../assets/img/svg/eye.svg" class="w-8 h-8" />
													</button>
													<button class="border-slate-600 p-2 hover:bg-slate-200 rounded"
														@click="handleShowSaleTicket(sale.internalid)">
														<img src="../../assets/img/svg/print.svg" class="w-8 h-8" />
													</button>
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

		<seeTransactionInfo :sale_info="sale_info" v-if="menuStore.viewShowInfoPrint && !showTicket && !loader"/>

		<!-- SHOW TICKET TRANSACTION -->
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="showTicket && !loader">
			<button class="bg-[#468aa2] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
				@click="handleCloseSaleTicket()">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
					class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
					<path
						d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</button>

			<div class="flex flex-col items-center mt-8" id="ticketsale">
				<!-- <div class="w-full md:w-1/2 lg:w-1/3 bg-white shadowCard p-4 items-center text-center"> -->
				<div class="w-full md:w-full lg:w-full bg-white shadowCard p-1 items-center text-center">
					<p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
					<!-- <p class="text-lg font-bold mt-5">Ticket de venta <br>{{ sale_ticket.externalid }}</p> -->
					<p class="text-lg font-bold mt-5" v-show="formFilter.selectOption == 'sales'">Ticket de venta <br>{{ sale_ticket.externalid }}</p>
					<p class="text-lg font-bold mt-5" v-show="formFilter.selectOption == 'estimates'">Ticket de cotización <br>{{ sale_ticket.externalid }}</p>
					<p class="text-sm mt-5">Fecha y Hora: <strong>{{ moment(sale_ticket.trandate).format('DD/MMM/YYYY HH:mm:ss') }}</strong></p>
            		<p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
					<p class="text-sm">Direccion: <strong class="font-bold">{{  }}</strong></p>
					<p class="text-sm">Telefono: <strong class="font-bold">{{  }}</strong></p>
					<p class="text-sm">Lo atendió: <strong class="font-bold">{{ `${sale_ticket.seller?.firstname} ${sale_ticket.seller?.lastname}` }}</strong></p>
					<p class="text-sm">Cliente: <strong class="font-bold">{{ sale_ticket.customer?.companyname != null ? sale_ticket.customer?.companyname : `${sale_ticket.customer?.firstname} ${sale_ticket.customer?.lastname}` }}</strong></p>
					<hr class="hrDotted mt-5 mb-5">
					<!-- <div class="" v-for="item in sale_ticket?.SaleArticles" :key="item" v-show="formFilter.selectOption == 'sales'">
						<p class="text-sm text-"><strong>{{ item.article?.displayname }}</strong> <br> {{ item.quiantity }} x ${{ item.rate }} =
							${{ item.total }}
						</p>
						<hr class="hrLine">
					</div> -->
				<div v-if="formFilter.selectOption == 'sales'">
					<div class="" v-for="item in sale_ticket?.SaleArticles" :key="item" v-show="formFilter.selectOption == 'sales'">
    					<div class="grid grid-cols-6">
        					<p class="text-[10px] text-center"><strong>Artículo</strong></p>
        					<p class="text-[10px] text-center"><strong>Unidad.</strong></p>
        					<p class="text-[10px] text-center"><strong>Cant.</strong></p>
							<p class="text-[10px] text-center"><strong>Entrega</strong></p>
        					<p class="text-[10px] text-center"><strong>Precio Unitario</strong></p>
        					<p class="text-[10px] text-center"><strong>SubTotal</strong></p>
        
        					<p class="text-[9.5px] text-center">{{ item.id_item }} <br> {{ item.article?.displayname }} <br> {{ item.article?.salesdescription }}</p>
        					<p class="text-[9.5px] text-center">{{ item.shop_units?.nsname }}</p>
        					<p class="text-[9.5px] text-center">{{ item.quiantity }}</p>
							<p class="text-[9.5px] text-center">Tienda</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.rate).toFixed(2) }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.total).toFixed(2) }}</p>
    					</div>
					</div>
				</div>
				
				<div v-else-if="formFilter.selectOption == 'estimates'">
					<div class="" v-for="item in sale_ticket?.EstimateArticles" :key="item" v-show="formFilter.selectOption == 'estimates'">
    					<div class="grid grid-cols-5">
        					<p class="text-[10px] text-center"><strong>Artículo</strong></p>
        					<p class="text-[10px] text-center"><strong>Unidad.</strong></p>
        					<p class="text-[10px] text-center"><strong>Cant.</strong></p>
        					<p class="text-[10px] text-center"><strong>Precio Unitario</strong></p>
        					<p class="text-[10px] text-center"><strong>SubTotal</strong></p>
        
        					<p class="text-[9.5px] text-center">{{ item.id_item }} <br> {{ item.article?.displayname }}</p>
        					<p class="text-[9.5px] text-center">{{ item.shop_units?.nsname }}</p>
        					<p class="text-[9.5px] text-center">{{ item.quiantity }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.rate).toFixed(2) }}</p>
        					<p class="text-[9.5px] text-center">${{ Number(item.total).toFixed(2) }}</p>
    					</div>
					</div>
					<!-- <div class="" v-for="item in sale_ticket?.EstimateArticles" :key="item" v-show="formFilter.selectOption == 'estimates'">
						<p class="text-sm text-"><strong>{{ item.article?.displayname }}</strong> <br> {{ item.quiantity }} x ${{ item.rate }} =
							${{ item.total }}
						</p>
						<hr class="hrLine">
					</div> -->
				</div>
					<hr class="hrDotted mt-5">
					<p class="text-sm mt-5"><strong>Subtotal:</strong> ${{ sale_ticket.sub_total_with_discount }}</p>
					<p class="text-sm"><strong>Impuestos:</strong> ${{ sale_ticket.tax }}</p>
					<p class="text-sm"><strong>Descuento(s):</strong> ${{ sale_ticket.discount_line + sale_ticket.discount_global + sale_ticket.discount_art_uni }}</p>
					<p class="text-sm"><strong>Total:</strong> ${{ sale_ticket.total }}</p>
					<p class="text-xs"><strong>IVA Incluido</strong></p>
					<p class="text-xs mt-5" v-show="formFilter.selectOption == 'sales'">Gracias por su compra <br> Este no es un comprobante Fiscal <br> Vuelva pronto</p>
					<p class="text-xs mt-5" v-show="formFilter.selectOption == 'estimates'">Las cotizaciones son al dia <br> Precios sujetos a cambio sin previo aviso <br> Favor de confirmar existencia antes de pagar. <br> Este no es un Comprobante Fiscal</p>
				
				</div>
			</div>
			<button class="bg-[#468aa2] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
				@click="handlePrintTicket()">
				Imprimir
			</button>
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

/* HTML: <div class="loader"></div> */
.loader {
	width: 190px;
	height: 24px;
	box-shadow: 0 5px 0 #468aa2;
	background: linear-gradient(#468aa2 0 0) 50%/3px 100% no-repeat;
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
	--c: #468aa2;
	clip-path: inset(0 0 0 50%);
}

@keyframes l3 {
	100% {
		background-position: calc(100%/3) 0
	}
}
</style>