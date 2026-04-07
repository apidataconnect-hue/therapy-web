<template>
  <div class="select-profile-page">
    <div class="select-profile-wrap">
      <!-- Branding -->
      <div class="select-profile-brand">
        <div class="select-profile-brand__logo">
          <v-icon icon="mdi-heart-pulse" color="white" size="22" />
        </div>
        <span class="select-profile-brand__name">TherapyWeb</span>
      </div>

      <v-card class="select-profile-card" elevation="0">
        <div class="select-profile-card__header">
          <h1 class="select-profile-card__title">Elige tu terapeuta</h1>
          <p class="select-profile-card__subtitle">Selecciona con qué terapeuta deseas continuar</p>
        </div>

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="text-center py-8">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-3" />
          <p class="text-medium-emphasis">{{ error }}</p>
        </div>

        <div v-else class="select-profile-grid">
          <v-card
            v-for="profile in profiles"
            :key="profile.id"
            class="select-profile-item"
            variant="outlined"
            rounded="lg"
            @click="selectProfile(profile)"
          >
            <div class="select-profile-item__avatar">
              <v-icon icon="mdi-account-circle" size="40" color="secondary" />
            </div>
            <div class="select-profile-item__info">
              <div class="select-profile-item__name">{{ profile.therapist.name }}</div>
              <div v-if="profile.therapist.specialty" class="select-profile-item__specialty">
                {{ profile.therapist.specialty }}
              </div>
            </div>
            <v-chip size="x-small" variant="tonal" :color="statusColor(profile.patientStatus)" class="mr-2">
              {{ statusLabel(profile.patientStatus) }}
            </v-chip>
            <v-icon icon="mdi-chevron-right" size="20" color="grey" />
          </v-card>
        </div>
      </v-card>

      <div class="select-profile-back">
        <a class="select-profile-back__link" @click="doLogout">
          <v-icon icon="mdi-logout-variant" size="14" />
          Cerrar sesión
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfiles, type PatientProfile } from '~/services/patientPortalService'
import { logout as apiLogout } from '~/services/authService'

definePageMeta({ layout: false, middleware: ['auth', 'role'], role: 'PATIENT' })

const auth = useAuthStore()
const profiles = ref<PatientProfile[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    profiles.value = await getProfiles()
    if (profiles.value.length === 0) {
      error.value = 'No tienes ningún terapeuta vinculado.'
    } else if (profiles.value.length === 1) {
      selectProfile(profiles.value[0])
    }
  } catch {
    error.value = 'No se pudieron cargar los perfiles. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
})

function statusLabel(s: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo', discharged: 'Alta', archived: 'Archivado' }
  return map[s] ?? s
}
function statusColor(s: string) {
  const map: Record<string, string> = { active: 'success', inactive: 'grey', discharged: 'teal', archived: 'error' }
  return map[s] ?? 'grey'
}

async function selectProfile(profile: PatientProfile) {
  auth.setProfileId(profile.id)
  await navigateTo('/patient')
}

async function doLogout() {
  await apiLogout()
  auth.clearAuth()
  await navigateTo('/login')
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.select-profile-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-background;
  padding: $space-5;
}

.select-profile-wrap {
  width: 100%;
  max-width: 520px;
}

.select-profile-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  margin-bottom: $space-6;
}

.select-profile-brand__logo {
  width: 40px;
  height: 40px;
  background: $color-primary;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-profile-brand__name {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
}

.select-profile-card {
  padding: $space-6;
  border: 1px solid $color-border !important;
  border-radius: $radius-xl !important;
  box-shadow: $shadow-md !important;
  background: $color-surface;
}

.select-profile-card__header {
  text-align: center;
  margin-bottom: $space-5;
}

.select-profile-card__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  letter-spacing: -0.01em;
  margin-bottom: $space-1;
}

.select-profile-card__subtitle {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin: 0;
}

.select-profile-grid {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.select-profile-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4;
  cursor: pointer;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:hover {
    border-color: $color-secondary !important;
    box-shadow: 0 0 0 1px $color-secondary;
  }
}

.select-profile-item__info {
  flex: 1;
}

.select-profile-item__name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
}

.select-profile-item__specialty {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.select-profile-back {
  text-align: center;
  margin-top: $space-4;
}

.select-profile-back__link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  font-size: $font-size-sm;
  color: $color-text-muted;
  text-decoration: none;
  cursor: pointer;

  &:hover { color: $color-text-main; }
}
</style>
