<script setup>
import { inject, onMounted, ref } from 'vue';
import { useMenuStore } from '../stores/menu';

//Components

//Variables
const menuStore = useMenuStore();
const rol_user = ref("")

//methods
onMounted(() => {
	const user_info = JSON.parse(localStorage.getItem("USER_INFO"))
	rol_user.value = user_info.cf_drt_custom_rol_id
})
</script>

<template>
	<!-- <Navbar /> -->
	<div class="flex bg-[#01a0c7] w-full min-h-screen justify-center p-4 pt-32 md:pt-24 lg:pt-32">
		<div class="bg-[#ffffff] w-[100%] justify-center rounded-3xl shadow-2xl">
			<p class="text-black font-bold text-xl lg:text-4xl md:text-3xl text-center mt-10">Bienvenido(a) al POS
				<strong class="text-[#01a0c7]">Auditorio Telmex</strong>,
				haz
				click en un
				modulo para empezar
			</p>
			<div class="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-10 p-8 lg:p-24 md:p-24">
				<!-- <div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 1 || rol_user === 101" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
					@click="menuStore.changeOptionSelected('clients')">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/clienteMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Clientes</p>
					</div>
				</div> -->
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 1 || rol_user === 104" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
					@click="menuStore.changeOptionSelected('sales')">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/ventasMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Ventas</p>
					</div>
				</div>
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 104" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/reportesMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Reportes</p>
					</div>
				</div>
				<div v-if="rol_user === 4 || rol_user === 104" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
					@click="menuStore.changeOptionSelected('config')">
					<div class="flex justify-center items-center h-32">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill w-10 h-10 mr-2 text-white" viewBox="0 0 16 16">
							<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
						</svg>
						<p class="text-2xl">Información general</p>
					</div>
				</div>
				<!-- <div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 1 || rol_user === 101" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
					@click="menuStore.changeOptionSelected('items')">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/articulosMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Articulos</p>
					</div>
				</div> -->
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 1 || rol_user === 101 || rol_user === 104" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32" @click="menuStore.changeOptionSelected('prints')">
						<img src="../assets/img/svg/impresionesMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Impresiones</p>
					</div>
				</div>
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 101 || rol_user === 104" @click="menuStore.changeOptionSelected('cashRegister')" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/cierrecajaMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Arqueo de caja</p>
					</div>
				</div>
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 101 || rol_user === 104" @click="menuStore.changeOptionSelected('closeCashBox')" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/cierreCaja.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Cierre de caja</p>
					</div>
				</div>
				<div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 101 || rol_user === 104" @click="menuStore.changeOptionSelected('cashWithdrawal')" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/retiroEfectivo.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Retiro de efectivo</p>
					</div>
				</div>
				<!-- <div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 1 || rol_user === 101 || rol_user === 102 || rol_user === 103" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
					@click="menuStore.changeOptionSelected('returns')">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/devolucionesMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Devoluciones</p>
					</div>
				</div> -->
				<!-- <div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 101" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]">
					<div class="flex justify-center items-center h-32" @click="menuStore.changeOptionSelected('orders')">
						<img src="../assets/img/svg/cajeroMenu.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Cajero</p>
					</div>
				</div> -->
				<!-- <div v-if="rol_user === 4 || rol_user === 3 || rol_user === 2 || rol_user === 101" class="bg-[#01a0c7] text-[#fff] rounded-xl shadowBtnMenu hover:cursor-pointer hover:bg-[#019fc79b]"
				@click="menuStore.changeOptionSelected('cxc')">
					<div class="flex justify-center items-center h-32">
						<img src="../assets/img/svg/cuentasCobrar.svg" class="w-18 h-18 mr-2" />
						<p class="text-2xl">Cuentas por cobrar</p>
					</div>
				</div> -->
			</div>
		</div>
	</div>
</template>

<style scoped>
.shadowBtnMenu {
	box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}
</style>