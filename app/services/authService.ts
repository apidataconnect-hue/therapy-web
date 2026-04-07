import api from './api'
import type { User } from '~/stores/auth'

export interface LoginPayload {
  email: string
  password: string
  push?: null
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/user/login', { email, password, push: null })
  return data
}

export async function refreshToken(token: string): Promise<{ token: string; refreshToken: string }> {
  const { data } = await api.post('/user/refreshToken', { refreshToken: token })
  return data
}

export async function recoverPassword(email: string): Promise<void> {
  await api.post('/user/recoverPassword', { email })
}

export async function logout(): Promise<void> {
  await api.post('/user/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/user')
  return data
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.patch('/user/password', { oldPassword, newPassword })
}
