import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import CashierApi from '../apis/CashierApi'

export const useCashStore = defineStore('cash', () => {
  const cash = ref({
	mount_open:0,
	open_date: Date.now(),
	total_cash_sales:0,
	total_vouch_sales:0,
	monto_fuera_rango: 0,
	monto_dentro_rango: 0
  })

  const openCash = (amount, fuera_rango, dentro_rango) => {
	cash.value.mount_open = amount
	cash.value.monto_fuera_rango = 100
	// cash.value.monto_fuera_rango = fuera_rango
	cash.value.monto_dentro_rango = 100
	// cash.value.monto_dentro_rango = dentro_rango
	localStorage.setItem("cashier_info", JSON.stringify(cash.value))
  }

  const getCashLocalStorage = () => {
	return JSON.parse(localStorage.cashier_info)
  }

  const resetCashierLocalStorage = () => {
	localStorage.setItem("cashier_info", JSON.stringify({
		mount_open:0,
		open_date: Date.now(),
		total_cash_sales:0,
		total_vouch_sales:0,
		monto_fuera_rango: 100,
		monto_dentro_rango: 100
	}))
	localStorage.setItem("arqueo_cash", JSON.stringify([]))
	localStorage.setItem("withdrawals_info", JSON.stringify([]))
  }

  const closeCashier = async(body) => {
	try {
		const data = await CashierApi.CloseCashier(body)
		return data;
	} catch (error) {
		console.log(error)
	}
  }

  return {
    cash,
	openCash,
	getCashLocalStorage,
	resetCashierLocalStorage,
	closeCashier
  }
})
