<template>
  <div>
    <h2>Mis documentos</h2>
    <v-data-table :headers="headers" :items="documents" :loading="loading" class="mt-4" />
    <div v-if="!loading && documents.length === 0">No tienes documentos disponibles.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPatientDocuments } from '~/services/patientService'

const documents = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Nombre', value: 'name' },
  { text: 'Fecha', value: 'date' },
  { text: 'Tipo', value: 'type' },
]

onMounted(async () => {
  loading.value = true
  try {
    documents.value = await getPatientDocuments()
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
