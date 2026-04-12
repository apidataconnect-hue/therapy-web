import api from './api'

export type PatientStatus = 'active' | 'inactive' | 'archived' | 'discharged'
export type GuardianRelationshipType = 'mother' | 'father' | 'legal_guardian' | 'grandparent' | 'sibling' | 'step_parent' | 'other'

export interface Patient {
  id: string
  fullName?: string
  firstName: string
  lastName: string
  birthDate?: string | null
  phone?: string | null
  email?: string | null
  documentNumber?: string | null
  address?: string | null
  isMinor: boolean
  workspaceId?: string | null
  patientStatus: PatientStatus
  internalReference?: string | null
  notesAdministrative?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  source?: string | null
}

export interface PatientListParams {
  status?: PatientStatus
  workspace?: string
  search?: string
  isMinor?: boolean
  page?: number
  size?: number
}

export interface PatientListResponse {
  items: Patient[]
  total: number
  page: number
  size: number
}

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  birthDate?: string | null
  phone?: string | null
  email?: string | null
  documentNumber?: string | null
  address?: string | null
  isMinor?: boolean
  workspaceId?: string | null
  internalReference?: string | null
  notesAdministrative?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  source?: string | null
  guardians?: CreateGuardianPayload[]
}

export type UpdatePatientPayload = Partial<CreatePatientPayload> & {
  patientStatus?: PatientStatus
}

export interface Guardian {
  id: string
  fullName: string
  relationshipType: GuardianRelationshipType
  phone?: string | null
  email?: string | null
  isLegalGuardian?: boolean
  isPrimaryContact?: boolean
  canManageAppointments?: boolean
  canReceiveNotifications?: boolean
  canSignDocuments?: boolean
}

export interface CreateGuardianPayload {
  fullName: string
  relationshipType: GuardianRelationshipType
  phone?: string | null
  email?: string | null
  isLegalGuardian?: boolean
  isPrimaryContact?: boolean
  canManageAppointments?: boolean
  canReceiveNotifications?: boolean
  canSignDocuments?: boolean
}

export async function getPatients(params?: PatientListParams): Promise<PatientListResponse> {
  const { data } = await api.get('/patient', { params })
  return data
}

export async function getPatient(id: string): Promise<Patient> {
  const { data } = await api.get(`/patient/${id}`)
  return data
}

export async function createPatient(payload: CreatePatientPayload): Promise<Patient> {
  const { data } = await api.post('/patient', payload)
  return data
}

export async function updatePatient(id: string, payload: UpdatePatientPayload): Promise<Patient> {
  const { data } = await api.patch(`/patient/${id}`, payload)
  return data
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patient/${id}`)
}

// Guardian sub-resource
export async function getGuardians(patientId: string): Promise<{ items: Guardian[] }> {
  const { data } = await api.get(`/patient/${patientId}/guardian`)
  return data
}

export async function addGuardian(patientId: string, payload: CreateGuardianPayload): Promise<Guardian> {
  const { data } = await api.post(`/patient/${patientId}/guardian`, payload)
  return data
}

export async function removeGuardian(patientId: string, guardianId: string): Promise<void> {
  await api.delete(`/patient/${patientId}/guardian/${guardianId}`)
}
