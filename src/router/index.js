import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Analytics from '../views/Analytics.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: Analytics
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router