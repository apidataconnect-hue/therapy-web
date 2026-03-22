<template>
  <div>
    <h2>Crear sesión</h2>
    <v-form @submit.prevent="onCreate">
      <v-text-field v-model="form.patientId" label="ID Paciente" required />
      <v-text-field v-model="form.date" label="Fecha" type="date" required />
      <v-text-field v-model="form.status" label="Estado" required />
      <v-textarea v-model="form.notes" label="Notas" />
      <v-btn type="submit" color="primary">Crear sesión</v-btn>
    </v-form>
    <div v-if="success">Sesión creada correctamente.</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { createTherapistSession } from '~/services/therapistService' // Implementar

const form = ref({ patientId: '', date: '', status: '', notes: '' })
const success = ref(false)
const error = ref('')

async function onCreate() {
  try {
    // await createTherapistSession(form.value)
    success.value = true
    error.value = ''
  } catch (e) {
    error.value = 'No se pudo crear la sesión.'
  }
}

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
