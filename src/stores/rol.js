import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import RolApi from '../apis/RolApi'

export const useRolStore = defineStore('rol', () => {

	const syncRol = async () => {
		try {
			const { data } = await RolApi.SyncRol()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		syncRol
	}
})
