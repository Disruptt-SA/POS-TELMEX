import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import SaleApi from '../apis/SaleApi'
import EstimateApi from '../apis/EstimateApi'

export const useSaleStore = defineStore('sales', () => {
	let sellerInfo = ref(0);
	let sellerName = ref("");
	let cashierInfo = ref(0);
	let cashierName = ref("");
	let objSales = ref([]);
	let objEstimates = ref([]);

	const createSale = async (sale) => {
		try {
			const { data } = await SaleApi.CreateSale(sale)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const createEstimate = async (sale) => {
		try {
			const { data } = await EstimateApi.CreateEstimate(sale)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const getSales = async () => {
		try {
			const { data } = await SaleApi.GetSales()
			objSales.value = data
			return data
		} catch (error) {
			console.log(error)
			return {
				code:404,
				msg: "Sin datos de ventas",
				error: error
			}
		}
	}

	const getEstimates = async () => {
		try {
			const { data } = await EstimateApi.GetEstimates()
			objEstimates.value = data
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const getSaleById = async (saleid) => {
		try {
			const { data } = await SaleApi.GetSalesById(saleid)
			return data.data
		} catch (error) {
			console.log(error)
		}
	}

	const createSalePayment = async (paymentObj) => {
		try {
			const { data } = await SaleApi.createPaymentsSale(paymentObj)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	return {
		sellerInfo,
		sellerName,
		cashierInfo,
		cashierName,
		objSales,
		objEstimates,
		createSale,
		createEstimate,
		getSales,
		getEstimates,
		getSaleById,
		createSalePayment
	}
})
