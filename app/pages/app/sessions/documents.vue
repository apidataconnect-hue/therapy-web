<template>
  <div>
    <h2>Mis documentos</h2>
    <v-data-table :headers="headers" :items="documents" :loading="loading" class="mt-4" />
    <div v-if="!loading && documents.length === 0">No tienes documentos disponibles.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const documents = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Nombre', value: 'name' },
  { text: 'Fecha', value: 'date' },
  { text: 'Tipo', value: 'type' },
]

onMounted(async () => {
  // TODO: implement when document service is available
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
