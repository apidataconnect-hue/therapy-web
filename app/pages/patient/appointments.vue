<template>
  <div class="ptb-page">
    <div class="ptb-header">
      <h1 class="ptb-header__title">Mis citas</h1>
      <p class="ptb-header__subtitle">Historial de citas con tu terapeuta</p>
    </div>

    <div v-if="loading" class="ptb-center">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <template v-else>
      <!-- Upcoming -->
      <div v-if="upcomingAppointments.length" class="ptb-section">
        <h3 class="ptb-section__title">Próximas</h3>
        <div class="ptb-appointments">
          <div
            v-for="apt in upcomingAppointments"
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
                :prepend-icon="appointmentTypeIcon(apt.appointmentType)"
              >
                {{ appointmentTypeLabel(apt.appointmentType) }}
              </v-chip>
              <v-chip size="x-small" variant="tonal" :color="appointmentStatusColor(apt.appointmentStatus)">
                {{ appointmentStatusLabel(apt.appointmentStatus) }}
              </v-chip>
            </div>
            <v-btn
              v-if="apt.appointmentType === 'online' && apt.meetingUrl"
              size="small"
              color="secondary"
              variant="tonal"
              prepend-icon="mdi-video-outline"
              :href="apt.meetingUrl"
              target="_blank"
              class="ptb-apt__join"
            >
              Unirse
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!upcomingAppointments.length && !pastAppointments.length" class="ptb-empty">
        <v-icon icon="mdi-calendar-blank-outline" size="48" color="disabled" />
        <p>No tienes citas programadas</p>
      </div>

      <!-- Past -->
      <div v-if="pastAppointments.length" class="ptb-section">
        <button class="ptb-section__toggle" @click="showPast = !showPast">
          <h3 class="ptb-section__title">Anteriores</h3>
          <v-icon :icon="showPast ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
        </button>
        <div v-if="showPast" class="ptb-appointments">
          <div
            v-for="apt in pastAppointments"
            :key="apt.id"
            class="ptb-apt ptb-apt--past"
          >
            <div class="ptb-apt__date">
              <v-icon icon="mdi-calendar" size="18" color="grey" class="mr-2" />
              {{ formatDate(apt.startAt) }}
            </div>
            <div class="ptb-apt__time">
              {{ formatTime(apt.startAt) }} – {{ formatTime(apt.endAt) }}
            </div>
            <div class="ptb-apt__meta">
              <v-chip size="x-small" variant="tonal" :color="appointmentTypeColor(apt.appointmentType)">
                {{ appointmentTypeLabel(apt.appointmentType) }}
              </v-chip>
              <v-chip size="x-small" variant="tonal" :color="appointmentStatusColor(apt.appointmentStatus)">
                {{ appointmentStatusLabel(apt.appointmentStatus) }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfiles, getMyAppointments, type PatientAppointment } from '~/services/patientPortalService'

definePageMeta({ layout: 'patient', middleware: ['auth', 'role'], role: 'PATIENT' })

const auth = useAuthStore()
const loading = ref(true)
const appointments = ref<PatientAppointment[]>([])
const showPast = ref(false)

const upcomingAppointments = computed(() => {
  const now = new Date().toISOString()
  return appointments.value
    .filter(a => a.startAt >= now && a.appointmentStatus !== 'cancelled')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
})

const pastAppointments = computed(() => {
  const now = new Date().toISOString()
  return appointments.value
    .filter(a => a.startAt < now || a.appointmentStatus === 'cancelled')
    .sort((a, b) => b.startAt.localeCompare(a.startAt))
})

async function loadData() {
  loading.value = true
  try {
    // Ensure profile is selected
    if (!auth.selectedProfileId) {
      const profiles = await getProfiles()
      if (profiles.length === 1) {
        auth.setProfileId(profiles[0].id)
      } else if (profiles.length > 1) {
        await navigateTo('/patient/select-profile')
        return
      }
    }

    if (auth.selectedProfileId) {
      appointments.value = await getMyAppointments(auth.selectedProfileId)
    }
  } catch (e) {
    console.error('[patient-appointments] load error', e)
  } finally {
    loading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function appointmentTypeLabel(t: string) {
  const map: Record<string, string> = { presencial: 'Presencial', online: 'Online', home_visit: 'Domicilio', in_person: 'Presencial' }
  return map[t] ?? t
}
function appointmentTypeIcon(t: string) {
  const map: Record<string, string> = { presencial: 'mdi-map-marker-outline', online: 'mdi-video-outline', home_visit: 'mdi-home-outline', in_person: 'mdi-map-marker-outline' }
  return map[t] ?? 'mdi-calendar'
}
function appointmentTypeColor(t: string) {
  const map: Record<string, string> = { presencial: 'primary', online: 'info', home_visit: 'secondary', in_person: 'primary' }
  return map[t] ?? 'grey'
}
function appointmentStatusLabel(s: string) {
  const map: Record<string, string> = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistió' }
  return map[s] ?? s
}
function appointmentStatusColor(s: string) {
  const map: Record<string, string> = { scheduled: 'info', confirmed: 'success', completed: 'grey', cancelled: 'error', no_show: 'warning' }
  return map[s] ?? 'grey'
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

.ptb-section {
  margin-bottom: $space-5;
}

.ptb-section__title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  margin-bottom: $space-3;
}

.ptb-section__toggle {
  display: flex;
  align-items: center;
  gap: $space-2;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: $space-3;

  .ptb-section__title { margin-bottom: 0; }
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
  flex-wrap: wrap;

  &--past { opacity: 0.7; }
}

.ptb-apt__date {
  display: flex;
  align-items: center;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-main;
  flex: 1;
  min-width: 180px;
}

.ptb-apt__time {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.ptb-apt__meta {
  display: flex;
  gap: $space-2;
}

.ptb-apt__join {
  margin-left: auto;
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
</style>
