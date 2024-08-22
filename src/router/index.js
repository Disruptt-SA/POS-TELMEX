import { createRouter, createWebHistory } from 'vue-router'

//IMPORT VIEWE
import LoginPage from '../views/LoginView.vue'
import AppView from '../views/AppView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/app',
    name: 'App',
    component: AppView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
