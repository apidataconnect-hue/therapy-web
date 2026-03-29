

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Therapy Web</v-toolbar-title>
      <v-spacer />
      <template v-if="role === 'THERAPIST'">
        <v-btn text to="/app/dashboard">Panel</v-btn>
        <v-btn text to="/app/patients">Pacientes</v-btn>
        <v-btn text to="/app/therapist/sessions">Sesiones</v-btn>
        <v-btn text to="/app/therapist/therapies">Terapias</v-btn>
        <v-btn text to="/app/profile">Perfil</v-btn>
      </template>
      <template v-else-if="role === 'PATIENT'">
        <v-btn text to="/app/dashboard">Inicio</v-btn>
        <v-btn text to="/app/sessions">Sesiones</v-btn>
        <v-btn text to="/app/therapies">Terapias</v-btn>
        <v-btn text to="/app/profile">Mi perfil</v-btn>
      </template>
      <template v-else-if="role === 'ADMIN'">
        <v-btn text to="/app/dashboard">Panel Admin</v-btn>
        <!-- Otros enlaces de admin -->
      </template>
      <v-btn text @click="logout">Salir</v-btn>
    </v-app-bar>
    <v-main>
      <slot />
      <NotificationBar
        v-if="notification && showNotification"
        :model-value="showNotification"
        :message="notification.message"
        :color="notification.color || 'info'"
        :timeout="notification.timeout || 4000"
        @update:model-value="closeNotification"
      />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">

import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { logout as apiLogout } from '~/services/authService'
import { useNotificationStore } from '~/stores/notification'
import NotificationBar from '~/components/notifications/NotificationBar.vue'

const auth = useAuthStore()
const router = useRouter()
const role = auth.userRole
const notificationStore = useNotificationStore()
const notification = notificationStore.notification
const showNotification = notificationStore.show

function closeNotification() {
  notificationStore.close()
}

async function logout() {
  await apiLogout()
  auth.clearAuth()
  router.push('/login')
}
</script>
