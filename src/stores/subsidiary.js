import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import SubsidiaryApi from '../apis/SubsidiaryApi'

export const useSubsidiaryStore = defineStore('subsidiary', () => {

	const syncSubsidiary = async () => {
		try {
			const { data } = await SubsidiaryApi.SyncSubsidiary()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		syncSubsidiary
	}
})
