import api from './api'
import type { User } from '~/stores/auth'

export async function login(email: string, password: string): Promise<{ user: User, token: string }> {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/auth/me')
  return data
}
