<script setup>
import { inject, onMounted, ref } from 'vue';
import { useMenuStore } from './stores/menu';
import { useLoginStore } from './stores/login';
import { useEmployeeStore } from './stores/employee';
import { useSubsidiaryStore } from './stores/subsidiary';
import { useRolStore } from './stores/rol';
import { useLocationsStore } from './stores/locations';
import { useCustomersStore } from './stores/customer';
import { useUnitsStore } from './stores/units';
import { useItemsStore } from './stores/items';
import { useInvoicesStore } from './stores/invoices';
import { useReturnsStore } from './stores/returns';
import { useCashStore } from './stores/cash';

import { usePromotionsStore } from './stores/promotions';

//images
import logoDtt from './assets/img/logo/logodtt.png';
import logoTlx from './assets/img/logo/telmex_logo.png';

//Components
import SyncLoader from './components/SyncLoader.vue';
import LoginView from './views/LoginView.vue';
import Navbar from './components/Navbar.vue';
import MenuView from './views/MenuView.vue';
import ClientsView from './views/clients/ClientsView.vue';
import ItemsView from './views/items/ItemsView.vue';
import NewSaleView from './views/sales/NewSaleView.vue';
import NewSaleTelmexView from './views/sales/NewSaleTelmexView.vue';
import ConfigView from './views/config/ConfigView.vue';
import PrintsView from './views/prints/PrintsView.vue';
import OrdersView from './views/orders/OrdersView.vue';
import ReturnsView from './views/returns/ReturnsView.vue';
import CloseCashView from './views/cashbox/CloseCash.vue';
import CashWithdrawal from './views/cashbox/cashWithdrawal.vue';
import CashRegister from './views/cashbox/CashRegister.vue';
import AccountsReceivableView from './views/accountsreceivable/AccountsReceivableView.vue';

//Variables
const openMenu = ref(false);
const sync = ref(true);
const syncText = ref("");
const menuStore = useMenuStore();
const loginStore = useLoginStore();
const subsidiaryStore = useSubsidiaryStore();
const locationsStore = useLocationsStore();
const rolStore = useRolStore();
const employeeStore = useEmployeeStore();
const customerStore = useCustomersStore();
const unitsStore = useUnitsStore();
const itemStore = useItemsStore();
const invoicesStore = useInvoicesStore();
const returnsStore = useReturnsStore();
const cashStore = useCashStore();
const promotionsStore = usePromotionsStore();

//methods
onMounted(async () => {
  sync.value = true;

  syncText.value = "Sincronizando Subsidiarias...";
  /* await subsidiaryStore.syncSubsidiary();
  syncText.value = "Sincronizando Ubicaciones...";
  const resSyncLocations = await locationsStore.syncLocations();
  syncText.value = "Sincronizando Roles...";
  const resSyncRol = await rolStore.syncRol(); */
  syncText.value = "Sincronizando Empleados...";
  const resSyncEmployees = await employeeStore.syncEmployees();
  syncText.value = "Sincronizando unidades de medida";
  const resSyncUnitsStore = await unitsStore.syncUnits();
  /* syncText.value = "Sincronizando Clientes...";
  const resSyncCustomer = await customerStore.syncCustomers();
  syncText.value = "Sincronizando Direcciones de clientes...";
  const resSyncCustomerDirections = await customerStore.syncDirections();
  syncText.value = "Sincronizando lista de cfdis";
  const resSyncCfdi = await customerStore.syncCfdiList();
 syncText.value = "Sincronizando lista de Articulos";
  const resSyncItem = await itemStore.syncItems();
  syncText.value = "Sincronizando lista de Articulos de tipo Kit";
  const resSyncKitItem = await itemStore.syncKitItems();
  syncText.value = "Sincronizando inventarios";
  const resSyncInventorys = await itemStore.syncInventorys();
  syncText.value = "Sincronizando lista de precios";
  const resSyncItemsPrices = await itemStore.syncItemsPrices();
 syncText.value = "Obteniendo lista de Articulos";
  const resGetItems = itemStore.getListItems(); */
  syncText.value = "Obteniendo lista de facturas";
  const resSyncInvoice = await invoicesStore.getInvoices();
  /* syncText.value = "Sincronizando lista de razones";
  const resSyncReasons = await returnsStore.syncReturns(); */
  syncText.value = "Obteniendo lista de razones";
  const resGetReasons = await returnsStore.getReturns();

  /* syncText.value = "Sincronizando promociones";
  const resSyncPromotions = await promotionsStore.syncPromotions();
  syncText.value = "Sincronizando Artículos de promociones";
  const resSyncArticlesPromotions = await promotionsStore.syncPromotions(); */

  if(localStorage.getItem("cashier_info") !== undefined && localStorage.getItem("cashier_info")){
    cashStore.resetCashierLocalStorage()
  }

  if(localStorage.getItem("withdrawals_info") !== undefined && localStorage.getItem("withdrawals_info")){
    localStorage.setItem("withdrawals_info", JSON.stringify([]))
  }

  if(localStorage.getItem("arqueo_cash") !== undefined && localStorage.getItem("arqueo_cash")){
    localStorage.setItem("arqueo_cash", JSON.stringify([]))
  }

  sync.value = false;
  syncText.value = "";
})

const handleOpenMenu = () => {
  openMenu.value = !openMenu.value;
}
</script>

<template>
  <div v-if="sync">
    <div class="grid grid-cols-1 lg:grid-cols-1 min-h-screen">
      <div class="bg-color-bunsi shadow-lg min-h-screen backgroundImage">
        <div class="flex flex-col min-h-screen justify-center items-center px-10 lg:px-10 md:px-24">
          <img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block" :src="logoDtlogoTlxt">
          <p class="text:[15px] lg:text-xl md:text-2xl text-[#26245C] text-center font-extralight mb-10">
            V.Alpha 1.0.0.231130
          </p>
          <div class="loader mt-5"></div>
          <p class="mt-2 uppercase text-4xl text-[#26245C]">{{ syncText }}</p>
          <p class="text-xl text-[#26245C]">por favor espere</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div v-if="loginStore.loginView">
      <LoginView />
    </div>
    <div v-else-if="!loginStore.loginView">
      <div v-show="menuStore.openMenu">
        <Navbar :menuOpen="openMenu" @handleOpenMenu="handleOpenMenu" />
        <MenuView />
      </div>
      <div v-show="!menuStore.openMenu">
        <Navbar :menuOpen="openMenu" @handleOpenMenu="handleOpenMenu" />
        <div v-if="menuStore.optionSelected === 'sales'">
          <NewSaleTelmexView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'clients'">
          <ClientsView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'items'">
          <ItemsView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'config'">
          <ConfigView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'prints'">
          <PrintsView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'orders'">
          <OrdersView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'returns'">
          <ReturnsView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'closeCashBox'">
          <CloseCashView />
        </div>
        <div v-else-if="menuStore.optionSelected === 'cashWithdrawal'">
          <CashWithdrawal />
        </div>
        <div v-else-if="menuStore.optionSelected === 'cashRegister'">
          <CashRegister />
        </div>
        <div v-else-if="menuStore.optionSelected === 'cxc'">
          <AccountsReceivableView />
        </div>
      </div>
    </div>
  </div>
</template>