import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import CustomersApi from '../apis/CustomersApi'
import CfdiApi from '../apis/CfdiApi'

export const useCustomersStore = defineStore('customers', () => {
	let customersList = ref();
	let customerId = ref();

	//CUSTOMERS
	const syncCustomers = async () => {
		try {
			const { data } = await CustomersApi.SyncCustomers()
			customersList.value = data;
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getListCustomers = async () => {
		try {
			const { data } = await CustomersApi.GetCustomers()
			customersList.value = data.data;
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	const getCustomerWithId = async (customerId) => {
		try {
			const { data } = await CustomersApi.GetCustomersWithId(customerId)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getCustomerWithObj = async (body) => {
		try {
			const { data } = await CustomersApi.GetCustomersWithObj(body)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getCustomerDirections = async (customerId) => {
		try {
			const { data } = await CustomersApi.GetCustomersDirections(customerId)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const saveNewClient = async (body) => {
		try {
			const data = await CustomersApi.saveNewClientApi(body)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const updateClient = async (customerId, body) => {
		try {
			const data = await CustomersApi.updateClientApi(customerId, body)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	//DIRECTIONS
	const syncDirections = async () => {
		try {
			const { data } = await CustomersApi.SyncDirections()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const saveNewAddress = async (body) => {
		try {
			const data = await CustomersApi.saveNewAddresstApi(body)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const updateAddress = async (id, body) => {
		try {
			const data = await CustomersApi.updateAddressApi(id, body)
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const syncCfdiList = async () => {
		try {
			const { data } = await CfdiApi.SyncCfdi()
			return data;
		} catch (error) {
			console.log(error)
		}
	}

	const getCfdis = async () => {
		try {
			const { data } = await CfdiApi.GetCfdi()
			return data.data;
		} catch (error) {
			console.log(error)
		}
	}

	const paymentTermList = async () => {
		try {
			const { data } = await CustomersApi.PaymentTerm()
			return data;
		} catch (error) {
			console.log(error)
			return {
				"msg": error,
				"code": 500,
				"data": [],
				"status": "error"
			}
		}
	}

	const formPaymentList = async () => {
		try {
			const { data } = await CustomersApi.FormPayment()
			return data;
		} catch (error) {
			console.log(error)
			return {
				"msg": error,
				"code": 500,
				"data": [],
				"status": "error"
			}
		}
	}

	return {
		customersList,
		customerId,
		syncCustomers,
		getListCustomers,
		getCustomerWithId,
		getCustomerWithObj,
		getCustomerDirections,
		syncDirections,
		saveNewClient,
		saveNewAddress,
		updateAddress,
		updateClient,
		syncCfdiList,
		getCfdis,
		paymentTermList,
		formPaymentList
	}
})
