// Middleware de autorización por rol
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useAuthStore()
  const requiredRole = to.meta.role as string | undefined
  if (requiredRole && !auth.userRoles.includes(requiredRole)) {
    return navigateTo('/app/dashboard')
  }
})