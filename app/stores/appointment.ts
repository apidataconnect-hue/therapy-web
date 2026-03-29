import { defineStore } from 'pinia'
import type { Appointment } from '~/services/appointmentService'

export type { Appointment }

export interface AppointmentState {
  appointments: Appointment[]
  currentAppointment: Appointment | null
  total: number
  page: number
}

export const useAppointmentStore = defineStore('appointment', {
  state: (): AppointmentState => ({
    appointments: [],
    currentAppointment: null,
    total: 0,
    page: 1,
  }),
  actions: {
    setAppointments(appointments: Appointment[], total: number, page: number) {
      this.appointments = appointments
      this.total = total
      this.page = page
    },
    setCurrentAppointment(appointment: Appointment | null) {
      this.currentAppointment = appointment
    },
    upsertAppointment(appointment: Appointment) {
      const idx = this.appointments.findIndex(a => a.id === appointment.id)
      if (idx !== -1) this.appointments[idx] = appointment
      else this.appointments.push(appointment)
    },
  },
})
