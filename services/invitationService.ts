import api from './api'

export async function invitePatient(payload: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  internalNotes?: string
}): Promise<any> {
  const { data } = await api.post('/therapist/patients/invitations', payload)
  return data
}

export async function getInvitations(): Promise<any[]> {
  const { data } = await api.get('/therapist/patients/invitations')
  return data
}

export async function resendInvitation(id: string): Promise<any> {
  const { data } = await api.post(`/therapist/patients/invitations/${id}/resend`)
  return data
}

export async function cancelInvitation(id: string): Promise<any> {
  const { data } = await api.post(`/therapist/patients/invitations/${id}/cancel`)
  return data
}

export async function getInvitationByToken(token: string): Promise<any> {
  const { data } = await api.get(`/public/invitations/${token}`)
  return data
}

export async function acceptInvitation(token: string, payload: { password: string }): Promise<any> {
  const { data } = await api.post(`/public/invitations/${token}/accept`, payload)
  return data
}
