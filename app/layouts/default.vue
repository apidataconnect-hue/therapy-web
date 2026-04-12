

<template>
  <v-app>
    <!-- === THERAPIST SIDEBAR === -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      :expand-on-hover="rail"
      permanent
      class="nav-drawer"
      width="240"
    >
      <!-- Logo / Branding -->
      <div class="nav-brand">
        <div class="nav-brand__logo">
          <v-icon icon="mdi-heart-pulse" color="white" size="22" />
        </div>
        <Transition name="fade">
          <div v-if="!rail" class="nav-brand__text">
            <span class="nav-brand__name">TherapyWeb</span>
          </div>
        </Transition>
        <v-btn
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          density="compact"
          class="nav-brand__toggle"
          @click="rail = !rail"
        />
      </div>

      <v-divider class="nav-divider" />

      <!-- Navegación por rol -->
      <v-list density="compact" nav class="nav-list">
        <!-- THERAPIST -->
        <template v-if="role === 'THERAPIST'">
          <div v-if="!rail" class="nav-section-label">Gestión</div>
          <v-list-item
            v-for="item in therapistNav"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.label"
            class="nav-item"
            active-class="nav-item--active"
          />
        </template>
      </v-list>

      <template #append>
        <v-divider class="nav-divider" />
        <v-list density="compact" nav class="nav-list">
          <v-list-item
            to="/app/profile"
            prepend-icon="mdi-account-circle-outline"
            title="Mi perfil"
            class="nav-item"
            active-class="nav-item--active"
          />
          <v-list-item
            v-if="role === 'THERAPIST'"
            to="/app/therapist/settings"
            prepend-icon="mdi-cog-outline"
            title="Configuración"
            class="nav-item"
            active-class="nav-item--active"
          />
          <v-list-item
            prepend-icon="mdi-logout-variant"
            title="Cerrar sesión"
            class="nav-item nav-item--logout"
            @click="logout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main class="app-main">
      <slot />
    </v-main>

    <!-- Notificaciones -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { logout as apiLogout } from '~/services/authService'
import { useNotificationStore } from '~/stores/notification'
import NotificationBar from '~/components/notifications/NotificationBar.vue'

const auth = useAuthStore()
const router = useRouter()
const role = computed(() => auth.userRole)
const notificationStore = useNotificationStore()
const notification = computed(() => notificationStore.notification)
const showNotification = computed(() => notificationStore.show)
const drawer = ref(true)
const rail = ref(false)

const therapistNav = [
  { to: '/app/therapist/calendar',        icon: 'mdi-calendar-month-outline',  label: 'Agenda' },
  { to: '/app/patients',                  icon: 'mdi-account-group-outline',    label: 'Pacientes' },
  { to: '/app/therapist/therapies',       icon: 'mdi-clipboard-pulse-outline', label: 'Terapias' },
  { to: '/app/dashboard',                 icon: 'mdi-view-dashboard-outline',  label: 'Panel' },
  { to: '/app/therapist/ai-templates',    icon: 'mdi-creation-outline',        label: 'Plantillas IA' },
]

function closeNotification() {
  notificationStore.close()
}

async function logout() {
  await apiLogout()
  auth.clearAuth()
  router.push('/login')
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.nav-drawer {
  background: $color-surface !important;
  border-right: 1px solid $color-border !important;
}

.nav-brand {
  display: flex;
  align-items: center;
  padding: 14px $space-3;
  gap: $space-2;
  min-height: 64px;
}

.nav-brand__logo {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: $color-primary;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-brand__text {
  flex: 1;
  overflow: hidden;
}

.nav-brand__name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nav-brand__toggle {
  color: $color-text-muted !important;
  margin-left: auto;
}

.nav-divider {
  border-color: $color-divider !important;
  margin: 0 $space-3;
}

.nav-list {
  padding: $space-2 $space-1 !important;
}

.nav-section-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-text-muted;
  padding: $space-3 $space-3 $space-1;
}

:deep(.nav-item) {
  border-radius: $radius-md !important;
  color: $color-text-secondary !important;
  margin: 1px 0;
  transition: background $transition-fast, color $transition-fast;

  &:hover {
    background: $color-hover !important;
    color: $color-text-main !important;

    .v-icon { opacity: 1; }
  }

  .v-list-item-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .v-icon { opacity: 0.65; }
}

:deep(.nav-item--active) {
  background: $color-primary-subtle !important;
  color: $color-primary !important;
  box-shadow: inset 3px 0 0 $color-primary;

  .v-icon { opacity: 1; color: $color-primary !important; }
}

:deep(.nav-item--logout) {
  &:hover {
    background: $color-error-subtle !important;
    color: $color-error !important;

    .v-icon { opacity: 1; color: $color-error !important; }
  }
}

.app-main {
  background: $color-background;
}

.fade-enter-active,
.fade-leave-active { transition: opacity $transition-fast; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }
</style>

