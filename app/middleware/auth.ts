// Middleware de autenticación
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // Block patients from accessing therapist-only routes
  if (auth.isPatient && to.path.startsWith('/app/therapist')) {
    return navigateTo('/app/dashboard')
  }
})