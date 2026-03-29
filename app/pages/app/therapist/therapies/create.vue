<template>
  <div>
    <h2>Crear terapia</h2>
    <v-form @submit.prevent="onCreate">
      <v-text-field v-model="form.patientId" label="ID Paciente" required />
      <v-text-field v-model="form.name" label="Nombre de la terapia" required />
      <v-text-field v-model="form.startDate" label="Fecha inicio" type="date" required />
      <v-text-field v-model="form.status" label="Estado" required />
      <v-btn type="submit" color="primary">Crear terapia</v-btn>
    </v-form>
    <div v-if="success">Terapia creada correctamente.</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { createTherapistTherapy } from '~/services/therapistService' // Implementar

const form = ref({ patientId: '', name: '', startDate: '', status: '' })
const success = ref(false)
const error = ref('')

async function onCreate() {
  try {
    // await createTherapistTherapy(form.value)
    success.value = true
    error.value = ''
  } catch (e) {
    error.value = 'No se pudo crear la terapia.'
  }
}

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
