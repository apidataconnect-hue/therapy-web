import api from './api'
import type { Appointment } from './appointmentService'

export type ProcessStatus = 'draft' | 'active' | 'paused' | 'closed' | 'disabled' | 'archived'

export interface TherapyProcess {
  id: string
  patientId: string
  patientName?: string | null
  reasonForConsultation: string
  initialObservations?: string | null
  openedAt?: string | null
  processStatus: ProcessStatus
  privateNotes?: string | null
  closedAt?: string | null
  nextAppointmentAt?: string | null
  tags?: Array<{ id: string; name: string; color?: string | null }>
  appointments?: Appointment[]
}

export interface ProcessListParams {
  processStatus?: ProcessStatus | ProcessStatus[]
  sortBy?: 'openedAt' | 'closedAt' | 'nextAppointmentAt'
  order?: 'asc' | 'desc'
  page?: number
  size?: number
}

export interface ProcessListResponse {
  items: TherapyProcess[]
  total: number
  page: number
  size: number
}

export interface CreateProcessPayload {
  patientId: string
  reasonForConsultation: string
  initialObservations?: string | null
  openedAt?: string | null
  tagIds?: string[]
}

export interface UpdateProcessPayload {
  reasonForConsultation?: string
  initialObservations?: string | null
  processStatus?: ProcessStatus
  privateNotes?: string | null
  closedAt?: string | null
}

export async function getProcesses(params?: ProcessListParams): Promise<ProcessListResponse> {
  const { data } = await api.get('/process', { params })
  return data
}

export async function getPatientProcesses(patientId: string): Promise<TherapyProcess[]> {
  const { data } = await api.get(`/process/patient/${patientId}`)
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function getProcess(id: string): Promise<TherapyProcess> {
  const { data } = await api.get(`/process/${id}`)
  return data
}

export async function createProcess(payload: CreateProcessPayload): Promise<TherapyProcess> {
  const { data } = await api.post('/process', payload)
  return data
}

export async function updateProcess(id: string, payload: UpdateProcessPayload): Promise<TherapyProcess> {
  const { data } = await api.patch(`/process/${id}`, payload)
  return data
}

export async function deleteProcess(id: string): Promise<void> {
  await api.delete(`/process/${id}`)
}

export async function disableProcess(id: string): Promise<void> {
  await api.post(`/process/${id}/disable`)
}

export async function archiveProcess(id: string): Promise<void> {
  await api.post(`/process/${id}/archive`)
}

export async function addTagToProcess(processId: string, tagId: string): Promise<void> {
  await api.post(`/process/${processId}/tag`, { tagId })
}

export async function removeTagFromProcess(processId: string, tagId: string): Promise<void> {
  await api.delete(`/process/${processId}/tag/${tagId}`)
}
