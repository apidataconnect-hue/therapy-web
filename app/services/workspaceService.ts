import api from './api'

export interface Workspace {
  id: string
  name: string
  description?: string | null
  color?: string | null
  isDefault: boolean
  isActive: boolean
}

export interface CreateWorkspacePayload {
  name: string
  description?: string | null
  color?: string | null
  isDefault?: boolean
}

export interface UpdateWorkspacePayload {
  description?: string | null
  color?: string | null
  isDefault?: boolean
  isActive?: boolean
}

export async function getWorkspaces(activeOnly = true): Promise<Workspace[]> {
  const { data } = await api.get('/workspace', { params: { activeOnly } })
  return data
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const { data } = await api.get(`/workspace/${id}`)
  return data
}

export async function createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
  const { data } = await api.post('/workspace', payload)
  return data
}

export async function updateWorkspace(id: string, payload: UpdateWorkspacePayload): Promise<Workspace> {
  const { data } = await api.patch(`/workspace/${id}`, payload)
  return data
}

export async function deleteWorkspace(id: string): Promise<void> {
  await api.delete(`/workspace/${id}`)
}
