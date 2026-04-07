import api from './api'

export interface TherapistInfo {
  id: string
  name: string
  specialty?: string
}

export interface PatientProfile {
  id: string
  patientName: string
  patientStatus: string
  email?: string
  phone?: string
  therapist: TherapistInfo
}

export interface PatientAppointment {
  id: string
  appointmentType: string
  appointmentStatus: string
  startAt: string
  endAt: string
  locationText?: string | null
  meetingUrl?: string | null
  notes?: string | null
  therapist?: TherapistInfo
}

export async function getProfiles(): Promise<PatientProfile[]> {
  const { data } = await api.get('/me/profiles')
  return data
}

export async function getMyAppointments(profileId: string): Promise<PatientAppointment[]> {
  const { data } = await api.get('/me/appointments', { params: { profile: profileId } })
  return data
}
