import { defineStore } from 'pinia'

export interface User {
  id: string
  name: string
  email: string
  roles?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  selectedProfileId: string | null
}

const LS_KEY = 'tw-auth'

function loadFromStorage(): Partial<AuthState> {
  if (typeof localStorage === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') } catch { return {} }
}

function saveToStorage(state: AuthState) {
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(LS_KEY, JSON.stringify(state))
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    selectedProfileId: null,
    ...loadFromStorage(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    // Returns roles without the "ROLE_" prefix, e.g. ["THERAPIST", "ADMIN"]
    userRoles: (state) => (state.user?.roles ?? []).map(r => r.replace(/^ROLE_/, '')),
    // Returns the primary role (first role without "ROLE_" prefix), e.g. "THERAPIST"
    userRole: (state) => (state.user?.roles ?? []).map(r => r.replace(/^ROLE_/, ''))[0] ?? null,
    isPatient: (state) => (state.user?.roles ?? []).some(r => r.includes('PATIENT')),
    isTherapist: (state) => (state.user?.roles ?? []).some(r => r.includes('THERAPIST')),
  },
  actions: {
    setAuth(user: User, token: string, refreshToken?: string) {
      this.user = user
      this.token = token
      if (refreshToken !== undefined) this.refreshToken = refreshToken
      saveToStorage(this.$state)
    },
    setToken(token: string, refreshToken?: string) {
      this.token = token
      if (refreshToken !== undefined) this.refreshToken = refreshToken
      saveToStorage(this.$state)
    },
    setProfileId(id: string | null) {
      this.selectedProfileId = id
      saveToStorage(this.$state)
    },
    clearAuth() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.selectedProfileId = null
      if (typeof localStorage !== 'undefined') localStorage.removeItem(LS_KEY)
    },
  },
})