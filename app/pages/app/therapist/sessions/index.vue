<template>
  <div class="ss-page">

    <!-- Header -->
    <div class="ss-page__header">
      <div>
        <div class="ss-page__title-wrap">
          <v-icon icon="mdi-calendar-check-outline" size="26" color="primary" class="mr-2" />
          <span class="ss-page__title">Sesiones</span>
        </div>
        <p class="ss-page__subtitle">Historial de citas y sesiones con tus pacientes</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-calendar-plus-outline"
        size="small"
        to="/app/therapist/calendar"
      >
        Nueva cita
      </v-btn>
    </div>

    <!-- Toolbar -->
    <div class="ss-page__toolbar">
      <v-text-field
        v-model="search"
        placeholder="Buscar por paciente…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="ss-search"
      />
      <v-tabs v-model="tab" color="primary" density="compact" class="ss-tabs">
        <v-tab value="upcoming">
          Próximas
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'upcoming' ? 'primary' : undefined">
            {{ counts.upcoming }}
          </v-chip>
        </v-tab>
        <v-tab value="completed">
          Pasadas
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'completed' ? 'primary' : undefined">
            {{ counts.completed }}
          </v-chip>
        </v-tab>
        <v-tab value="cancelled">
          Canceladas
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'cancelled' ? 'primary' : undefined">
            {{ counts.cancelled }}
          </v-chip>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ss-page__loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <template v-else>
      <!-- Empty -->
      <div v-if="filteredList.length === 0" class="ss-page__empty">
        <v-icon icon="mdi-calendar-blank-outline" size="52" color="disabled" />
        <p class="mt-3 text-medium-emphasis">
          {{ search ? 'Sin resultados para tu búsqueda.' : 'No hay sesiones en este apartado.' }}
        </p>
      </div>

      <!-- Session cards -->
      <div v-else class="ss-list">
        <div
          v-for="s in filteredList"
          :key="s.id"
          class="ss-card"
          role="button"
          tabindex="0"
          @click="router.push({ path: `/app/therapist/sessions/${s.id}`, query: { patientName: s.patientName ?? '' } })"
          @keyup.enter="router.push({ path: `/app/therapist/sessions/${s.id}`, query: { patientName: s.patientName ?? '' } })"
        >
          <!-- Left status bar -->
          <div class="ss-card__bar" :class="`ss-card__bar--${s.appointmentStatus}`" />

          <!-- Date block -->
          <div class="ss-card__date">
            <span class="ss-card__date-day">{{ dayOf(s.startAt) }}</span>
            <span class="ss-card__date-month">{{ monthOf(s.startAt) }}</span>
          </div>

          <!-- Main info -->
          <div class="ss-card__info">
            <div class="ss-card__patient">{{ s.patientName }}</div>
            <div class="ss-card__meta">
              <span class="ss-card__time">
                <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                {{ timeRange(s.startAt, s.endAt) }}
              </span>
              <span class="ss-type-badge">
                <v-icon :icon="TYPE_ICONS[s.appointmentType] ?? 'mdi-calendar-outline'" size="11" class="mr-1" />
                {{ TYPE_LABELS[s.appointmentType] ?? s.appointmentType }}
              </span>
              <span v-if="s.notes" class="ss-card__notes-icon" title="Tiene notas">
                <v-icon icon="mdi-note-text-outline" size="13" />
              </span>
            </div>
          </div>

          <!-- Status + chevron -->
          <div class="ss-card__right">
            <span class="ss-status" :class="`ss-status--${s.appointmentStatus}`">
              {{ STATUS_LABELS[s.appointmentStatus] ?? s.appointmentStatus }}
            </span>
            <v-icon icon="mdi-chevron-right" size="18" color="disabled" class="ss-card__chevron" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getTherapistSessions } from '~/services/therapistService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const router = useRouter()
const sessions = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const tab = ref('upcoming')

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show:   'No asistió',
}

const TYPE_LABELS: Record<string, string> = {
  in_person:  'Presencial',
  online:     'Online',
  phone:      'Teléfono',
  home_visit: 'Domicilio',
}

const TYPE_ICONS: Record<string, string> = {
  in_person:  'mdi-account-outline',
  online:     'mdi-video-outline',
  phone:      'mdi-phone-outline',
  home_visit: 'mdi-home-outline',
}

function dayOf(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit' })
}
function monthOf(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
}
function timeRange(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fmt(start)} – ${fmt(end)}`
}

function isUpcoming(s: any) {
  return (s.appointmentStatus === 'scheduled' || s.appointmentStatus === 'confirmed')
    && new Date(s.endAt) > new Date()
}
function isPast(s: any) {
  return (s.appointmentStatus === 'scheduled' || s.appointmentStatus === 'confirmed')
    && new Date(s.endAt) <= new Date()
}

function byDate(a: any, b: any, asc: boolean) {
  const diff = new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  return asc ? diff : -diff
}

const byTab = computed(() => {
  if (tab.value === 'upcoming')
    return sessions.value.filter(s => isUpcoming(s)).sort((a, b) => byDate(a, b, true))
  if (tab.value === 'completed')
    return sessions.value.filter(s => s.appointmentStatus === 'completed' || isPast(s)).sort((a, b) => byDate(a, b, false))
  if (tab.value === 'cancelled')
    return sessions.value.filter(s => s.appointmentStatus === 'cancelled' || s.appointmentStatus === 'no_show').sort((a, b) => byDate(a, b, false))
  return sessions.value
})

const filteredList = computed(() => {
  let list = byTab.value
  const q = search.value.toLowerCase().trim()
  if (q) list = list.filter(s => (s.patientName ?? '').toLowerCase().includes(q))
  return list
})

const counts = computed(() => ({
  upcoming:  sessions.value.filter(s => isUpcoming(s)).length,
  completed: sessions.value.filter(s => s.appointmentStatus === 'completed' || isPast(s)).length,
  cancelled: sessions.value.filter(s => s.appointmentStatus === 'cancelled' || s.appointmentStatus === 'no_show').length,
}))

onMounted(loadSessions)
onActivated(loadSessions)

async function loadSessions() {
  loading.value = true
  try {
    const sessionsResult = await getTherapistSessions()
    sessions.value = (sessionsResult.items ?? []).map((s: any) => ({
      ...s,
      patientName: s.patientName ?? s.patientId,
      appointmentStatus: s.appointmentStatus ?? s.status,
    }))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

// ── Page ─────────────────────────────────────────────────────────────────────
.ss-page {
  padding: $space-5;
  max-width: 860px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $space-4;
    margin-bottom: $space-5;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: $space-1;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    letter-spacing: -0.01em;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0;
  }

  &__toolbar {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    margin-bottom: $space-4;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: $space-8 0;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $space-8 0;
    color: $color-text-muted;
  }
}

.ss-search { max-width: 360px; }
.ss-tabs   { border-bottom: 1px solid $color-border; }

// ── List ─────────────────────────────────────────────────────────────────────
.ss-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

// ── Card ─────────────────────────────────────────────────────────────────────
.ss-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-3 $space-4;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow $transition-fast, border-color $transition-fast;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: $shadow-md;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  &__bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: $radius-lg 0 0 $radius-lg;
    background: $color-border;

    &--scheduled { background: rgb(var(--v-theme-primary)); }
    &--confirmed { background: #3b82f6; }
    &--completed { background: var(--cal-event-completed, #2E8B57); }
    &--cancelled { background: $color-text-muted; }
    &--no_show   { background: $color-warning; }
  }

  &__date {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 38px;
    margin-left: $space-3;

    &-day {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $color-text-main;
      line-height: 1;
    }

    &-month {
      font-size: $font-size-xs;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: $color-text-muted;
    }
  }

  &__info  { flex: 1; min-width: 0; }

  &__patient {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-top: 3px;
    flex-wrap: wrap;
  }

  &__time {
    display: flex;
    align-items: center;
    font-size: $font-size-xs;
    color: $color-text-muted;
  }

  &__notes-icon {
    display: flex;
    align-items: center;
    color: $color-text-muted;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-shrink: 0;
  }

  &__chevron { color: $color-text-muted; }
}

// ── Type badge ────────────────────────────────────────────────────────────────
.ss-type-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: $font-weight-medium;
  padding: 1px 7px;
  border-radius: $radius-full;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  letter-spacing: 0.02em;
}

// ── Status pill ───────────────────────────────────────────────────────────────
.ss-status {
  flex-shrink: 0;
  display: inline-block;
  font-size: 0.68rem;
  font-weight: $font-weight-semibold;
  padding: 2px 10px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--scheduled { background: rgba(var(--v-theme-primary), 0.1);  color: rgb(var(--v-theme-primary)); }
  &--confirmed { background: rgba(#3b82f6, 0.1);                 color: #1d4ed8; }
  &--completed { background: rgba(#22c55e, 0.12);                color: #15803d; }
  &--cancelled { background: rgba($color-text-muted, 0.12);      color: $color-text-secondary; }
  &--no_show   { background: rgba($color-warning, 0.12);         color: $color-warning; }
}
</style>
