<script setup>
import { onMounted, ref, inject } from 'vue';;
import { useLoginStore } from '../stores/login';
import { useCashStore } from '../stores/cash';


//images
import logoDtt from '../assets/img/logo/logodtt.png';
import logoTlx from '../assets/img/logo/telmex_logo.png';

//Components

//Variables
const toast = inject('toast')
const form_data = ref({});
const loginStore = useLoginStore();
const cashStore = useCashStore();

//Methods
onMounted(()=> {
	const user_info = JSON.parse(localStorage.getItem("USER_INFO"))
	console.log("user_info", user_info == null)

	let today = new Date()
	let date_cashier = new Date()
	let cashier_info = null
	let date_cashier_str = ""
	let today_str = today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear()

	if(localStorage.getItem("cashier_info") != null){
		cashier_info = JSON.parse(localStorage.cashier_info)
		date_cashier = new Date(cashier_info.open_date)
		date_cashier_str = date_cashier.getDate() + "/" + date_cashier.getMonth() + "/" + date_cashier.getFullYear()
	}
	console.log("today_str", today_str)
	console.log("date_cashier_str", date_cashier_str)
	if(today_str != date_cashier_str){
		console.log("si es diferente de tiempo")
		cashStore.resetCashierLocalStorage()
		localStorage.setItem("withdrawals_info", JSON.stringify([]))
		localStorage.setItem("USER_INFO", JSON.stringify([]))
	}
})

const handleLogin = async () => {
	try {
		const data = form_data.value
		const msg = await loginStore.handleLogin(data)

		toast.open({
			message: msg.msg,
			type: 'warning'
		})
	} catch (error) {
		/* toast.open({
			message: "Error al iniciar sesión, usuario o contraseñas inexistentes",
			type: 'error'
		}) */
	}
}
</script>

<template>
	<div class="grid grid-cols-1 lg:grid-cols-1 min-h-screen">
		<div class="bg-color-bunsi shadow-lg min-h-screen backgroundImage">
			<div v-if="syncData" class="flex flex-col min-h-screen justify-center items-center">
				<span class="loader"></span>
				<p class="text-4xl mt-5">prueba</p>
				<p class="text-xl mt-2">prueba</p>
			</div>
			<div v-else class="flex flex-col min-h-screen justify-center items-center px-10 lg:px-10 md:px-24">
				<img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block mb-3" :src="logoTlx">
				<p class="text:[15px] lg:text-md md:text-2xl text-black text-center font-extralight mb-10">
					V.Beta 1.0.0.240814
				</p>
				<form class="w-full lg:w-1/3 md:w1/3" @submit.prevent="handleLogin()">
					<div class="relative mb-3 w-[100%]">
						<div>
							<label for="user" class="block mb-2 text-3xl font-medium text-black">Nombre de Usuario</label>
							<input type="text" id="user" v-model="form_data.user"
								class="bg-gray-50 border lg:h-[70px] md:h-[50px] sm:h-[50px] border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
								placeholder="Nombre Apellido" required>
						</div>
					</div>
					<div class="relative mb-3 w-[100%]">
						<div>
							<label for="password" class="block mb-2 text-3xl font-medium text-black">Contraseña</label>
							<input type="password" id="password" v-model="form_data.password"
								class="bg-gray-50 border lg:h-[70px] md:h-[50px] sm:h-[50px] border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
								required>
						</div>
					</div>
					<div class="flex flex-col md:flex-row justify-center items-center mt-10">
						<Button
							class="md:mr-5 w-full lg:h-[70px] md:h-[50px] sm:h-[50px] px-10 py-3 rounded-3xl btn-shadow bg-[#468aa2] text-white font-bold hover:bg-[#4689a2d2] hover:text-neutral-50 text-xl"
							color="sky" size="xl" type="submit">
							<svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin"
								viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="loader_login">
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="#E5E7EB" />
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentColor" />
							</svg>
							Iniciar Sesión</Button>
						<!-- <p class="text-gray-500 dark:text-gray-400 mt-5 md:mt-0"><button
								class="inline-flex items-center font-medium text-blue-800 dark:text-blue-700 hover:underline">
								syn users
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
									class="bi bi-people-fill ml-2" viewBox="0 0 16 16">
									<path
										d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
								</svg>
							</button></p> -->
					</div>
				</form>
			</div>
		</div>
	</div>
</template>