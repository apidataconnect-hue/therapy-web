<template>
  <div>
    <h2>Mis sesiones</h2>
    <v-data-table :headers="headers" :items="sessions" :loading="loading" class="mt-4" />
    <div v-if="!loading && sessions.length === 0">No tienes sesiones registradas.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sessions = ref<any[]>([])
const loading = ref(false)
const headers = [
  { text: 'Fecha', value: 'date' },
  { text: 'Estado', value: 'status' },
  { text: 'Notas', value: 'notes' },
]

// TODO: implement when patient session service is available

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
