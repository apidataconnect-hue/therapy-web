// Middleware de autenticación
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  const isPatientRoute = to.path === '/patient' || to.path.startsWith('/patient/')
  const isAppRoute = to.path === '/app' || to.path.startsWith('/app/')

  // Patient routes require the PATIENT role (dual-role users are allowed through)
  if (isPatientRoute && !auth.isPatient) {
    return navigateTo(auth.isTherapist ? '/app/therapist/calendar' : '/login')
  }

  // App routes require the THERAPIST role (dual-role users are allowed through)
  if (isAppRoute && !auth.isTherapist) {
    return navigateTo(auth.isPatient ? '/patient' : '/login')
  }
})