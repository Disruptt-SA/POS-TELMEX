import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import CountryApi from '../apis/CountryApi'

export const useCountryStore = defineStore('countrys', () => {
	const country_list = ref([]);

	const syncCountrys = async () => {
		try {
			const { data } = await CountryApi.SyncCountry()
			if(data.code === 200){
				return data.data;
			}
			return []
		} catch (error) {
			console.log(error)
		}
	}

	const getCountrys = async () => {
		try {
			const { data } = await CountryApi.GetCountry()
			if(data.code === 200){
				country_list.value = data.data;
				return data.data
			}
			return []
		} catch (error) {
			console.log(error)
		}
	}

	return {
		country_list,
		syncCountrys,
		getCountrys
	}
})
