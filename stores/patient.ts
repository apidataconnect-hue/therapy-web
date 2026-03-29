import { defineStore } from 'pinia'

export interface PatientProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  birthDate?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface TherapistPatient {
  id: string
  therapistId: string
  patientId: string
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  invitedAt: string
  acceptedAt?: string
  archivedAt?: string
  createdByUserId: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
}

export interface PatientState {
  patients: TherapistPatient[]
  profiles: Record<string, PatientProfile>
}

export const usePatientStore = defineStore('patient', {
  state: (): PatientState => ({
    patients: [],
    profiles: {},
  }),
  actions: {
    setPatients(patients: TherapistPatient[]) {
      this.patients = patients
    },
    setProfile(profile: PatientProfile) {
      this.profiles[profile.id] = profile
    },
  },
})