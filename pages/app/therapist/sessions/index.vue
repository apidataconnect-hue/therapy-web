<template>
  <div>
    <h2>Sesiones de mis pacientes</h2>
    <v-data-table :headers="headers" :items="sessions" :loading="loading" class="mt-4" />
    <div v-if="!loading && sessions.length === 0">No hay sesiones registradas.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTherapistSessions } from '~/services/therapistService'

const sessions = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Paciente', value: 'patientName' },
  { text: 'Fecha de la sesión', value: 'date' },
  { text: 'Estado de la sesión', value: 'status' },
  { text: 'Notas', value: 'notes' },
]

onMounted(async () => {
  loading.value = true
  try {
    sessions.value = await getTherapistSessions()
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
