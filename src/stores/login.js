import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import LoginApi from '../apis/LoginApi'
import { useMenuStore } from './menu'

export const useLoginStore = defineStore('login', () => {
  const user = ref(null)
  const loginView = ref(true)
  const menuStore = useMenuStore();

  const handleLogin = async (formData) => {
    try {
      let objApiForm = {
        user: formData.user,
        password: formData.password
      }
      const { data } = await LoginApi.login(objApiForm)
      user.value = data.data
      console.log("data", data.data);
      if (data.data != null) {
        localStorage.setItem('USER_ID', data.data.internalid)
        localStorage.setItem('USER_INFO', JSON.stringify(data.data))

        if(data.data.cf_drt_custom_rol_id == 2){
          menuStore.openMenu = true
        }
        loginView.value = !loginView.value
      } else {
        localStorage.removeItem('USER_ID');
        localStorage.removeItem('USER_INFO');
        return data;
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleLoginAprobation = async (formData) => {
    try {
      let objApiForm = {
        user: formData.user,
        password: formData.password
      }
      const { data } = await LoginApi.login(objApiForm)
      return data
    } catch (error) {
      console.log(error)
    }
  }

  return {
    loginView,
    handleLogin,
    handleLoginAprobation
  }
})
