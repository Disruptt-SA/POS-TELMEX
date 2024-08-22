import { createApp } from 'vue'
import App from './App.vue'
import './assets/global.css'
import router from './router'
import { createPinia } from 'pinia'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast({
	duration: 7000,
	position: 'top'
})

const app = createApp(App)

app.provide('toast', $toast)
app.use(createPinia())
app.use(router)

app.mount('#app')
