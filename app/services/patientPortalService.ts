import api from './api'

export interface TherapistInfo {
  id: string
  name: string
  specialty?: string
}

export interface PersonInfo {
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface PatientProfile {
  id: string
  patientStatus: string
  therapist: TherapistInfo
  person: PersonInfo
  createdAt?: string
}

export interface PatientAppointment {
  id: string
  patientName?: string
  appointmentType: string
  appointmentStatus: string
  startAt: string
  endAt: string
  meetingUrl?: string | null
  workspace?: any
  therapist?: TherapistInfo
}

export async function getProfiles(): Promise<PatientProfile[]> {
  const { data } = await api.get('/me/profiles')
  return data.profiles ?? data
}

export async function getMyAppointments(profileId: string): Promise<PatientAppointment[]> {
  const { data } = await api.get('/me/appointments', { params: { profile: profileId } })
  return data.items ?? data
}
