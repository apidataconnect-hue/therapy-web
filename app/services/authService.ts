import api from './api'
import type { User } from '~/stores/auth'
import type { PatientProfile } from './patientPortalService'

export interface LoginPayload {
  email: string
  password: string
  push?: null
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  profiles?: PatientProfile[]
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/user/login', { email, password, push: null })
  const result: AuthResponse = data

  // Try to fetch patient profiles first; if it returns data the user is a patient.
  // Otherwise fall back to probing the therapist profile endpoint.
  try {
    const { data: profiles } = await api.get('/me/profiles', { headers: { token: result.token } })
    if (Array.isArray(profiles) && profiles.length > 0) {
      result.user.roles = ['ROLE_PATIENT']
      result.profiles = profiles
      return result
    }
  } catch {
    // Not a patient — continue to therapist probe
  }

  try {
    await api.get('/therapist/profile', { headers: { token: result.token } })
    result.user.roles = ['ROLE_THERAPIST']
  } catch {
    result.user.roles = ['ROLE_PATIENT']
  }

  return result
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
