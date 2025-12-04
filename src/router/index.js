import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/dashboard/Dashboard.vue'
import ProjectList from '../components/projects/ProjectList.vue'
import Calendar from '../components/calendar/Calendar.vue'
import LoginForm from '../components/Auth/LoginForm.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: ProjectList,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user has a valid session token
    const token = sessionStorage.getItem('sessionToken')
    if (!token) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 