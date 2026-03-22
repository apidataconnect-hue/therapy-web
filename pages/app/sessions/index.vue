<template>
  <div>
    <h2>Mis sesiones</h2>
    <v-data-table :headers="headers" :items="sessions" :loading="loading" class="mt-4" />
    <div v-if="!loading && sessions.length === 0">No tienes sesiones registradas.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPatientSessions } from '~/services/patientService'

const sessions = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Fecha', value: 'date' },
  { text: 'Estado', value: 'status' },
  { text: 'Notas', value: 'notes' },
]

onMounted(async () => {
  loading.value = true
  try {
    sessions.value = await getPatientSessions()
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
