
<template>
  <div>
    <h2>Mi perfil</h2>
    <v-card v-if="profile">
      <v-card-title>{{ profile.person?.fullName ?? (profile.firstName ? `${profile.firstName} ${profile.lastName}` : auth.user?.name) }}</v-card-title>
      <v-card-text>
        <div><strong>Email:</strong> {{ auth.user?.email }}</div>
        <div v-if="profile.person?.phone || profile.phone"><strong>Teléfono:</strong> {{ profile.person?.phone ?? profile.phone }}</div>
        <div v-if="profile.person?.birthDate || profile.birthDate"><strong>Fecha de nacimiento:</strong> {{ profile.person?.birthDate ?? profile.birthDate }}</div>
        <div v-if="role === 'THERAPIST' && profile.licenseNumber"><strong>N.º de licencia:</strong> {{ profile.licenseNumber }}</div>
        <div v-if="role === 'THERAPIST' && profile.specialty"><strong>Especialidad:</strong> {{ profile.specialty }}</div>
        <div v-if="role === 'THERAPIST' && profile.bio"><strong>Biografía:</strong> {{ profile.bio }}</div>
      </v-card-text>
    </v-card>
    <div v-else-if="!error">Cargando...</div>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfile as getTherapistProfile } from '~/services/therapistService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const auth = useAuthStore()
const role = computed(() => auth.userRole)
const profile = ref<any>(null)
const error = ref('')

onMounted(async () => {
  try {
    if (role.value === 'THERAPIST') {
      profile.value = await getTherapistProfile()
    } else {
      profile.value = auth.user
    }
  } catch {
    error.value = 'No se pudo cargar el perfil.'
  }
})
</script>
