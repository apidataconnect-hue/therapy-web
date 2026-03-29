import api from './api'

export interface Tag {
  id: string
  name: string
  color?: string | null
  isActive: boolean
}

export interface CreateTagPayload {
  name: string
  color?: string | null
}

export interface UpdateTagPayload {
  name?: string
  color?: string | null
  isActive?: boolean
}

export async function getTags(activeOnly = true): Promise<Tag[]> {
  const { data } = await api.get('/tag', { params: { activeOnly } })
  // API may return plain array or paginated { items: [...] }
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function getTag(id: string): Promise<Tag> {
  const { data } = await api.get(`/tag/${id}`)
  return data
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  const { data } = await api.post('/tag', payload)
  return data
}

export async function updateTag(id: string, payload: UpdateTagPayload): Promise<Tag> {
  const { data } = await api.patch(`/tag/${id}`, payload)
  return data
}

export async function deleteTag(id: string): Promise<void> {
  await api.delete(`/tag/${id}`)
}
