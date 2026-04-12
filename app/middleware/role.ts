// Middleware de autorización por rol
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useAuthStore()
  const requiredRole = to.meta.role as string | undefined
  // Skip role check when the API returns no roles (backend limitation)
  const hasRoles = auth.userRoles.length > 0
  if (requiredRole && hasRoles && !auth.userRoles.includes(requiredRole)) {
    return navigateTo(auth.isPatient ? '/patient' : '/app/therapist/calendar')
  }
})