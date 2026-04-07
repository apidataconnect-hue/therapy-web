<template>
  <div class="cal-page">
    <div class="cal-page__header">
      <div>
        <div class="cal-page__title-wrap">
          <v-icon icon="mdi-calendar-month-outline" color="secondary" size="22" class="mr-2" />
          <h2 class="cal-page__title">Mi agenda</h2>
        </div>
        <p class="cal-page__subtitle">Visualiza tus citas programadas</p>
      </div>
    </div>

    <div v-if="loading" class="cal-page__center">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <div v-else class="cal-page__body">
      <PatientCalendar :events="calendarEvents" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { getProfiles, getMyAppointments, type PatientAppointment } from '~/services/patientPortalService'
import PatientCalendar from '~/components/calendar/PatientCalendar.vue'

definePageMeta({ layout: 'patient', middleware: ['auth', 'role'], role: 'PATIENT' })

const auth = useAuthStore()
const loading = ref(true)
const appointments = ref<PatientAppointment[]>([])

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#5B86E5',
  confirmed: '#2E8B57',
  completed: '#9E9E9E',
  cancelled: '#C0392B',
  no_show:   '#D97706',
}

const calendarEvents = computed(() =>
  appointments.value.map(apt => ({
    id: apt.id,
    title: apt.therapist?.name ?? apt.appointmentType,
    start: apt.startAt,
    end: apt.endAt,
    color: STATUS_COLORS[apt.appointmentStatus] ?? '#5B86E5',
    extendedProps: {
      appointmentType: apt.appointmentType,
      status: apt.appointmentStatus,
      therapistName: apt.therapist?.name ?? '',
    },
  })),
)

async function loadData() {
  loading.value = true
  try {
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
    console.error('[patient-calendar] load error', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
onActivated(loadData)
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.cal-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: $space-5 $space-6;
  background: $color-background;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
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
    line-height: 1;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0;
    padding-left: 34px;
  }

  &__center {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  &__body {
    flex: 1;
    min-height: 0;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    padding: $space-4;
    overflow: hidden;
    box-shadow: $shadow-sm;
  }
}

// ── FullCalendar overrides (month view) ───────────────────────────────────────

:deep(.fc) {
  font-family: $font-family;
  font-size: $font-size-sm;
  color: $color-text-main;
  height: 100%;
}

:deep(.fc .fc-toolbar) {
  padding: 0 $space-1 $space-4;
  gap: $space-3;
  flex-wrap: wrap;
}

:deep(.fc-toolbar-title) {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  text-transform: capitalize;
  letter-spacing: -0.01em;
}

:deep(.fc .fc-button) {
  background: transparent !important;
  border: 1px solid $color-border !important;
  color: $color-text-secondary !important;
  font-weight: $font-weight-medium !important;
  font-size: $font-size-sm !important;
  font-family: $font-family !important;
  border-radius: $radius-md !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  padding: 5px 14px !important;
  box-shadow: none !important;
  outline: none !important;
  transition: all $transition-fast !important;

  &:hover:not(:disabled) {
    background: $color-hover !important;
    border-color: $color-secondary !important;
    color: $color-secondary !important;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(var(--v-theme-secondary), 0.2) !important;
  }

  &.fc-button-active {
    background: $color-secondary !important;
    border-color: $color-secondary !important;
    color: #fff !important;
  }

  &:disabled {
    opacity: 0.4 !important;
    cursor: not-allowed !important;
  }
}

:deep(.fc .fc-button-group) {
  gap: 6px;
  box-shadow: none;
}

:deep(.fc-col-header) {
  background: $color-background;
}

:deep(.fc-col-header-cell) {
  border-bottom: 2px solid $color-border !important;
}

:deep(.fc-col-header-cell-cushion) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: $space-2 $space-2 !important;
  text-decoration: none !important;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion) {
  color: $color-secondary;
  font-weight: $font-weight-semibold;
}

:deep(.fc-day-today) {
  background: rgba($color-secondary, 0.04) !important;
}

:deep(.fc-event) {
  border-radius: $radius-md !important;
  border: none !important;
  cursor: default !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15) !important;
  transition: filter $transition-fast, box-shadow $transition-fast !important;

  &:hover {
    filter: brightness(1.07) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18) !important;
  }
}

:deep(.fc-event-main) {
  padding: 3px 7px !important;
  overflow: hidden;
}

:deep(.fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-scrollgrid td),
:deep(.fc-scrollgrid th) {
  border-color: $color-divider !important;
}

:deep(.fc-daygrid-day-number) {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
  text-decoration: none !important;
  padding: $space-1 $space-2 !important;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  transition: background $transition-fast;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background: $color-secondary;
  color: #fff;
}

:deep(.fc-daygrid-more-link) {
  color: $color-secondary;
  font-weight: $font-weight-medium;
  font-size: $font-size-xs;
}
</style>
