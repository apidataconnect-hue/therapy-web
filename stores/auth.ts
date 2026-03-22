import { defineStore } from 'pinia'

export type UserRole = 'THERAPIST' | 'PATIENT' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  firstName?: string
  lastName?: string
  lastLoginAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role,
  },
  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
    },
    clearAuth() {
      this.user = null
      this.token = null
    },
  },
})