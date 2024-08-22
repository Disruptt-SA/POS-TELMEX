<script setup>
import { onMounted, ref, toRaw } from 'vue'

const props = defineProps({msg:String})
const info_modal = props
console.log("modal", info_modal.msg)
</script>

<template>
	<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
		<div class="relative transform rounded-lg bg-white text-left transition-all sm:my-8 sm:w-full sm:max-w-lg">
			<div class="grid grid-cols-1 lg:grid-cols-1">
				<div class="bg-color-bunsi p-10">
					<div class="flex flex-col justify-center items-center">
						<!-- <img class="object-fill w-[100%] lg:w-[35%] md:w-[85%] sm:w-[100%] block" :src="logoDtt"> -->
						<div class="loader mt-5"></div>
						<p class="mt-2 uppercase text-xl text-[#26245C]">{{ info_modal.msg }}</p>
						<p class="text-xs text-[#26245C]">por favor espere...</p>
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
	background: radial-gradient(circle closest-side, var(--c, #00a0c6) 92%, #0000) 0 0/calc(100%/4) 100%;
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