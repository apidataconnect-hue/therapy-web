import { defineStore } from 'pinia'
import type { TherapyProcess } from '~/services/processService'

export type { TherapyProcess }

export interface ProcessState {
  processes: TherapyProcess[]
  currentProcess: TherapyProcess | null
}

export const useProcessStore = defineStore('process', {
  state: (): ProcessState => ({
    processes: [],
    currentProcess: null,
  }),
  actions: {
    setProcesses(processes: TherapyProcess[]) {
      this.processes = processes
    },
    setCurrentProcess(process: TherapyProcess | null) {
      this.currentProcess = process
    },
    upsertProcess(process: TherapyProcess) {
      const idx = this.processes.findIndex(p => p.id === process.id)
      if (idx !== -1) this.processes[idx] = process
      else this.processes.push(process)
    },
    removeProcess(id: string) {
      this.processes = this.processes.filter(p => p.id !== id)
      if (this.currentProcess?.id === id) this.currentProcess = null
    },
  },
})
