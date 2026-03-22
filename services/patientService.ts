import api from './api'

export async function getPatients(): Promise<any[]> {
  const { data } = await api.get('/therapist/patients')
  return data
}

export async function getPatient(id: string): Promise<any> {
  const { data } = await api.get(`/therapist/patients/${id}`)
  return data
}

export async function updatePatientAccess(id: string, access: boolean): Promise<any> {
  const { data } = await api.patch(`/therapist/patients/${id}/access`, { access })
  return data
}

export async function archivePatient(id: string): Promise<any> {
  const { data } = await api.patch(`/therapist/patients/${id}/archive`)
  return data
}

// Área paciente
export async function getPatientMe(): Promise<any> {
  const { data } = await api.get('/patient/me')
  return data
}

export async function getPatientSessions(): Promise<any[]> {
  const { data } = await api.get('/patient/sessions')
  return data
}

export async function getPatientDocuments(): Promise<any[]> {
  const { data } = await api.get('/patient/documents')
  return data
}
