
<template>
  <div>
    <h2>Mi perfil</h2>
    <v-card v-if="profile">
      <v-card-title>{{ profile.firstName }} {{ profile.lastName }}</v-card-title>
      <v-card-text>
        <div><strong>Email:</strong> {{ user.email }}</div>
        <div><strong>Teléfono:</strong> {{ profile.phone || '—' }}</div>
        <div><strong>Fecha de nacimiento:</strong> {{ profile.birthDate || '—' }}</div>
        <div><strong>Activo:</strong> <v-chip :color="user.isActive ? 'green' : 'grey'" dark>{{ user.isActive ? 'Sí' : 'No' }}</v-chip></div>
      </v-card-text>
    </v-card>
    <div v-else>Cargando...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getPatientMe } from '~/services/patientService'

const auth = useAuthStore()
const user = auth.user!
const profile = ref<any>(null)

onMounted(async () => {
  try {
    profile.value = await getPatientMe()
  } catch (e) {
    // Manejar error
  }
})

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
