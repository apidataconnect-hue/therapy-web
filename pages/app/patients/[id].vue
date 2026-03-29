<template>
  <div>
    <h2>Detalle de paciente</h2>
    <v-card v-if="patient" class="mb-4">
      <v-card-title>{{ patient.fullName }}</v-card-title>
      <v-card-text>
        <div><strong>Email:</strong> {{ patient.email }}</div>
        <div><strong>Teléfono:</strong> {{ patient.phone || '—' }}</div>
        <div><strong>Estado:</strong> <v-chip :color="statusColor(patient.status)" dark>{{ patient.status }}</v-chip></div>
        <div><strong>Notas internas:</strong> {{ patient.internalNotes || '—' }}</div>
        <div><strong>Vinculado desde:</strong> {{ patient.invitedAt }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="toggleAccess">{{ patient.status === 'ACTIVE' ? 'Desactivar' : 'Activar' }} acceso</v-btn>
        <v-btn color="secondary" @click="archive">Archivar</v-btn>
      </v-card-actions>
    </v-card>
    <div v-else>Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPatient, updatePatientAccess, archivePatient } from '~/services/patientService'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const route = useRoute()
const id = route.params.id as string
const patient = ref<any>(null)
const error = ref('')

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'green'
    case 'INVITED': return 'blue'
    case 'INACTIVE': return 'grey'
    case 'ARCHIVED': return 'orange'
    default: return 'grey'
  }
}

async function fetchPatient() {
  try {
    const data = await getPatient(id)
    patient.value = {
      ...data,
      fullName: data.firstName ? `${data.firstName} ${data.lastName}` : data.patientName || '',
    }
  } catch (e) {
    error.value = 'No se pudo cargar el paciente.'
  }
}

const notification = useNotificationStore()

async function toggleAccess() {
  if (!patient.value) return
  try {
    const newAccess = patient.value.status !== 'ACTIVE'
    await updatePatientAccess(id, newAccess)
    await fetchPatient()
    notification.notify({ message: newAccess ? 'Acceso activado' : 'Acceso desactivado', color: 'success' })
  } catch (e) {
    error.value = 'No se pudo actualizar el acceso.'
    notification.notify({ message: error.value, color: 'error' })
  }
}

async function archive() {
  try {
    await archivePatient(id)
    await fetchPatient()
    notification.notify({ message: 'Paciente archivado', color: 'success' })
  } catch (e) {
    error.value = 'No se pudo archivar el paciente.'
    notification.notify({ message: error.value, color: 'error' })
  }
}

onMounted(fetchPatient)
</script>
