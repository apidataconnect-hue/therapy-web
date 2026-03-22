<template>
  <div>
    <h2>Invitar paciente</h2>
    <v-form @submit.prevent="onInvite">
      <v-text-field v-model="firstName" label="Nombre" required />
      <v-text-field v-model="lastName" label="Apellidos" required />
      <v-text-field v-model="email" label="Email" type="email" required />
      <v-text-field v-model="phone" label="Teléfono (opcional)" />
      <v-textarea v-model="internalNotes" label="Nota interna (opcional)" />
      <v-btn type="submit" color="primary">Enviar invitación</v-btn>
    </v-form>
    <div v-if="success">Invitación enviada correctamente.</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { invitePatient } from '~/services/invitationService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const internalNotes = ref('')
const success = ref(false)
const error = ref('')

async function onInvite() {
  try {
    await invitePatient({ firstName: firstName.value, lastName: lastName.value, email: email.value, phone: phone.value, internalNotes: internalNotes.value })
    success.value = true
    error.value = ''
  } catch (e) {
    error.value = 'No se pudo enviar la invitación.'
  }
}
</script>
