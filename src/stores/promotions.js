import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import PromotionsApi from '../apis/PromotionApi'

export const usePromotionsStore = defineStore('promotions', () => {
	const syncPromotions = async () => {
		try {
			const { data } = await PromotionsApi.syncPromotions()
			return true;
		} catch (error) {
			console.log(error)
		}
	}

	const syncArticlesPromotions = async () => {
		try {
			const { data } = await PromotionsApi.syncArticlesPromotions()
			return true;
		} catch (error) {
			console.log(error)
		}
	}

	const getPromotions = async () => {
		try {
			const { data } = await PromotionsApi.getPromotions()
			return data
		} catch (error) {
			console.log("Error al obtener las promociones", error)
		}
	}

	const applyPromotion = async (body) => {
		try {
			const { data } = await PromotionsApi.applyPromotion(body)
			return data
		} catch (error) {
			console.log("Error al obtener las promociones", error)
			return error.response.data
		}
	}

	return {
		syncPromotions,
		syncArticlesPromotions,
		getPromotions,
		applyPromotion
	}
})
