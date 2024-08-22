import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import InvoicesApi from '../apis/InvoicesApi'

export const useInvoicesStore = defineStore('invoices', () => {
	let obj_invoice_choice = ref({})
	let objInvoices = ref([])

	const getInvoices = async () => {
		try {
			const { data } = await InvoicesApi.GetInvoices()
			objInvoices.value = data.data
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const timbrarInvoice = async (invoiceId) => {
		let info = {}
		try {
			const { data } = await InvoicesApi.TimbrarInvoice(invoiceId)
			info = data
			return info
		} catch (error) {
			// console.log(error)
			console.log(error.response.data)
			info = {
				"msg": `${error.response.data.msg}`,
				"code": 500,
				"status": "error"
			}
			return info
		}

	}

	const getInvoiceDueCustomer = async (customerId) => {
		try {
			const { data } = await InvoicesApi.GetInvoiceDueCustomer(customerId)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	const createCreditPayments = async(objDues) => {
		try {
			const { data } = await InvoicesApi.CreateCreditPayments(objDues)
			return data
		} catch (error) {
			console.log(error)
		}
	}

	return {
		obj_invoice_choice,
		objInvoices,
		getInvoices,
		timbrarInvoice,
		getInvoiceDueCustomer,
		createCreditPayments
	}
})
