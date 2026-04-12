// Servicio base para llamadas a la API
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

const DEVICE_ID = 'web-client-v1'
const DEVICE_TYPE = '2'

const api = axios.create({
  baseURL: '/api',
  paramsSerializer: (params) => {
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const item of value) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      }
    }
    return parts.join('&')
  },
})

api.interceptors.request.use((config) => {
  config.headers['deviceId'] = DEVICE_ID
  config.headers['deviceType'] = DEVICE_TYPE
  config.headers['locale'] = 'es'
  // Prevent browser from serving stale cached API responses on client-side navigation
  if (!config.method || config.method.toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-cache'
    config.headers['Pragma'] = 'no-cache'
  }
  try {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers['token'] = auth.token
    }
  } catch {
    // Pinia no disponible fuera del contexto Vue (ej. SSR)
  }
  return config
})

// Interceptor 401: intenta renovar el token y reintenta la petición original
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => {
    // Auto-unwrap the backend envelope: { data: <payload>, commons: [], requestId: '' }
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'requestId' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      const auth = useAuthStore()
      if (!auth.refreshToken) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers['token'] = token
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      const { data } = await axios.post('/api/user/refreshToken', {
        refreshToken: auth.refreshToken,
      }, {
        headers: {
          deviceId: DEVICE_ID,
          deviceType: DEVICE_TYPE,
          locale: 'es',
        },
      })

      auth.setToken(data.data.token, data.data.refreshToken)
      original.headers['token'] = data.data.token
      refreshQueue.forEach(cb => cb(data.data.token))
      refreshQueue = []
      isRefreshing = false

      return api(original)
    } catch {
      isRefreshing = false
      refreshQueue = []
      try {
        const auth = useAuthStore()
        auth.clearAuth()
      } catch { /* no-op */ }
      return Promise.reject(error)
    }
  },
)

export default api
