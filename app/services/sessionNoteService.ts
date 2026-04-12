import api from './api'

export interface SessionNote {
  id: string
  processId: string
  appointmentId?: string | null
  patientId?: string | null
  summary: string
  observations?: string | null
  interventions?: string | null
  homework?: string | null
  nextSteps?: string | null
  privateNotes?: string | null
  plan?: string | null
  planId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateSessionNotePayload {
  processId?: string | null
  appointmentId?: string | null
  summary: string
  observations?: string | null
  interventions?: string | null
  homework?: string | null
  nextSteps?: string | null
  privateNotes?: string | null
  plan?: string | null
}

export type UpdateSessionNotePayload = Partial<Omit<CreateSessionNotePayload, 'processId'>>

export async function getSessionNote(id: string): Promise<SessionNote> {
  const { data } = await api.get(`/session-note/${id}`)
  return data
}

export async function getSessionNoteByAppointment(appointmentId: string): Promise<SessionNote | null> {
  try {
    const { data } = await api.get('/session-note', { params: { appointmentId } })
    // Single object returned directly
    if (data && typeof data === 'object' && !Array.isArray(data) && data.id) return data as SessionNote
    // Array response
    if (Array.isArray(data)) return data[0] ?? null
    // Paginated response
    if (data?.items) return (data.items as SessionNote[])[0] ?? null
    return null
  } catch {
    return null
  }
}

export async function createSessionNote(payload: CreateSessionNotePayload): Promise<SessionNote> {
  const { data } = await api.post('/session-note', payload)
  return data
}

export async function updateSessionNote(id: string, payload: UpdateSessionNotePayload): Promise<SessionNote> {
  const { data } = await api.patch(`/session-note/${id}`, payload)
  return data
}

export async function deleteSessionNote(id: string): Promise<void> {
  await api.delete(`/session-note/${id}`)
}
