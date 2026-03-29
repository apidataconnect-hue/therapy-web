import api from './api'

export type AppointmentType = 'in_person' | 'online' | 'phone' | 'home_visit'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type CancelledBy = 'therapist' | 'patient' | 'guardian' | 'system'

export interface Appointment {
  id: string
  patientId: string
  appointmentType: AppointmentType
  appointmentStatus: AppointmentStatus
  startAt: string
  endAt: string
  locationText?: string | null
  meetingUrl?: string | null
  notes?: string | null
  therapyProcessId?: string | null
  processId?: string | null
  workspaceId?: string | null
  rescheduledFromId?: string | null
  cancelReason?: string | null
  cancelledBy?: CancelledBy | null
}

export interface AppointmentListParams {
  status?: AppointmentStatus
  patientId?: string
  from?: string
  to?: string
  upcoming?: boolean
  page?: number
  limit?: number
}

export interface AppointmentListResponse {
  items: Appointment[]
  total: number
  page: number
  size: number
}

export interface CreateAppointmentPayload {
  patientId: string
  appointmentType: AppointmentType
  startAt: string
  endAt: string
  locationText?: string | null
  meetingUrl?: string | null
  notes?: string | null
  processId?: string | null
  workspaceId?: string | null
  rescheduledFromId?: string | null
}

export interface UpdateAppointmentPayload {
  appointmentType?: AppointmentType
  appointmentStatus?: 'confirmed' | 'completed'
  startAt?: string
  endAt?: string
  locationText?: string | null
  meetingUrl?: string | null
  notes?: string | null
  processId?: string | null
  workspaceId?: string | null
}

export interface CancelAppointmentPayload {
  cancelReason: string
  cancelledBy: CancelledBy
}

export async function getAppointments(params?: AppointmentListParams): Promise<AppointmentListResponse> {
  const { data } = await api.get('/appointment', { params })
  return data
}

export async function getAppointment(id: string): Promise<Appointment> {
  const { data } = await api.get(`/appointment/${id}`)
  return data
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post('/appointment', payload)
  return data
}

export async function updateAppointment(id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
  const { data } = await api.patch(`/appointment/${id}`, payload)
  return data
}

export async function cancelAppointment(id: string, payload: CancelAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post(`/appointment/${id}/cancel`, payload)
  return data
}

export async function reactivateAppointment(id: string): Promise<Appointment> {
  const { data } = await api.post(`/appointment/${id}/reactivate`)
  return data
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointment/${id}`)
}
