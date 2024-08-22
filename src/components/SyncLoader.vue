<script setup>
//images
import logoDtt from '../assets/img/logo/logodtt.png';
</script>

<template>
	<div class="grid grid-cols-1 lg:grid-cols-1 min-h-screen">
		<div class="bg-color-bunsi shadow-lg min-h-screen backgroundImage">
			<div class="flex flex-col min-h-screen justify-center items-center px-10 lg:px-10 md:px-24">
				<img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block" :src="logoDtt">
				<p class="text:[15px] lg:text-md md:text-xl text-[#26245C] text-center font-extralight mb-10">
					V.Alpha 1.0.0.231130
				</p>
				<div class="loader mt-5"></div>
				<p class="mt-2 uppercase text-xl text-[#26245C]">Sincronizando...</p>
				<p class="text-xs text-[#26245C]">por favor espere</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
	width: 190px;
	height: 24px;
	box-shadow: 0 5px 0 #26245C;
	background: linear-gradient(#26245C 0 0) 50%/3px 100% no-repeat;
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
	--c: #26245C;
	clip-path: inset(0 0 0 50%);
}

@keyframes l3 {
	100% {
		background-position: calc(100%/3) 0
	}
}
</style>