import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  const openMenu = ref(true)
  const optionSelected = ref('')
  const user_info = {}

  //ClientView
  const listClient = ref(false)
  const newClient = ref(false)
  const updateClient = ref(false)
  //ItemsView
  const listItem = ref(false)
  const newItem = ref(false)
  const openItem = ref(false)
  //prints
  const printsView = ref(false)
  const viewPrintsList = ref(true)
  const viewShowInfoPrint = ref(false)
  //ReturnsView
  const listReturns = ref(false)
  const viewReturn = ref(false)
  const viewReturnStatus = ref(false)
  const viewOpenReturnStatus = ref(false)
  //CashBox
  const viewCloseCasBox = ref(false)
  const viewCashRegister = ref(false)
  const viewCashWithdrawal = ref(false)

  const handleMenu = () => {
    openMenu.value = !openMenu.value

    //Clients
    listClient.value = true
    newClient.value = false
    updateClient.value = false

    //Items
    listItem.value = true
    newItem.value = false
    openItem.value = false

    //returns
    listReturns.value = false
    viewReturn.value = false
    viewReturnStatus.value = false
    viewOpenReturnStatus.value = false
  }

  const changeOptionSelected = (option) => {
      if(option === "returns"){
        //Returns
        user_info.value = JSON.parse(localStorage.USER_INFO)
        if(user_info.value.cf_drt_custom_rol_id === 102){
          listReturns.value = true
          viewReturn.value = false
          viewReturnStatus.value = false
          viewOpenReturnStatus.value = false
        }else if(user_info.value.cf_drt_custom_rol_id === 103){
          listReturns.value = false
          viewReturn.value = false
          viewReturnStatus.value = true
          viewOpenReturnStatus.value = false
        }else if(user_info.value.cf_drt_custom_rol_id === 3 || user_info.value.cf_drt_custom_rol_id === 4){
          listReturns.value = true
          viewReturn.value = false
          viewReturnStatus.value = false
          viewOpenReturnStatus.value = false
        }
      }

    optionSelected.value = option
    openMenu.value = false
  }

  //Methods CashBox
  const handleCashBox = (option) => {
    if (option === 'viewCloseCasBox') {
      viewCloseCasBox.value = true
      viewCashRegister.value = false
      viewCashWithdrawal.value = false
    }
    if (option === 'viewCashRegister') {
      viewCloseCasBox.value = false
      viewCashRegister.value = true
      viewCashWithdrawal.value = false
    }
    if (option === 'viewCashWithdrawal') {
      viewCloseCasBox.value = false
      viewCashRegister.value = false
      viewCashWithdrawal.value = true
    }
  }

  //Methods viewPrints
  const handlePrints = (option) => {
    if (option === 'viewPrintsList') {
      viewPrintsList.value = true
      viewShowInfoPrint.value = false
    }
    if (option === 'viewShowInfoPrint') {
      viewPrintsList.value = false
      viewShowInfoPrint.value = true
    }
  }

  //Methods ClientView
  const handleClient = (option) => {
    if (option === 'listClients') {
      listClient.value = true
      newClient.value = false
      updateClient.value = false
    }
    if (option === 'newClients') {
      listClient.value = false
      newClient.value = true
      updateClient.value = false
    }
    if (option === 'updateClient') {
      listClient.value = false
      newClient.value = false
      updateClient.value = true
    }
  }

  //Methods ItemsView
  const handleItems = (option) => {
    console.log("option", option)
    if (option === 'listItems') {
      listItem.value = true
      newItem.value = false
      openItem.value = false
    }
    if (option === 'newItems') {
      listItem.value = false
      newItem.value = true
      openItem.value = false
    }
    if (option === 'viewItem') {
      listItem.value = false
      newItem.value = false
      openItem.value = true
    }
  }

  //Methods ReturnsView
  const handleReturn = (option) => {
    if (option === 'listReturn') {
      listReturns.value = true
      viewReturn.value = false
      viewReturnStatus.value = false
      viewOpenReturnStatus.value = false
    }
    if (option === 'viewReturn') {
      listReturns.value = false
      viewReturn.value = true
      viewReturnStatus.value = false
      viewOpenReturnStatus.value = false
    }
    if (option === 'viewReturnStatus') {
      listReturns.value = false
      viewReturn.value = false
      viewReturnStatus.value = true
      viewOpenReturnStatus.value = false
    }
    if (option === 'viewOpenReturnStatus') {
      listReturns.value = false
      viewReturn.value = false
      viewReturnStatus.value = false
      viewOpenReturnStatus.value = true
    }
  }

  return {
    openMenu,
    optionSelected,
    listClient,
    newClient,
    updateClient,
    listItem,
    newItem,
    openItem,
    listReturns,
    viewReturn,
    viewReturnStatus,
    viewOpenReturnStatus,
    handleMenu,
    changeOptionSelected,
    handleClient,
    handleItems,
    handleReturn,
    viewCloseCasBox,
    viewCashRegister,
    viewCashWithdrawal,
    handleCashBox,
    handlePrints,
    viewPrintsList,
    viewShowInfoPrint
  }
})
