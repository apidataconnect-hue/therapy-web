import api from './api'

export interface RegisterTherapistPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  licenseNumber: string
  specialty: string
}

export interface TherapistProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  birthDate?: string | null
  licenseNumber: string
  specialty: string
  bio?: string | null
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string | null
  birthDate?: string | null
  licenseNumber?: string
  specialty?: string
  bio?: string | null
}

export async function registerTherapist(payload: RegisterTherapistPayload): Promise<{ therapist: TherapistProfile; token: string }> {
  const { data } = await api.post('/therapist/register', payload)
  return data
}

export async function getProfile(): Promise<TherapistProfile> {
  const { data } = await api.get('/therapist/profile')
  return data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<TherapistProfile> {
  const { data } = await api.patch('/therapist/profile', payload)
  return data
}

export async function getTherapistSessions(params?: { patientId?: string; from?: string; to?: string; page?: number; limit?: number }): Promise<any> {
  const { data } = await api.get('/appointment', { params })
  return data
}
