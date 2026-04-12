import api from './api'

export interface SessionPlanTemplate {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  isSystem: boolean
  sessionsToAnalyze: number
  systemPrompt?: string
  userPromptTemplate?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateTemplatePayload {
  name: string
  description?: string | null
  systemPrompt: string
  userPromptTemplate?: string | null
  isDefault?: boolean
  sessionsToAnalyze?: number
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>

export async function getTemplates(): Promise<SessionPlanTemplate[]> {
  const { data } = await api.get('/session-plan-template')
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function getTemplate(id: string): Promise<SessionPlanTemplate> {
  const { data } = await api.get(`/session-plan-template/${id}`)
  return data
}

export async function createTemplate(payload: CreateTemplatePayload): Promise<SessionPlanTemplate> {
  const { data } = await api.post('/session-plan-template', payload)
  return data
}

export async function updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<SessionPlanTemplate> {
  const { data } = await api.patch(`/session-plan-template/${id}`, payload)
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/session-plan-template/${id}`)
}
