<template>
  <div>
    <h2>Mis terapias</h2>
    <v-data-table :headers="headers" :items="therapies" :loading="loading" class="mt-4" />
    <div v-if="!loading && therapies.length === 0">No tienes terapias registradas.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { getPatientTherapies } from '~/services/patientService' // Implementar en el futuro

const therapies = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Nombre', value: 'name' },
  { text: 'Estado', value: 'status' },
  { text: 'Fecha inicio', value: 'startDate' },
]

onMounted(async () => {
  loading.value = true
  try {
    // therapies.value = await getPatientTherapies()
    therapies.value = [] // Placeholder
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
