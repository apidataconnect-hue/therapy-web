
<template>
  <div>
    <h2>Panel principal</h2>
    <div v-if="role === 'THERAPIST'">
      <v-card class="mb-4">
        <v-card-title>Gestión de pacientes</v-card-title>
        <v-card-text>
          <NuxtLink to="/app/patients">Ver pacientes vinculados</NuxtLink>
        </v-card-text>
      </v-card>
      <!-- Aquí puedes añadir más widgets para el terapeuta -->
    </div>
    <div v-else-if="role === 'PATIENT'">
      <v-card class="mb-4">
        <v-card-title>Mi información</v-card-title>
        <v-card-text>
          <NuxtLink to="/app/profile">Ver mi perfil</NuxtLink>
        </v-card-text>
      </v-card>
      <!-- Aquí puedes añadir widgets para el paciente -->
    </div>
    <div v-else-if="role === 'ADMIN'">
      <v-card class="mb-4">
        <v-card-title>Panel de administración</v-card-title>
        <v-card-text>
          <!-- Accesos de admin -->
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const role = auth.userRole

definePageMeta({
  middleware: ['auth'],
})
</script>
