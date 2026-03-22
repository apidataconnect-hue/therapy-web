import api from './api'

// Placeholder: implement endpoints reales según backend
export async function getTherapistSessions(): Promise<any[]> {
  const { data } = await api.get('/therapist/sessions')
  return data
}

export async function getTherapistTherapies(): Promise<any[]> {
  const { data } = await api.get('/therapist/therapies')
  return data
}
