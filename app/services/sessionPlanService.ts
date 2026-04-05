import api from './api'

export interface SessionPlan {
  id: string
  appointmentId: string
  templateId: string | null
  templateName: string | null
  content: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface GeneratePlanPayload {
  templateId?: string | null
  regenerate?: boolean
}

export async function getSessionPlan(appointmentHash: string): Promise<SessionPlan | null> {
  try {
    const { data } = await api.get(`/session-plan/${appointmentHash}`)
    // Backend returns {} when no plan exists
    if (!data || !data.id) return null
    return data as SessionPlan
  } catch {
    return null
  }
}

export async function generateSessionPlan(
  appointmentHash: string,
  payload: GeneratePlanPayload = {},
): Promise<SessionPlan> {
  const { data } = await api.post(`/session-plan/${appointmentHash}`, payload)
  return data
}

export async function deleteSessionPlan(appointmentHash: string): Promise<void> {
  await api.delete(`/session-plan/${appointmentHash}`)
}
