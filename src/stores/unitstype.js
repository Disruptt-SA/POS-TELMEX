import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import UnitsTypeApi from '../apis/UnitsTypeApi'

export const useUnitsTypeStore = defineStore('unitstype', () => {
	let unitsTypeList = ref();

	//sync
	const syncUnitsType = async () => {
		try {
			const { data } = await UnitsTypeApi.SyncUnitsType()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListUnitsType = async () => {
		try {
			const { data } = await UnitsTypeApi.GetUnitsType()
			unitsTypeList.value = data;
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		unitsTypeList,
		syncUnitsType,
		getListUnitsType
	}
})
