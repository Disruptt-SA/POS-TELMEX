import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import LocationsApi from '../apis/LocationsApi'

export const useLocationsStore = defineStore('locations', () => {
	const location_id = ref();
	const locations = ref({});
	const location_user = ref("");
	const location_phone =ref("")

	const setLocation = (id) => {
		location_id.value = id
	}

	const syncLocations = async () => {
		try {
			const { data } = await LocationsApi.SyncLocations()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getLocations = async () => {
		try {
			const { data } = await LocationsApi.GetLocations()
			locations.value = data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		location_id,
		locations,
		location_user,
		location_phone,
		setLocation,
		syncLocations,
		getLocations
	}
})
