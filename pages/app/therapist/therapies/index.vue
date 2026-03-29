<template>
  <div>
    <h2>Terapias de mis pacientes</h2>
    <v-data-table :headers="headers" :items="therapies" :loading="loading" class="mt-4" />
    <div v-if="!loading && therapies.length === 0">No hay terapias registradas.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTherapistTherapies } from '~/services/therapistService'

const therapies = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Paciente', value: 'patientName' },
  { text: 'Nombre', value: 'name' },
  { text: 'Estado', value: 'status' },
  { text: 'Fecha inicio', value: 'startDate' },
]

onMounted(async () => {
  loading.value = true
  try {
    therapies.value = await getTherapistTherapies()
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
