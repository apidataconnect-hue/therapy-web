<template>
  <div class="ptb-page">
    <div class="ptb-header">
      <div class="ptb-header__info">
        <h1 class="ptb-header__title">{{ currentProfile?.therapist?.name ?? 'Mi portal' }}</h1>
        <p v-if="currentProfile?.therapist?.specialty" class="ptb-header__subtitle">
          {{ currentProfile.therapist.specialty }}
        </p>
      </div>
      <v-btn
        v-if="hasMultipleProfiles"
        variant="tonal"
        color="secondary"
        size="small"
        prepend-icon="mdi-swap-horizontal"
        @click="switchProfile"
      >
        Cambiar terapeuta
      </v-btn>
    </div>

    <div v-if="loading" class="ptb-center">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <template v-else>
      <!-- Therapist card -->
      <div v-if="currentProfile" class="ptb-therapist-card">
        <div class="ptb-therapist-card__avatar">
          <v-icon icon="mdi-account-circle" size="48" color="secondary" />
        </div>
        <div class="ptb-therapist-card__info">
          <div class="ptb-therapist-card__name">{{ currentProfile.therapist.name }}</div>
          <div v-if="currentProfile.therapist.specialty" class="ptb-therapist-card__specialty">
            {{ currentProfile.therapist.specialty }}
          </div>
          <v-chip
            size="x-small"
            variant="tonal"
            :color="statusBadgeColor(currentProfile.patientStatus)"
            class="mt-1"
          >
            {{ statusBadgeLabel(currentProfile.patientStatus) }}
          </v-chip>
        </div>
      </div>

      <!-- Quick links -->
      <div class="ptb-quick-links">
        <NuxtLink to="/patient/appointments" class="ptb-quick-link">
          <div class="ptb-quick-link__icon" style="background: #e4f5f7">
            <v-icon icon="mdi-calendar-check-outline" size="22" color="#1A7A8A" />
          </div>
          <div class="ptb-quick-link__body">
            <span class="ptb-quick-link__title">Mis citas</span>
            <span class="ptb-quick-link__desc">Ver citas programadas</span>
          </div>
          <v-icon icon="mdi-chevron-right" size="18" color="disabled" />
        </NuxtLink>
        <NuxtLink to="/patient/profile" class="ptb-quick-link">
          <div class="ptb-quick-link__icon" style="background: #F2EBF9">
            <v-icon icon="mdi-account-outline" size="22" color="#5B2A86" />
          </div>
          <div class="ptb-quick-link__body">
            <span class="ptb-quick-link__title">Mi perfil</span>
            <span class="ptb-quick-link__desc">Ver mis datos personales</span>
          </div>
          <v-icon icon="mdi-chevron-right" size="18" color="disabled" />
        </NuxtLink>
      </div>

      <!-- Upcoming appointments preview -->
      <div v-if="upcomingAppointments.length" class="ptb-section">
        <h3 class="ptb-section__title">Próximas citas</h3>
        <div class="ptb-appointments">
          <div
            v-for="apt in upcomingAppointments.slice(0, 3)"
            :key="apt.id"
            class="ptb-apt"
          >
            <div class="ptb-apt__date">
              <v-icon icon="mdi-calendar" size="18" color="secondary" class="mr-2" />
              {{ formatDate(apt.startAt) }}
            </div>
            <div class="ptb-apt__time">
              {{ formatTime(apt.startAt) }} – {{ formatTime(apt.endAt) }}
            </div>
            <div class="ptb-apt__meta">
              <v-chip
                size="x-small"
                variant="tonal"
                :color="appointmentTypeColor(apt.appointmentType)"
              >
                {{ appointmentTypeLabel(apt.appointmentType) }}
              </v-chip>
            </div>
          </div>
        </div>
        <NuxtLink v-if="upcomingAppointments.length > 3" to="/patient/appointments" class="ptb-see-all">
          Ver todas las citas
        </NuxtLink>
      </div>

      <div v-else class="ptb-empty">
        <v-icon icon="mdi-calendar-blank-outline" size="48" color="disabled" />
        <p>No tienes citas programadas</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfiles, getMyAppointments, type PatientProfile, type PatientAppointment } from '~/services/patientPortalService'

definePageMeta({ layout: 'patient', middleware: ['auth', 'role'], role: 'PATIENT', name: 'patient-mi-espacio' })

const auth = useAuthStore()
const loading = ref(true)
const profiles = ref<PatientProfile[]>([])
const appointments = ref<PatientAppointment[]>([])

const currentProfile = computed(() =>
  profiles.value.find(p => p.id === auth.selectedProfileId) ?? profiles.value[0] ?? null,
)
const hasMultipleProfiles = computed(() => profiles.value.length > 1)

const upcomingAppointments = computed(() => {
  const now = new Date().toISOString()
  return appointments.value
    .filter(a => a.startAt >= now && a.appointmentStatus !== 'cancelled')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
})

async function loadData() {
  loading.value = true
  try {
    profiles.value = await getProfiles()

    // Auto-select if only 1 profile
    if (!auth.selectedProfileId && profiles.value.length === 1) {
      auth.setProfileId(profiles.value[0].id)
    }

    if (auth.selectedProfileId) {
      appointments.value = await getMyAppointments(auth.selectedProfileId)
    }
  } catch (e) {
    console.error('[patient-home] load error', e)
  } finally {
    loading.value = false
  }
}

function switchProfile() {
  auth.setProfileId(null)
  navigateTo('/patient/select-profile')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function statusBadgeLabel(s: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo', discharged: 'Alta', archived: 'Archivado' }
  return map[s] ?? s
}
function statusBadgeColor(s: string) {
  const map: Record<string, string> = { active: 'success', inactive: 'grey', discharged: 'teal', archived: 'error' }
  return map[s] ?? 'grey'
}
function appointmentTypeLabel(t: string) {
  const map: Record<string, string> = { presencial: 'Presencial', online: 'Online', home_visit: 'Domicilio', in_person: 'Presencial' }
  return map[t] ?? t
}
function appointmentTypeColor(t: string) {
  const map: Record<string, string> = { presencial: 'primary', online: 'info', home_visit: 'secondary', in_person: 'primary' }
  return map[t] ?? 'grey'
}

onMounted(loadData)
onActivated(loadData)
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.ptb-page {
  padding: $space-5;
  max-width: 800px;
  margin: 0 auto;
}

.ptb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-5;
}

.ptb-header__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-main;
  margin: 0 0 $space-1;
}

.ptb-header__subtitle {
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin: 0;
}

.ptb-center {
  display: flex;
  justify-content: center;
  padding: $space-8 0;
}

.ptb-therapist-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-5;
  box-shadow: $shadow-xs;
}

.ptb-therapist-card__name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
}

.ptb-therapist-card__specialty {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.ptb-quick-links {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-bottom: $space-5;
}

.ptb-quick-link {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  text-decoration: none;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:hover {
    border-color: $color-secondary;
    box-shadow: 0 0 0 1px $color-secondary;
  }
}

.ptb-quick-link__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ptb-quick-link__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ptb-quick-link__title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
}

.ptb-quick-link__desc {
  font-size: $font-size-xs;
  color: $color-text-muted;
}

.ptb-section {
  margin-bottom: $space-5;
}

.ptb-section__title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  margin-bottom: $space-3;
}

.ptb-appointments {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.ptb-apt {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  box-shadow: $shadow-xs;
}

.ptb-apt__date {
  display: flex;
  align-items: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-main;
  flex: 1;
}

.ptb-apt__time {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.ptb-apt__meta {
  display: flex;
  gap: $space-2;
}

.ptb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  padding: $space-8 0;
  color: $color-text-muted;
  font-size: $font-size-sm;
}

.ptb-see-all {
  display: block;
  text-align: center;
  margin-top: $space-3;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-secondary;
  text-decoration: none;

  &:hover { text-decoration: underline; }
}
</style>
