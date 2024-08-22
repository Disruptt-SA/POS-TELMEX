<script setup>
import { inject, onMounted, ref } from 'vue';
import { useMenuStore } from '../stores/menu';

//Components
import Navbar from '../components/Navbar.vue';
import MenuView from './MenuView.vue';
import ClientsView from './clients/ClientsView.vue';
import ItemsView from './items/ItemsView.vue';
import NewSaleView from './sales/NewSaleView.vue';
import ConfigView from './config/ConfigView.vue';
import ReturnsView from './returns/ReturnsView.vue';

//Variables
const openMenu = ref(false);
const menuStore = useMenuStore();

//methods
const handleOpenMenu = () => {
	openMenu.value = !openMenu.value;
}
</script>

<template>
	<div v-show="menuStore.openMenu">
		<Navbar :menuOpen="openMenu" @handleOpenMenu="handleOpenMenu" />
		<MenuView />
	</div>
	<div v-show="!menuStore.openMenu">
		<Navbar :menuOpen="openMenu" @handleOpenMenu="handleOpenMenu" />
		<div v-if="menuStore.optionSelected === 'sales'">
			<NewSaleView />
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
		<div v-else-if="menuStore.optionSelected === 'returns'">
			<ReturnsView />
		</div>
	</div>
</template>