import { defineStore } from 'pinia'

export interface Invitation {
  id: string
  therapistId: string
  email: string
  token: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  acceptedAt?: string
  cancelledAt?: string
  patientId?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface InvitationState {
  invitations: Invitation[]
}

export const useInvitationStore = defineStore('invitation', {
  state: (): InvitationState => ({
    invitations: [],
  }),
  actions: {
    setInvitations(invitations: Invitation[]) {
      this.invitations = invitations
    },
    addInvitation(invitation: Invitation) {
      this.invitations.push(invitation)
    },
    updateInvitation(invitation: Invitation) {
      const idx = this.invitations.findIndex(i => i.id === invitation.id)
      if (idx !== -1) this.invitations[idx] = invitation
    },
  },
})