import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import EmployeesApi from '../apis/EmployeesApi'

export const useEmployeeStore = defineStore('employee', () => {
	const listEmployees = ref()

	const syncEmployees = async (formData) => {
		try {
			const { data } = await EmployeesApi.SyncEmployee()
			listEmployees.value = data
			await getEmployees()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getEmployees = async () => {
		try {
			const { data } = await EmployeesApi.GetEmployees()
			listEmployees.value = data
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	return {
		listEmployees,
		syncEmployees,
		getEmployees
	}
})
