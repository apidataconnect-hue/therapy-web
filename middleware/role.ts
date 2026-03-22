// Middleware de autorización por rol
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  const requiredRole = to.meta.role
  if (requiredRole && auth.user?.role !== requiredRole) {
    return navigateTo('/app/dashboard')
  }
})