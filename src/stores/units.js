import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import UnitsApi from '../apis/UnitsApi'

export const useUnitsStore = defineStore('units', () => {
	let unitsList = ref();

	//sync
	const syncUnits = async () => {
		try {
			const { data } = await UnitsApi.SyncUnits()
			console.log("data units", data.inserted_records)
			unitsList.value = data.inserted_records
			console.log("units sync", unitsList.value)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListUnits = async () => {
		try {
			const { data } = await UnitsApi.GetUnits()
			unitsList.value = data.data;
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		unitsList,
		syncUnits,
		getListUnits
	}
})
