import { defineStore } from 'pinia'
import type { Patient } from '~/services/patientService'

export type { Patient }

export interface PatientState {
  patients: Patient[]
  currentPatient: Patient | null
  total: number
  page: number
  size: number
}

export const usePatientStore = defineStore('patient', {
  state: (): PatientState => ({
    patients: [],
    currentPatient: null,
    total: 0,
    page: 1,
    size: 20,
  }),
  actions: {
    setPatients(patients: Patient[], total: number, page: number, size: number) {
      this.patients = patients
      this.total = total
      this.page = page
      this.size = size
    },
    setCurrentPatient(patient: Patient | null) {
      this.currentPatient = patient
    },
  },
})