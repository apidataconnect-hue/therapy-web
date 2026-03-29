// Servicio base para llamadas a la API
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
  } catch {
    // Pinia no disponible fuera del contexto Vue (ej. SSR)
  }
  return config
})

export default api
