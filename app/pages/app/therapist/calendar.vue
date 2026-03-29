<template>
  <div class="cal-page">

    <!-- Page header -->
    <div class="cal-page__header">
      <div>
        <div class="cal-page__title-wrap">
          <v-icon icon="mdi-calendar-month-outline" color="primary" size="22" class="mr-2" />
          <h2 class="cal-page__title">Agenda</h2>
        </div>
        <p class="cal-page__subtitle">Gestiona tus citas y sesiones</p>
      </div>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" rounded="lg" @click="onNewAppointment">
        Nueva cita
      </v-btn>
    </div>

    <!-- Calendar -->
    <div class="cal-page__body">
      <TherapistCalendar
        :events="events"
        :editable="true"
        initial-view="timeGridWeek"
        @eventClick="onEventClick"
        @dateClick="onDateClick"
        @eventDrop="onEventDrop"
        @eventResize="onEventResize"
        @patientNavigate="onPatientNavigate"
      />
    </div>

    <!-- Modal crear / editar cita -->
    <v-dialog v-model="showModal" max-width="560">
      <v-card class="cal-dialog">
        <div class="cal-dialog__head" :class="form.id ? '' : 'cal-dialog__head--new'">
          <v-icon :icon="form.id ? 'mdi-calendar-edit-outline' : 'mdi-calendar-plus-outline'" size="20" class="mr-2" />
          <span class="cal-dialog__head-title">{{ modalTitle }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="showModal = false" />
        </div>
        <v-divider />
        <v-card-text class="pa-5">
          <v-form ref="formRef" @submit.prevent="onSave">
            <v-select
              v-model="form.appointmentType"
              :items="appointmentTypes"
              item-title="label"
              item-value="value"
              label="Tipo de cita"
              prepend-inner-icon="mdi-tag-outline"
              required
              class="mb-3"
            />
            <v-autocomplete
              v-if="!form.id"
              v-model="form.patientId"
              :items="patients"
              item-title="fullName"
              item-value="id"
              label="Paciente"
              prepend-inner-icon="mdi-account-outline"
              required
              class="mb-3"
            />
            <div class="cal-dialog__dates">
              <v-text-field v-model="form.start" label="Inicio" type="datetime-local" prepend-inner-icon="mdi-clock-start" required />
              <v-text-field v-model="form.end" label="Fin" type="datetime-local" prepend-inner-icon="mdi-clock-end" required />
            </div>
            <v-text-field v-model="form.locationText" label="Lugar (opcional)" prepend-inner-icon="mdi-map-marker-outline" class="mb-3" />
            <v-autocomplete
              v-model="form.processId"
              :items="processes"
              item-title="reasonForConsultation"
              item-value="id"
              label="Proceso terapéutico (opcional)"
              prepend-inner-icon="mdi-brain"
              clearable
              class="mb-3"
              no-data-text="Sin procesos disponibles para este paciente"
            />
            <v-textarea v-model="form.notes" label="Notas" prepend-inner-icon="mdi-text" rows="2" auto-grow />
            <v-textarea
              v-if="form.status === 'cancelled'"
              :model-value="form.cancelReason"
              label="Motivo de cancelación"
              prepend-inner-icon="mdi-cancel"
              rows="2"
              readonly
              variant="outlined"
              class="mt-3"
              :placeholder="form.cancelReason ? '' : 'Sin motivo indicado'"
            />
          </v-form>
          <v-alert v-if="formError" type="error" density="compact" variant="tonal" class="mt-3">{{ formError }}</v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <!-- Acciones para cita cancelada -->
          <template v-if="form.id && form.status === 'cancelled'">
            <v-btn
              color="success"
              variant="tonal"
              prepend-icon="mdi-calendar-refresh-outline"
              :loading="saving"
              @click="showReactivateDialog = true"
            >
              Reactivar cita
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              icon="mdi-trash-can-outline"
              :loading="saving"
              @click="showDeleteDialog = true"
            />
          </template>
          <!-- Acciones para cita activa -->
          <template v-else-if="form.id">
            <v-btn
              color="error"
              variant="tonal"
              prepend-icon="mdi-calendar-remove-outline"
              :loading="saving"
              @click="onCancel"
            >
              Cancelar cita
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              icon="mdi-trash-can-outline"
              :loading="saving"
              @click="showDeleteDialog = true"
            />
          </template>
          <v-spacer />
          <v-btn variant="text" @click="showModal = false">Descartar</v-btn>
          <v-btn v-if="form.status !== 'cancelled'" color="primary" variant="flat" prepend-icon="mdi-check" :loading="saving" @click="onSave">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal confirmar cancelación -->
    <v-dialog v-model="showCancelDialog" max-width="420">
      <v-card class="cal-dialog">
        <div class="cal-dialog__head cal-dialog__head--danger">
          <v-icon icon="mdi-alert-circle-outline" size="20" class="mr-2" />
          <span class="cal-dialog__head-title">Cancelar cita</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="showCancelDialog = false" />
        </div>
        <v-divider />
        <v-card-text class="pa-5">
          <p class="text-body-2 text-medium-emphasis mb-4">Indica el motivo para que el paciente sea informado correctamente.</p>
          <v-textarea v-model="cancelReason" label="Motivo de cancelación" rows="3" required />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showCancelDialog = false">Volver</v-btn>
          <v-btn color="error" variant="flat" prepend-icon="mdi-calendar-remove" :loading="saving" @click="confirmCancel">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal confirmar reactivación -->
    <v-dialog v-model="showReactivateDialog" max-width="400">
      <v-card class="cal-dialog">
        <div class="cal-dialog__head cal-dialog__head--success">
          <v-icon icon="mdi-calendar-refresh-outline" size="20" class="mr-2" />
          <span class="cal-dialog__head-title">Reactivar cita</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="showReactivateDialog = false" />
        </div>
        <v-divider />
        <v-card-text class="pa-5">
          <p class="text-body-2">La cita volverá al estado <strong>programada</strong> y podrá ser gestionada con normalidad.</p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showReactivateDialog = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" prepend-icon="mdi-calendar-refresh" :loading="saving" @click="confirmReactivate">Reactivar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal confirmar eliminación -->
    <v-dialog v-model="showDeleteDialog" max-width="380">
      <v-card class="cal-dialog">
        <div class="cal-dialog__head cal-dialog__head--danger">
          <v-icon icon="mdi-trash-can-outline" size="20" class="mr-2" />
          <span class="cal-dialog__head-title">Eliminar cita</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="showDeleteDialog = false" />
        </div>
        <v-divider />
        <v-card-text class="pa-5">
          <p class="text-body-2">Esta acción <strong>eliminará permanentemente</strong> la cita. No se puede deshacer.</p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" prepend-icon="mdi-trash-can" :loading="saving" @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TherapistCalendar from '~/components/calendar/TherapistCalendar.vue'
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  reactivateAppointment,
} from '~/services/appointmentService'
import { getPatients } from '~/services/patientService'
import { getPatientProcesses } from '~/services/processService'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })

const themeStore = useThemeStore()

const router = useRouter()

const events = ref<any[]>([])
const patients = ref<any[]>([])
const processes = ref<any[]>([])
const showModal = ref(false)
const showCancelDialog = ref(false)
const showDeleteDialog = ref(false)
const showReactivateDialog = ref(false)
const saving = ref(false)
const formError = ref('')
const cancelReason = ref('')
const modalTitle = ref('')

const emptyForm = () => ({
  id: null as string | null,
  patientId: '',
  appointmentType: 'in_person' as string,
  start: '',
  end: '',
  locationText: '',
  notes: '',
  status: '',
  cancelReason: '',
  processId: null as string | null,
})
const form = ref(emptyForm())

const appointmentTypes = [
  { value: 'in_person', label: 'Presencial' },
  { value: 'online',    label: 'Online' },
  { value: 'phone',     label: 'Teléfono' },
  { value: 'home_visit', label: 'Visita domiciliaria' },
]

function toDatetimeLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Converts a datetime-local string (local wall-clock) to a UTC ISO string for the API
function toUTC(datetimeLocal: string): string {
  if (!datetimeLocal) return ''
  // new Date() parses datetime-local strings as local time, .toISOString() gives UTC
  return new Date(datetimeLocal).toISOString()
}

function addOneHour(datetimeLocal: string): string {
  if (!datetimeLocal) return ''
  const [datePart, timePart] = datetimeLocal.split('T')
  if (!datePart || !timePart) return datetimeLocal
  const [h, m] = timePart.split(':').map(Number)
  if (h === undefined || m === undefined) return datetimeLocal
  return `${datePart}T${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Watch start changes but only when modal is already open (user interaction, not programmatic init)
watch(() => form.value.start, (newVal) => {
  if (showModal.value && !form.value.id && newVal) {
    form.value.end = addOneHour(newVal)
  }
})

async function loadProcesses(patientId: string | '') {
  processes.value = []
  if (!patientId) return
  try {
    processes.value = await getPatientProcesses(patientId)
  } catch {
    // non-critical: dropdown stays empty
  }
}

// Keep reactivity for new-appointment patient selector
watch(() => form.value.patientId, (patientId) => { loadProcesses(patientId) })

async function loadEvents() {
  const data = await getAppointments()
  events.value = (data.items ?? []).map((a: any) => ({
    id: a.id,
    title: a.patientName ?? a.patientId,
    start: a.startAt,
    end: a.endAt,
    extendedProps: {
      appointmentType: a.appointmentType,
      status: a.appointmentStatus,
      notes: a.notes,
      patientId: a.patientId,
      locationText: a.locationText,
      cancelReason: a.cancelReason,
      processId: a.therapyProcessId ?? a.processId ?? null,
    },
    color: a.appointmentStatus === 'cancelled' ? themeStore.currentPalette.calEventCancelled
         : a.appointmentStatus === 'completed'  ? themeStore.currentPalette.calEventCompleted
         : themeStore.currentPalette.calEventScheduled,
  }))
}

onMounted(async () => {
  await loadEvents()
  const pData = await getPatients()
  patients.value = (pData.items ?? []).map((p: any) => ({
    ...p,
    fullName: p.fullName ?? (p.firstName ? `${p.firstName} ${p.lastName}` : p.id),
  }))
})

watch(() => themeStore.paletteId, () => { loadEvents() })

async function onEventClick(info: any) {
  const e = info.event
  // Open modal immediately with calendar data, then enrich with full detail
  form.value = {
    id: e.id,
    patientId: e.extendedProps.patientId,
    appointmentType: e.extendedProps.appointmentType,
    start: toDatetimeLocal(e.startStr),
    end: toDatetimeLocal(e.endStr),
    locationText: e.extendedProps.locationText ?? '',
    notes: e.extendedProps.notes ?? '',
    status: e.extendedProps.status ?? '',
    cancelReason: e.extendedProps.cancelReason ?? '',
    processId: e.extendedProps.processId ?? null,
  }
  modalTitle.value = 'Editar cita'
  formError.value = ''
  showModal.value = true
  // Always reload processes for this patient (watch may not fire if same patientId)
  loadProcesses(e.extendedProps.patientId)
  // Fetch full detail to ensure cancelReason and all fields are present
  try {
    const detail = await getAppointment(e.id)
    form.value.cancelReason = detail.cancelReason ?? ''
    form.value.notes = detail.notes ?? ''
    form.value.locationText = detail.locationText ?? ''
    form.value.processId = (detail as any).therapyProcessId ?? (detail as any).processId ?? null
  } catch { /* non-critical, modal already open with partial data */ }
}

function onDateClick(info: any) {
  const start = toDatetimeLocal(info.dateStr.length === 10 ? info.dateStr + 'T09:00' : info.dateStr)
  const end   = addOneHour(start)
  form.value = { ...emptyForm(), start, end }
  modalTitle.value = 'Nueva cita'
  formError.value = ''
  showModal.value = true
}

function onNewAppointment() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`
  form.value = { ...emptyForm(), start, end: addOneHour(start) }
  modalTitle.value = 'Nueva cita'
  formError.value = ''
  showModal.value = true
}

async function onPatientNavigate(apptId: string) {
  try {
    const detail = await getAppointment(apptId)
    console.log('[patientNavigate] apptId:', apptId, 'detail:', detail)
    const patientId = (detail as any).patientId ?? (detail as any).patient?.id
    if (patientId) router.push(`/app/patients/${patientId}`)
    else console.warn('[patientNavigate] patientId not found in response', detail)
  } catch (err) {
    console.error('[patientNavigate] error:', err)
  }
}

async function onEventDrop(info: any) {
  try {
    await updateAppointment(info.event.id, {
      startAt: info.event.startStr,
      endAt: info.event.endStr,
    })
  } catch {
    info.revert()
  }
}

async function onEventResize(info: any) {
  try {
    await updateAppointment(info.event.id, {
      startAt: info.event.startStr,
      endAt: info.event.endStr,
    })
  } catch {
    info.revert()
  }
}

async function onSave() {
  formError.value = ''
  saving.value = true
  try {
    if (form.value.id) {
      await updateAppointment(form.value.id, {
        appointmentType: form.value.appointmentType as any,
        startAt: toUTC(form.value.start),
        endAt: toUTC(form.value.end),
        locationText: form.value.locationText || null,
        notes: form.value.notes || null,
        processId: form.value.processId || null,
      })
    } else {
      await createAppointment({
        patientId: form.value.patientId,
        appointmentType: form.value.appointmentType as any,
        startAt: toUTC(form.value.start),
        endAt: toUTC(form.value.end),
        locationText: form.value.locationText || null,
        notes: form.value.notes || null,
        processId: form.value.processId || null,
      })
    }
    showModal.value = false
    await loadEvents()
  } catch {
    formError.value = 'No se pudo guardar la cita.'
  } finally {
    saving.value = false
  }
}

function onCancel() {
  cancelReason.value = ''
  showCancelDialog.value = true
}

async function confirmCancel() {
  if (!cancelReason.value.trim()) return
  saving.value = true
  try {
    await cancelAppointment(form.value.id!, {
      cancelReason: cancelReason.value,
      cancelledBy: 'therapist',
    })
    showCancelDialog.value = false
    showModal.value = false
    await loadEvents()
  } catch {
    formError.value = 'No se pudo cancelar la cita.'
  } finally {
    saving.value = false
  }
}

async function confirmReactivate() {
  saving.value = true
  try {
    await reactivateAppointment(form.value.id!)
    showReactivateDialog.value = false
    showModal.value = false
    await loadEvents()
  }
  catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'No se pudo reactivar la cita'
    showReactivateDialog.value = false
  }
  finally {
    saving.value = false
  }
}

async function confirmDelete() {
  saving.value = true
  try {
    await deleteAppointment(form.value.id!)
    showDeleteDialog.value = false
    showModal.value = false
    await loadEvents()
  } catch {
    formError.value = 'No se pudo eliminar la cita.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

// ── Page ──────────────────────────────────────────────────────────────────────
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

// ── Dialog ────────────────────────────────────────────────────────────────────
.cal-dialog {
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    padding: $space-3 $space-5;
    background: $color-primary-subtle;
    color: $color-primary;

    &--new {
      background: $color-primary-subtle;
      color: $color-primary;
    }

    &--danger {
      background: var(--cal-event-cancelled-bg);
      color: var(--cal-event-cancelled);
    }

    &--success {
      background: var(--cal-event-completed-bg);
      color: var(--cal-event-completed);
    }
  }

  &__head-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  &__dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-3;
    margin-bottom: $space-3;
  }
}

// ── FullCalendar overrides ─────────────────────────────────────────────────────

:deep(.fc) {
  font-family: $font-family;
  font-size: $font-size-sm;
  color: $color-text-main;
  height: 100%;
}

// Toolbar
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

// Buttons — ghost style with filled active state
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
    border-color: rgb(var(--v-theme-primary)) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.2) !important;
  }

  &.fc-button-active {
    background: rgb(var(--v-theme-primary)) !important;
    border-color: rgb(var(--v-theme-primary)) !important;
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

// Column headers
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
  color: $color-primary;
  font-weight: $font-weight-semibold;
}

// Time axis
:deep(.fc-timegrid-axis) {
  width: 56px !important;
}

:deep(.fc-timegrid-slot-label-cushion) {
  font-size: 0.7rem !important;
  color: $color-text-muted !important;
  font-weight: $font-weight-medium;
  padding-right: $space-3 !important;
  letter-spacing: 0.02em;
}

:deep(.fc-timegrid-slot) {
  height: 44px !important;
}

:deep(.fc-timegrid-slot-minor) {
  border-top-style: dashed !important;
  border-color: $color-divider !important;
}

// Today highlight
:deep(.fc-day-today) {
  background: rgba($color-primary, 0.03) !important;
}

// Now indicator
:deep(.fc-timegrid-now-indicator-line) {
  border-color: $color-primary !important;
  border-width: 2px !important;
}

:deep(.fc-timegrid-now-indicator-arrow) {
  border-top-color: $color-primary !important;
  border-bottom-color: $color-primary !important;
}

// Events
:deep(.fc-event) {
  border-radius: $radius-md !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15) !important;
  transition: filter $transition-fast, transform $transition-fast, box-shadow $transition-fast !important;

  &:hover {
    filter: brightness(1.07) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18) !important;
  }
}

:deep(.fc-event-main) {
  padding: 3px 7px !important;
  overflow: hidden;
}

:deep(.fc-event-time) {
  font-size: 0.7rem !important;
  font-weight: $font-weight-medium;
  opacity: 0.82;
  line-height: 1.3;
}

:deep(.fc-event-title) {
  font-size: $font-size-sm !important;
  font-weight: $font-weight-semibold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

// Non-business hours
:deep(.fc-non-business) {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 5px,
    rgba(0, 0, 0, 0.018) 5px,
    rgba(0, 0, 0, 0.018) 10px
  ) !important;
}

// Scrollgrid
:deep(.fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-scrollgrid td),
:deep(.fc-scrollgrid th) {
  border-color: $color-divider !important;
}

// Month day number
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
  background: $color-primary;
  color: #fff;
}

:deep(.fc-daygrid-more-link) {
  color: $color-primary;
  font-weight: $font-weight-medium;
  font-size: $font-size-xs;
}
</style>
