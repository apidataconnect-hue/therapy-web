<template>
  <v-app>
    <v-app-bar flat class="ptb-navbar">
      <div class="ptb-navbar__brand">
        <div class="ptb-navbar__logo">
          <v-icon icon="mdi-heart-pulse" color="white" size="20" />
        </div>
        <span class="ptb-navbar__name">TherapyWeb</span>
      </div>

      <div class="ptb-navbar__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="ptb-navbar__link"
          active-class="ptb-navbar__link--active"
        >
          <v-icon :icon="link.icon" size="18" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </div>

      <v-spacer />

      <v-btn
        icon
        variant="text"
        class="ptb-navbar__avatar"
      >
        <v-icon icon="mdi-account-circle-outline" size="28" />
        <v-menu activator="parent" :close-on-content-click="true">
          <v-list density="compact" min-width="200">
            <v-list-item
              prepend-icon="mdi-account-outline"
              title="Mi perfil"
              @click="router.push('/patient/profile')"
            />
            <v-list-item
              v-if="hasMultipleProfiles"
              prepend-icon="mdi-swap-horizontal"
              title="Cambiar terapeuta"
              @click="switchProfile"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Cerrar sesión"
              base-color="error"
              @click="doLogout"
            />
          </v-list>
        </v-menu>
      </v-btn>
    </v-app-bar>

    <v-main class="ptb-main">
      <slot />
    </v-main>

    <NotificationBar
      v-if="notification && showNotification"
      :model-value="showNotification"
      :message="notification.message"
      :color="notification.color || 'info'"
      :timeout="notification.timeout || 4000"
      @update:model-value="closeNotification"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { logout as apiLogout } from '~/services/authService'
import { useNotificationStore } from '~/stores/notification'
import NotificationBar from '~/components/notifications/NotificationBar.vue'

const auth = useAuthStore()
const router = useRouter()
const notificationStore = useNotificationStore()
const notification = computed(() => notificationStore.notification)
const showNotification = computed(() => notificationStore.show)
const menuOpen = ref(false)
const hasMultipleProfiles = ref(false)

// Check for multiple profiles
import('~/services/patientPortalService').then(({ getProfiles }) => {
  getProfiles().then(profiles => {
    hasMultipleProfiles.value = profiles.length > 1
  }).catch(() => {})
})

const navLinks = [
  { to: '/patient', icon: 'mdi-home-outline', label: 'Inicio' },
  { to: '/patient/mi-espacio', icon: 'mdi-view-dashboard-outline', label: 'Mi espacio' },
  { to: '/patient/calendar', icon: 'mdi-calendar-month-outline', label: 'Agenda' },
  { to: '/patient/appointments', icon: 'mdi-calendar-check-outline', label: 'Citas' },
]

function closeNotification() {
  notificationStore.close()
}

function switchProfile() {
  auth.setProfileId(null)
  router.push('/patient/select-profile')
}

async function doLogout() {
  await apiLogout()
  auth.clearAuth()
  router.push('/login')
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.ptb-navbar {
  background: $color-surface !important;
  border-bottom: 1px solid $color-border !important;
  box-shadow: none !important;
  padding: 0 $space-4;
}

.ptb-navbar__brand {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.ptb-navbar__logo {
  width: 32px;
  height: 32px;
  background: $color-secondary;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ptb-navbar__name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
}

.ptb-navbar__nav {
  display: flex;
  align-items: center;
  gap: $space-1;
  margin-left: $space-6;
}

.ptb-navbar__link {
  display: flex;
  align-items: center;
  gap: $space-1;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  text-decoration: none;
  transition: background $transition-fast, color $transition-fast;

  &:hover {
    background: $color-hover;
    color: $color-text-main;
  }

  &--active {
    background: $color-secondary-subtle;
    color: $color-secondary;

    .v-icon { color: $color-secondary; }
  }
}

.ptb-navbar__avatar {
  color: $color-text-secondary !important;
}

.ptb-main {
  background: $color-background;
}
</style>
