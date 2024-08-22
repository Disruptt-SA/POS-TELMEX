import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ReturnsApi from '../apis/ReturnsApi'

export const useReturnsStore = defineStore('returns', () => {
	let objReturns = ref([])
	let objReturnChoice = ref([])

	const syncReturns = async () => {
		try {
			const { data } = await ReturnsApi.SyncReasons()
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const getReturns = async () => {
		try {
			const { data } = await ReturnsApi.GetReasons()
			objReturns.value = data.data
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const createRMA = async (obj_return) => {
		try {
			const { data } = await ReturnsApi.createRMA(obj_return)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const getRmas = async () => {
		try {
			const { data } = await ReturnsApi.GetRmas()
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const updateRmaItemReceipt = async (idRma) => {
		try {
			const { data } = await ReturnsApi.UpdateRmaItemReceipt(idRma)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const updateRmaStatus = async (idRma, obj_return) => {
		try {
			const { data } = await ReturnsApi.UpdateRmaStatus(idRma, obj_return)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const createCreditMemo = async (rmaId) => {
		try {
			const { data } = await ReturnsApi.createCreditMemo(rmaId)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const timbrarRma = async(ncId) => {
		try {
			const { data } = await ReturnsApi.TimbrarRMA(ncId)
			return data
		} catch (error) {
			console.log(error)
		}
	}
	// const timbrarRma = async(invoiceId) => {
	// 	try {
	// 		const { data } = await ReturnsApi.TimbrarRMA(invoiceId)
	// 		return data
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }

	const getRmaById = async(rmaId) => {
		try {
			const { data } = await ReturnsApi.getRmaById(rmaId)
			return data
		} catch (error) {
			console.error(error)
		}
	}

	return {
		objReturns,
		objReturnChoice,
		syncReturns,
		getReturns,
		createRMA,
		getRmas,
		updateRmaItemReceipt,
		updateRmaStatus,
		createCreditMemo,
		timbrarRma,
		getRmaById
	}
})
