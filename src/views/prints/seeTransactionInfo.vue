<script setup>
import { inject, onMounted, ref, isProxy, toRaw } from 'vue'
import moment from 'moment';
import { useSaleStore } from '../../stores/sale'
import { useItemsStore } from '../../stores/items';
import { useMenuStore } from '../../stores/menu';
import { useLocationsStore } from '../../stores/locations';
import posLogo from '../../assets/pos_logo.png';

const props = defineProps(['sale_info', 'showInfo'])
const menuStore = useMenuStore();
const sale_info = {...props.sale_info}
const subtotal = ref(0)
const taxes = ref(0)
const discounts = ref(0)
const total = ref(0)
const showTicket = ref(false)
const saleData = ref({});
const itemStore = useItemsStore()
const transactionType = ref("SL")
const cantidadItems = ref(0)
const locationsStore = useLocationsStore();

onMounted(async() => {
    sale_info.value = toRaw(sale_info.value)



    if(sale_info.value.externalid.substr(0, 2) != "ES"){
        subtotal.value = sale_info.value.sub_total_with_discount
        taxes.value = sale_info.value.tax
        discounts.value = (sale_info.value.discount_art_uni + sale_info.value.discount_global + sale_info.value.discount_line).toFixed(2)
        total.value = sale_info.value.total
        cantidadItems.value = sale_info.value.total_quantity_items

        await sale_info.value.SaleArticles.forEach(async(article) => {
            article.total = (Number(article.rate) * Number(article.quiantity))
        });
        transactionType.value = "SL"
    }else{
        await sale_info.value.EstimateArticles.forEach(article => {
            subtotal.value += Number(article.total)
            taxes.value += Number(article.total_tax)
            discounts.value += Number(article.discount)
            total.value += (Number(article.total) + Number(article.total_tax)) - Number(article.discount)
            cantidadItems.value += Number(article.quiantity)
            article.total = (Number(article.rate) * Number(article.quiantity))
        });
        transactionType.value = "ES"
    }

    console.log("raw sale_info", sale_info.value)
})

const handleCancelCharge = () => {
    showTicket.value = !showTicket.value
}

const handleShowTicket = async (sale_data) => {
    showTicket.value = !showTicket.value
    console.log('sale data? ', sale_data)
    try {
        saleData.value = sale_data

        if(transactionType.value == "SL"){
            saleData.value.SaleArticles.forEach(async(article) => {
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
        }else{
            saleData.value.EstimateArticles.forEach(async(article) => {
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

        console.log('data actualizada? ', saleData.value)
    } catch (error) {
        console.error("Error", error)
        saleData.value = []
    }
}

const handlePrintTicket = () => {
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
}

const handleCancelShow = () => {
    try {
        console.log("entro")
        menuStore.handlePrints('viewPrintsList')
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
	<!-- SHOW TRANSACTION INFORMATION -->
<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="!showTicket">
    <div class="lg:grid lg:grid-cols-4">
        <div class="w-full px-2 bg-white rounded-lg lg:col-span-3">
            <ul class="flex flex-wrap text-sm font-medium text-center text-white rounded-t-lg bg-[#468aa2] w-80"
                id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
                <li class="me-2 w-full">
                    <p class="inline-block p-4 text-center text-lg font-bold">{{ sale_info.value?.externalid }}</p>
                </li>
            </ul>
            <div id="defaultTabContent">
                <!-- TABLA Busqueda de Artículos -->
                <div class="flex flex-col overflow-x-auto bg-white">
                    <div class="sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-0 sm:px-6 lg:px-8">
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-left text-sm font-light">
                                    <thead
                                        class="border border-black font-medium text-center bg-[#D9D9D9] text-black">
                                        <tr>
                                            <th scope="col" class="px-5 py-4"></th>
                                            <th scope="col" class="px-5 py-4">Artículo</th>
                                            <th scope="col" class="px-5 py-4">Cod Artículo</th>
                                            <th scope="col" class="px-5 py-4">Und Medida</th>
                                            <th scope="col" class="px-5 py-4">Lista de Precio</th>
                                            <th scope="col" class="px-5 py-4">Precio</th>
                                            <!-- <th scope="col" class="px-5 py-4">Stock</th> -->
                                            <th scope="col" class="px-5 py-4">Cantidad</th>
                                            <th scope="col" class="px-5 py-4">Entrega</th>
                                            <th scope="col" class="px-5 py-4">Fecha de Entrega</th>
                                            <th scope="col" class="px-5 py-4 border-l-2 border-slate-500">Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="transactionType == 'SL'">
                                        <tr class="border border-black dark:border-neutral-500 text-center"
                                            v-for="item in sale_info.value?.SaleArticles" :key="item">
                                            <td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
                                                <div class="flex flex-wrap justify-center">
                                                </div>
                                            </td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ item.article.displayname }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ item.article.upccode }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ item.shop_units?.nsname }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ item.price_level_selected?.pricelevel_name }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">${{ Number(item.rate).toFixed(2) }}</td>
                                            <!-- <td class="whitespace-nowrap px-2 py-4">X Disponible</td> -->
                                            <td class="whitespace-nowrap px-2 py-4">{{ item.quiantity }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">
                                                <select
                                                    class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                    v-model="item.delivery_type" disabled>
                                                    <option value="1">Tienda</option>
                                                    <option value="2">Domicilio</option>
                                                    <option value="3">Recoge</option>
                                                </select>
                                            </td>
                                            <td class="whitespace-nowrap px-2 py-4">
                                                <p class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">{{ moment(item.delivery_date).utc().format('DD/MMM/YYYY') }}</p>
                                            </td>
                                            <td
                                                class="whitespace-nowrap px-2 py-4 border-l-2 border-slate-500 text-lg">
                                                ${{ Number(item?.total).toFixed(2) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr class="border border-black dark:border-neutral-500 text-center"
                                            v-for="estimate in sale_info.value.EstimateArticles" :key="estimate">
                                            <td class="whitespace-nowrap px-2 py-4 font-medium border-r-2">
                                                <div class="flex flex-wrap justify-center">
                                                </div>
                                            </td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ estimate.article.displayname }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ estimate.article.upccode }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ estimate.shop_units?.nsname }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">{{ estimate.price_level_selected?.pricelevel_name }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">${{ Number(estimate.rate).toFixed(2) }}</td>
                                            <!-- <td class="whitespace-nowrap px-2 py-4">X Disponible</td> -->
                                            <td class="whitespace-nowrap px-2 py-4">{{ estimate.quiantity }}</td>
                                            <td class="whitespace-nowrap px-2 py-4">
                                                <select
                                                    class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                    v-model="estimate.delivery_type" disabled>
                                                    <option value="1">Tienda</option>
                                                    <option value="2">Domicilio</option>
                                                    <option value="3">Recoge</option>
                                                </select>
                                            </td>
                                            <td class="whitespace-nowrap px-2 py-4">
                                                <p class="appearance-none block w-full text-xs bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">{{ moment(estimate.delivery_date).utc().format('DD/MMM/YYYY') }}</p>
                                            </td>
                                            <td
                                                class="whitespace-nowrap px-2 py-4 border-l-2 border-slate-500 text-lg">
                                                ${{ Number(estimate.total).toFixed(2) }}
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
        <div class="w-full px-2 rounded-lg lg:col-span-1 mt-5 lg:mt-0 infoSale lg:right-9 bg-white pb-2">
            <div class="flex flex-wrap rounded-lg mb-2">
                <div class="w-full">
                    <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
                        Fecha
                    </label>
                    <p class="appearance-none block w-full p-2 text-center font-semibold text-lg bg-gray-50 text-gray-700 border border-gray-300 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 shadow-sl">{{ moment(sale_info.value?.trandate).utc().format('DD/MMM/YYYY') }}</p>
                </div>
            </div>
            <div class="bg-[#468aa2] text-white flex flex-wrap p-3 rounded-lg mb-2">
                <div class="w-full">
                    <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-last-name">
                        información del cliente
                    </label>
                    <div class="flex flex-row">
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 disabled:bg-gray-400 disabled:border-gray-400 text-center content-center"> 
                            {{ sale_info.value?.customer.companyname ? sale_info.value?.customer.companyname : sale_info.value?.customer.firstname + " " + sale_info.value?.customer.lastname }}
                        </p>
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 disabled:bg-gray-400 disabled:border-gray-400 text-center content-center"> 
                            {{ sale_info.value?.customer.credito_disponible > 0 ? 'Credito' : 'Contado' }}
                        </p>
                    </div>
                    <div>
                        <p class="">Saldo disponible</p>
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 pl-2 mb-2 disabled:bg-gray-400 disabled:border-gray-400"> 
                            ${{ sale_info.value?.customer.credito_disponible }}
                        </p>
                    </div>
                    <div class="mb-2">
                        <p class="">Saldo pendiente</p>
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 pl-2 mb-2 disabled:bg-gray-400 disabled:border-gray-400"> 
                            ${{ sale_info.value?.customer.saldo_disponible }}
                        </p>
                    </div>
                    <!-- <div class="mb-2">
                        <p class="">Dirección envio</p>
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 pl-2 mb-2 disabled:bg-gray-400 disabled:border-gray-400"> 
                            ${{ sale_info.value.customer.saldo_disponible }}
                        </p>
                    </div>
                    <div class="mb-2">
                        <p class="">Dirección facturación</p>
                        <p class="appearance-none block w-full text-xl bg-gray-200 text-gray-700 border border-gray-200 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 pl-2 mb-2 disabled:bg-gray-400 disabled:border-gray-400"> 
                            ${{ sale_info.value.customer.saldo_disponible }}
                        </p>
                    </div> -->
                    <!-- <p class="mt-2">Metodo pago SAT</p>
                    <p class="mt-2">Forma pago SAT</p> -->
                </div>
            </div>
            <div class="flex flex-wrap p-3 rounded-lg mb-2 shadow-sl">
                <div class="w-full">
                    <label class="block uppercase tracking-wide text-2xl font-bold mb-2 text-[#000000]"
                        for="grid-last-name">
                        Resumen
                    </label>
                    <p class="text-lg text-[#000000] font-thin">Cantidad de Artículos</p>
                    <p class="text-md font-semibold mb-2">{{ cantidadItems }}</p>
                    <p class="text-lg text-[#000000] font-thin">Subtotal</p>
                    <p class="text-md font-semibold mb-2">${{ Number(subtotal).toFixed(2) }}</p>
                    <p class="text-lg text-[#000000] font-thin">Impuestos</p>
                    <p class="text-md font-semibold mb-2">${{ Number(taxes).toFixed(2) }}</p>
                    <p class="text-lg text-[#000000] font-thin">Descuentos</p>
                    <p class="text-md font-semibold mb-2">${{ discounts }}</p>
                    <hr class="w-full h-1 mx-auto bg-gray-100 border-0 rounded my-4">
                    <p class="text-2xl text-[#000000] font-bold">Total</p>
                    <p class="text-md font-semibold">${{ Number(total).toFixed(2) }}</p>
                </div>
            </div>
            <div class="flex flex-row">
                <button
                    class="bg-[#7f7f7e] text-[#fff] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5"
                    @click="handleCancelShow()">Volver</button>
                <button
                    class="bg-[#468aa2] text-[#fff] text-2xl w-full mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5"
                    @click="handleShowTicket(sale_info.value)">
                    Imprimir</button>
            </div>
        </div>
    </div>
</div>

<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10" v-show="showTicket">
    <button class="bg-[#000000] p-1 float-right md:mt-[-20px] md:mr-[-20px] rounded-full"
        @click="handleShowTicket(sale_info.value)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-x text-white font-bold w-6 h-6" viewBox="0 0 16 16">
            <path
                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
    </button>

    <div class="flex flex-col items-center mt-8" id="ticketsale">
        <div class="w-full md:w-1/2 lg:w-1/3 bg-white shadowCard p-4 items-center text-center">
            <p class="text-2xl font-bold mb-2 text-center"><img :src="posLogo" alt="POS Logo" class="h-24 mx-auto"/></p>
            <p class="text-lg font-bold mt-5" v-show="transactionType == 'SL'">Ticket de venta <br> {{ sale_info.value?.externalid }}</p>
            <p class="text-lg font-bold mt-5" v-show="transactionType == 'ES'">Ticket de cotización <br> {{ sale_info.value?.externalid }}</p>
            <p class="text-sm mt-5">Fecha y Hora: <strong class="font-bold">{{ moment(sale_info.value?.trandate).format('DD/MMM/YYYY HH:mm:ss') }}</strong></p>
            <p class="text-sm">Sucursal: <strong class="font-bold">{{ locationsStore.location_user }}</strong></p>
            <p class="text-sm">Lo atendió: <strong class="font-bold">{{ sale_info.value.seller?.firstname ? sale_info.value.seller?.firstname : "" + " " + sale_info.value.seller?.lastname ? sale_info.value.seller?.lastname : "" }}</strong></p>
            <p class="text-sm">Cliente: <strong class="font-bold">{{ sale_info.value.customer?.companyname ? sale_info.value.customer?.companyname : sale_info.value.customer?.firstname + " " + sale_info.value.customer?.lastname }}</strong></p>
            <hr class="hrDotted mt-5 mb-5">
            <p class="text-md font-bold mt-5">Articulos</p>
            <!-- <div class="" v-for="item in sale_info.value.SaleArticles" :key="item">
                <p class="text-sm text-"><strong>{{ item.id_item }}</strong> <br> {{ item.quiantity }} x ${{ item.units }} = ${{ item.lineTotal }} <strong>IVA Incl</strong></p>
                <hr class="hrLine">
            </div> -->
            <div v-if="transactionType == 'SL'">
                <div class="" v-for="item in saleData.SaleArticles" :key="item">
                <!-- <div class="" v-for="item in sale_info.value.SaleArticles" :key="item"> -->
                    <div class="grid grid-cols-5">
						<p class="text-[10.5px] text-center"><strong>Artículo</strong></p>
						<p class="text-[10.5px] text-center"><strong>Unidad</strong></p>
						<p class="text-[10.5px] text-center"><strong>Cant.</strong></p>
						<p class="text-[10.5px] text-center"><strong>Precio Unitario</strong></p>
						<p class="text-[10.5px] text-center"><strong>SubTotal</strong></p>
                    </div>
                    <div class="grid grid-cols-5 mb-2">
                        <p class="text-[11px] text-center">{{ item.id_item }} <br> {{ item.article?.displayname }}</p>
                        <p class="text-[11px]">{{ item.shop_units?.nsname }}</p>
                        <p class="text-[11px] text-center">{{ item.quiantity }}</p>
                        <p class="text-[11px] text-center">${{ Number(item.rate).toFixed(2) }}</p>
                        <p class="text-[11px] text-center">${{ Number(item.total).toFixed(2) }}</p>
                    </div>
                </div>
            </div>
            <div v-else-if="transactionType == 'ES'">
                <div class="" v-for="estimate in saleData.EstimateArticles" :key="estimate">
                <!-- <div class="" v-for="item in sale_info.value.SaleArticles" :key="item"> -->
                    <div class="grid grid-cols-5">
                        <p class="text-sm text-center"><strong>Artículo</strong></p>
                        <p class="text-sm text-center"><strong>Unidad</strong></p>
                        <p class="text-sm text-center"><strong>Cantidad</strong></p>
                        <p class="text-sm text-center"><strong>Precio Unitario</strong></p>
                        <p class="text-sm text-center"><strong>SubTotal</strong></p>
                    </div>
                    <div class="grid grid-cols-5 mb-2">
                        <p class="text-[11px] text-center">{{ estimate.id_item }} <br> {{ estimate.article?.displayname }} </p>
                        <p class="text-[11px]">{{ estimate.shop_units?.nsname }}</p>
                        <p class="text-[11px] text-center">{{ estimate.quiantity }}</p>
                        <p class="text-[11px] text-center">${{ Number(estimate.rate).toFixed(2) }}</p>
                        <p class="text-[11px] text-center">${{ Number(estimate.total).toFixed(2) }}</p>
                    </div>
                </div>
            </div>
            <!-- <p class="text-md font-bold mt-5" v-show="transactionType == 'SL'">Metodos de pago</p>
            <div class="" v-for="payment in sale_info.value?.SaleMethods" :key="payment" v-show="transactionType == 'SL'">
                <p class="text-sm text-" v-if="payment.method_pay == 1"><strong>Tarjeta credito</strong> <br> ${{ payment.amount_pay }}</p>
                <p class="text-sm text-" v-if="payment.method_pay == 2"><strong>Tarjeta debito</strong> <br> ${{ payment.amount_pay }}</p>
                <p class="text-sm text-" v-if="payment.method_pay == 3"><strong>Efectivo</strong> <br> ${{ payment.amount_pay }}</p>
                <p class="text-sm text-" v-if="payment.method_pay == 4"><strong>Saldo a favor del cliente</strong> <br> ${{ payment.amount_pay }}</p>
                <p class="text-sm text-" v-if="payment.method_pay == 5"><strong>Crédito del cliente</strong> <br> ${{ payment.amount_pay }}</p>
                <p class="text-sm text-" v-if="payment.method_pay == 6"><strong>Transferencia</strong> <br> ${{ payment.amount_pay }}</p>
            </div> -->
            <hr class="hrDotted mt-5">
            <p class="text-sm mt-5">Total: <strong>${{ Number(total).toFixed(2) }}</strong></p>
            <!-- <p class="text-sm"><strong>Cambio:</strong> ${{ (formMethodPayment.change).toFixed(2) }}</p> -->
            <p class="text-xs"><strong>IVA Incluido</strong></p>
            <!-- <p class="text-xs" v-show="transactionType == 'SL'"><strong>Pagado</strong></p> -->
            <p class="text-xs mt-5" v-show="transactionType == 'SL'">Gracias por su compra <br> Este no es un comprobante Fiscal <br> Vuelva pronto</p>
            <p class="text-xs mt-5" v-show="transactionType == 'ES'">Las cotizaciones son al dia <br> Precios sujetos a cambio sin previo aviso <br> Favor de confirmar existencia antes de pagar. <br> Este no es un Comprobante Fiscal</p>
        </div>
    </div>
    <button class="bg-[#468aa2] px-14 py-4 rounded-full mt-5 float-right w-full md:w-auto"
        @click="handlePrintTicket()">
        Imprimir
    </button>
</div>

</template>

<style scoped>
.shadow-inp {
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.shadow-sl {
	box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
}

.infoSale {
	zoom: 100%;

	@media (min-width: 411px) {
		zoom: 100%;
	}

	@media (min-width: 500px) {
		zoom: 70%;
	}

	@media (min-width: 720px) {
		zoom: 80%;
	}

	@media (min-width: 1000px) {
		zoom: 60%;
	}

	@media (min-width: 1300px) {
		zoom: 65%;
	}

	@media (min-width: 1700px) {
		zoom: 80%;
	}
}

/* HTML: <div class="loader"></div> */
.loader {
	width: 190px;
	height: 24px;
	box-shadow: 0 5px 0 #000000;
	background: linear-gradient(#000000 0 0) 50%/3px 100% no-repeat;
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
	--c: #000000;
	clip-path: inset(0 0 0 50%);
}

@keyframes l3 {
	100% {
		background-position: calc(100%/3) 0
	}
}
</style>