<template>
  <div>
    <h2>Pacientes</h2>
    <NuxtLink to="/app/patients/invite">Invitar paciente</NuxtLink>
    <v-data-table
      :headers="headers"
      :items="patients"
      :loading="loading"
      class="mt-4"
      item-value="id"
      @click:row="goToDetail"
    >
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon @click.stop="goToDetail(item)"><v-icon>mdi-eye</v-icon></v-btn>
      </template>
    </v-data-table>

    <h3 class="mt-8">Invitaciones pendientes</h3>
    <v-data-table
      :headers="invHeaders"
      :items="invitations"
      :loading="loadingInv"
      class="mt-2"
      item-value="id"
    >
      <template #item.status="{ item }">
        <v-chip :color="invStatusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon @click="resend(item)"><v-icon>mdi-send</v-icon></v-btn>
        <v-btn icon @click="cancel(item)"><v-icon>mdi-cancel</v-icon></v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePatientStore } from '~/stores/patient'
import { getPatients } from '~/services/patientService'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '~/stores/notification'

import { getInvitations, resendInvitation, cancelInvitation } from '~/services/invitationService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const patientStore = usePatientStore()
const router = useRouter()
const loading = ref(false)
const notification = useNotificationStore()

const headers = [
  { text: 'Nombre', value: 'fullName' },
  { text: 'Estado', value: 'status' },
  { text: 'Acciones', value: 'actions', sortable: false },
]

const patients = ref<any[]>([])

const invitations = ref<any[]>([])
const loadingInv = ref(false)

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'green'
    case 'INVITED': return 'blue'
    case 'INACTIVE': return 'grey'
    case 'ARCHIVED': return 'orange'
    default: return 'grey'
  }
}

function goToDetail(item: any) {
  router.push(`/app/patients/${item.id}`)
}

const invHeaders = [
  { text: 'Email', value: 'email' },
  { text: 'Estado', value: 'status' },
  { text: 'Expira', value: 'expiresAt' },
  { text: 'Acciones', value: 'actions', sortable: false },
]

function invStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'blue'
    case 'ACCEPTED': return 'green'
    case 'EXPIRED': return 'grey'
    case 'CANCELLED': return 'orange'
    default: return 'grey'
  }
}

async function loadInvitations() {
  loadingInv.value = true
  try {
    invitations.value = await getInvitations()
  } finally {
    loadingInv.value = false
  }
}

async function resend(item: any) {
  await resendInvitation(item.id)
  await loadInvitations()
  notification.notify({ message: 'Invitación reenviada', color: 'success' })
}

async function cancel(item: any) {
  await cancelInvitation(item.id)
  await loadInvitations()
  notification.notify({ message: 'Invitación cancelada', color: 'success' })
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await getPatients()
    // Suponiendo que el backend devuelve nombre y apellidos
    patients.value = data.map((p: any) => ({
      ...p,
      fullName: p.firstName ? `${p.firstName} ${p.lastName}` : p.patientName || '',
    }))
    patientStore.setPatients(data)
  } finally {
    loading.value = false
  }
  await loadInvitations()
})
</script>
