<template>
  <div class="sd-page">

    <!-- Back -->
    <NuxtLink to="/app/therapist/sessions" class="sd-back">
      <v-icon icon="mdi-arrow-left" size="16" class="mr-1" />
      Sesiones
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="sd-state">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <!-- Not found -->
    <div v-else-if="!appointment" class="sd-state">
      <v-icon icon="mdi-calendar-remove-outline" size="52" color="disabled" />
      <p class="mt-3 text-medium-emphasis">Sesión no encontrada.</p>
      <NuxtLink to="/app/therapist/sessions">
        <v-btn variant="tonal" size="small" class="mt-3">Volver a sesiones</v-btn>
      </NuxtLink>
    </div>

    <template v-else>

      <!-- ── Appointment header ──────────────────────────────────────────────── -->
      <div class="sd-appt">
        <div class="sd-appt__date">
          <span class="sd-appt__day">{{ dayOf(appointment.startAt) }}</span>
          <span class="sd-appt__month">{{ monthOf(appointment.startAt) }}</span>
        </div>
        <div class="sd-appt__info">
          <h1 class="sd-appt__patient">{{ patientName || appointment.patientName || 'Paciente' }}</h1>
          <div class="sd-appt__meta">
            <v-icon :icon="TYPE_ICONS[appointment.appointmentType]" size="14" />
            <span>{{ TYPE_LABELS[appointment.appointmentType] }}</span>
            <span class="sd-dot">·</span>
            <span>{{ timeRange(appointment.startAt, appointment.endAt) }}</span>
            <span class="sd-dot">·</span>
            <v-chip
              size="x-small"
              variant="tonal"
              :color="STATUS_COLORS[appointment.appointmentStatus]"
            >{{ STATUS_LABELS[appointment.appointmentStatus] }}</v-chip>
          </div>
          <p v-if="appointment.locationText" class="sd-appt__location">
            <v-icon icon="mdi-map-marker-outline" size="13" class="mr-1" />{{ appointment.locationText }}
          </p>
          <a v-if="appointment.meetingUrl" :href="appointment.meetingUrl" target="_blank" class="sd-appt__link">
            <v-icon icon="mdi-video-outline" size="13" class="mr-1" />Unirse a la videollamada
          </a>
        </div>

        <!-- Status actions -->
        <div class="sd-appt__actions">
          <v-btn
            v-if="appointment.appointmentStatus === 'scheduled'"
            variant="tonal"
            color="primary"
            size="small"
            :loading="statusLoading"
            prepend-icon="mdi-check"
            @click="changeStatus('confirmed')"
          >Confirmar</v-btn>
          <v-btn
            v-if="appointment.appointmentStatus === 'scheduled' || appointment.appointmentStatus === 'confirmed'"
            variant="tonal"
            color="success"
            size="small"
            :loading="statusLoading"
            prepend-icon="mdi-check-all"
            @click="confirmCompleteDialog = true"
          >Completar</v-btn>
          <v-btn
            v-if="appointment.appointmentStatus === 'scheduled' || appointment.appointmentStatus === 'confirmed'"
            variant="text"
            color="error"
            size="small"
            prepend-icon="mdi-cancel"
            @click="cancelDialog = true"
          >Cancelar</v-btn>
        </div>
      </div>

      <!-- ── Note form ───────────────────────────────────────────────────────── -->
      <div class="sd-note">
        <div class="sd-note__header">
          <v-icon icon="mdi-note-text-outline" size="18" color="primary" class="mr-2" />
          <span class="sd-note__title">Nota clínica</span>
          <v-chip
            v-if="note"
            size="x-small"
            variant="tonal"
            color="success"
            class="ml-2"
          >Guardada</v-chip>
          <v-chip
            v-else
            size="x-small"
            variant="tonal"
            color="warning"
            class="ml-2"
          >Sin nota</v-chip>
          <v-spacer />
          <span v-if="savedAt" class="sd-note__saved-at">
            <v-icon icon="mdi-cloud-check-outline" size="13" class="mr-1" />Guardado {{ savedAtStr }}
          </span>
        </div>

        <v-alert
          v-if="isCancelled"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
          icon="mdi-alert-outline"
        >No se puede añadir nota a una sesión cancelada o de no-asistencia.</v-alert>

        <!-- Inline process linker ────────────────────────────────── -->
        <div v-if="noProcess" class="sd-link-process mb-4">
          <div class="sd-link-process__header">
            <v-icon icon="mdi-link-variant-off" color="warning" size="18" class="mr-2" />
            <span class="text-body-2 font-weight-medium">Esta cita no está vinculada a ningún proceso terapéutico</span>
          </div>
          <div class="sd-link-process__body mt-2">
            <v-autocomplete
              v-model="selectedProcessId"
              :items="patientProcesses"
              item-title="reasonForConsultation"
              item-value="id"
              label="Seleccionar proceso"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              class="sd-link-process__select"
            />
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              :loading="linkingProcess"
              :disabled="!selectedProcessId"
              @click="linkProcess"
            >
              Vincular
            </v-btn>
          </div>
        </div>

        <v-form ref="formRef" @submit.prevent="save">
          <!-- Summary -->
          <div class="sd-field">
            <label class="sd-label">
              Resumen de la sesión
              <span class="sd-required">*</span>
            </label>
            <p class="sd-hint">Descripción general de lo tratado en la sesión.</p>
            <v-textarea
              v-model="form.summary"
              placeholder="Escribe un resumen de la sesión…"
              rows="7"
              auto-grow
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              :rules="[v => !!v?.trim() || 'El resumen es obligatorio']"
              :disabled="formDisabled"
            />
          </div>

          <!-- Observations -->
          <div class="sd-field">
            <label class="sd-label">Observaciones clínicas</label>
            <p class="sd-hint">Estado emocional, conductual y cognitivo del paciente.</p>
            <v-textarea
              v-model="form.observations"
              placeholder="Observaciones sobre el estado del paciente…"
              rows="4"
              auto-grow
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="formDisabled"
            />
          </div>

          <!-- Interventions -->
          <div class="sd-field">
            <label class="sd-label">Intervenciones realizadas</label>
            <p class="sd-hint">Técnicas y estrategias terapéuticas aplicadas.</p>
            <v-textarea
              v-model="form.interventions"
              placeholder="Técnicas utilizadas, ejercicios realizados…"
              rows="4"
              auto-grow
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="formDisabled"
            />
          </div>

          <!-- Homework -->
          <div class="sd-field">
            <label class="sd-label">Tareas para el paciente</label>
            <p class="sd-hint">Ejercicios o actividades asignadas hasta la próxima sesión.</p>
            <v-textarea
              v-model="form.homework"
              placeholder="Tareas asignadas al paciente…"
              rows="3"
              auto-grow
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="formDisabled"
            />
          </div>

          <!-- Next steps -->
          <div class="sd-field">
            <label class="sd-label">Próximos pasos</label>
            <p class="sd-hint">Objetivos y temas a abordar en la siguiente sesión.</p>
            <v-textarea
              v-model="form.nextSteps"
              placeholder="Temas planificados para la próxima sesión…"
              rows="3"
              auto-grow
              variant="outlined"
              density="comfortable"
              hide-details
              :disabled="formDisabled"
            />
          </div>

          <!-- Private notes (collapsible) -->
          <details class="sd-private">
            <summary class="sd-private__toggle">
              <v-icon icon="mdi-lock-outline" size="15" class="mr-1" />
              Notas privadas
              <v-chip size="x-small" variant="tonal" color="error" class="ml-2">Solo tú</v-chip>
            </summary>
            <div class="sd-private__body">
              <p class="sd-hint">Nunca visibles para el paciente. Reflexiones, hipótesis, supervisión.</p>
              <v-textarea
                v-model="form.privateNotes"
                placeholder="Notas privadas del terapeuta…"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details
                :disabled="formDisabled"
              />
            </div>
          </details>

          <!-- Actions -->
          <div class="sd-form-actions">
            <v-btn
              v-if="!formDisabled"
              type="submit"
              color="primary"
              :loading="saving"
              prepend-icon="mdi-content-save-outline"
            >{{ note ? 'Actualizar nota' : 'Guardar nota' }}</v-btn>
            <v-btn
              v-if="note && !formDisabled"
              variant="text"
              color="error"
              prepend-icon="mdi-delete-outline"
              @click="confirmDelete = true"
            >Eliminar nota</v-btn>
          </div>
        </v-form>
      </div>

      <!-- ── Session plan AI ────────────────────────────────────────────────── -->
      <SessionPlanSection
        :appointment-id="id"
        :note-id="note?.id ?? null"
        :initial-plan="note?.plan ?? null"
        :initial-plan-id="note?.planId ?? null"
      />

    </template>

    <!-- ── Confirm complete dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="confirmCompleteDialog" max-width="400">
      <v-card>
        <v-card-text class="px-6 pt-6 pb-2 text-center">
          <v-icon icon="mdi-check-circle-outline" size="52" color="success" class="mb-3" />
          <div class="text-h6 font-weight-bold mb-3">¿Marcar como completada?</div>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Acuérdate de registrar la nota clínica.
          </p>
          <v-alert type="warning" variant="tonal" density="compact" icon="mdi-alert-outline">
            Esta acción <strong>no se puede deshacer</strong>.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-3 gap-2">
          <v-btn variant="tonal" @click="confirmCompleteDialog = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn
            color="success"
            variant="flat"
            :loading="statusLoading"
            prepend-icon="mdi-check-all"
            class="flex-grow-1"
            @click="confirmCompleteDialog = false; changeStatus('completed')"
          >Sí, completar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Cancel appointment dialog ─────────────────────────────────────────── -->
    <v-dialog v-model="cancelDialog" max-width="480">
      <v-card>
        <v-card-title class="pt-5 px-5">Cancelar sesión</v-card-title>
        <v-card-text class="px-5">
          <v-textarea
            v-model="cancelReason"
            label="Motivo de la cancelación"
            rows="3"
            variant="outlined"
            density="comfortable"
            autofocus
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelDialog = false">Volver</v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="statusLoading"
            :disabled="!cancelReason.trim()"
            @click="doCancel"
          >Confirmar cancelación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete note dialog ─────────────────────────────────────────────────── -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title class="pt-5 px-5">¿Eliminar nota?</v-card-title>
        <v-card-text class="px-5">Esta acción no se puede deshacer. La nota clínica se eliminará permanentemente.</v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" :loading="deleting" @click="doDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom end">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAppointment, updateAppointment, cancelAppointment } from '~/services/appointmentService'
import { getPatient } from '~/services/patientService'
import { getPatientProcesses } from '~/services/processService'
import {
  getSessionNoteByAppointment,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  type SessionNote,
} from '~/services/sessionNoteService'
import SessionPlanSection from '~/components/session/SessionPlanSection.vue'

definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })

const route  = useRoute()
const router = useRouter()
const id     = computed(() => route.params.id as string)

// ── State ─────────────────────────────────────────────────────────────────────
const loading   = ref(true)
const appointment = ref<any>(null)
const note        = ref<SessionNote | null>(null)
const saving      = ref(false)
const deleting    = ref(false)
const savedAt     = ref<Date | null>(null)
const formRef     = ref<any>(null)
const statusLoading = ref(false)
const cancelDialog  = ref(false)
const cancelReason  = ref('')
const confirmDelete = ref(false)
const confirmCompleteDialog = ref(false)

const form = ref({
  summary:      '',
  observations: '',
  interventions:'',
  homework:     '',
  nextSteps:    '',
  privateNotes: '',
})

const patientProcesses = ref<any[]>([])
const selectedProcessId = ref('')
const linkingProcess = ref(false)
const patientName = ref((route.query.patientName as string) || '')

const snackbar = ref({ show: false, text: '', color: 'success' })
function notify(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isCancelled = computed(() =>
  appointment.value?.appointmentStatus === 'cancelled' ||
  appointment.value?.appointmentStatus === 'no_show'
)

const noProcess = computed(() =>
  !!appointment.value && !(appointment.value.therapyProcessId ?? appointment.value.processId)
)

const formDisabled = computed(() => isCancelled.value)

const savedAtStr = computed(() => {
  if (!savedAt.value) return ''
  return savedAt.value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

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

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show:   'No asistió',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'primary',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
  no_show:   'warning',
}

function dayOf(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit' })
}
function monthOf(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
}
function timeRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fmt(start)} – ${fmt(end)}`
}

function populateForm(n: SessionNote) {
  form.value.summary       = n.summary       ?? ''
  form.value.observations  = n.observations  ?? ''
  form.value.interventions = n.interventions ?? ''
  form.value.homework      = n.homework      ?? ''
  form.value.nextSteps     = n.nextSteps     ?? ''
  form.value.privateNotes  = n.privateNotes  ?? ''
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadData(appointmentId: string) {
  loading.value = true
  appointment.value = null
  note.value = null
  savedAt.value = null
  form.value = { summary: '', observations: '', interventions: '', homework: '', nextSteps: '', privateNotes: '' }
  try {
    const [appt, existingNote] = await Promise.all([
      getAppointment(appointmentId),
      getSessionNoteByAppointment(appointmentId),
    ])
    appointment.value = appt
    const patientId = (appt as any).patientId ?? (appt as any).patient?.id
    if (patientId) {
      getPatientProcesses(patientId)
        .then(r => { patientProcesses.value = r })
        .catch(e => { console.error('[session-detail] process load error', e); patientProcesses.value = [] })
      getPatient(patientId)
        .then(p => {
          const first = (p as any).firstName ?? (p as any).first_name ?? ''
          const last  = (p as any).lastName  ?? (p as any).last_name  ?? ''
          const name  = (p as any).fullName ?? `${first} ${last}`.trim()
          if (name) patientName.value = name
        })
        .catch(() => {})
    }
    if (existingNote) {
      note.value = existingNote
      populateForm(existingNote)
    }
  } catch (e) {
    console.error('[session-detail] load error', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData(id.value))
watch(id, (newId) => { if (newId) loadData(newId) })

// ── Save note ─────────────────────────────────────────────────────────────────
async function save() {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  saving.value = true
  try {
    const payload = {
      summary:       form.value.summary.trim(),
      observations:  form.value.observations.trim()  || null,
      interventions: form.value.interventions.trim() || null,
      homework:      form.value.homework.trim()      || null,
      nextSteps:     form.value.nextSteps.trim()     || null,
      privateNotes:  form.value.privateNotes.trim()  || null,
    }

    if (note.value) {
      note.value = await updateSessionNote(note.value.id, payload)
    } else {
      note.value = await createSessionNote({
        ...payload,
        processId:     (appointment.value.therapyProcessId ?? appointment.value.processId) || undefined,
        appointmentId: id.value,
      })
    }

    populateForm(note.value)
    savedAt.value = new Date()
    notify('Nota guardada correctamente')
  } catch (e: any) {
    notify(e?.response?.data?.message ?? 'Error al guardar la nota', 'error')
  } finally {
    saving.value = false
  }
}

// ── Link process ──────────────────────────────────────────────────────────────
async function linkProcess() {
  if (!selectedProcessId.value) return
  linkingProcess.value = true
  try {
    appointment.value = await updateAppointment(id.value, { processId: selectedProcessId.value })
    notify('Cita vinculada al proceso correctamente')
  } catch (e: any) {
    notify(e?.response?.data?.message ?? 'Error al vincular el proceso', 'error')
  } finally {
    linkingProcess.value = false
  }
}

// ── Delete note ───────────────────────────────────────────────────────────────
async function doDelete() {
  if (!note.value) return
  deleting.value = true
  try {
    await deleteSessionNote(note.value.id)
    note.value = null
    savedAt.value = null
    form.value = { summary: '', observations: '', interventions: '', homework: '', nextSteps: '', privateNotes: '' }
    confirmDelete.value = false
    notify('Nota eliminada')
  } catch {
    notify('Error al eliminar la nota', 'error')
  } finally {
    deleting.value = false
  }
}

// ── Change appointment status ─────────────────────────────────────────────────
async function changeStatus(status: 'confirmed' | 'completed') {
  statusLoading.value = true
  try {
    appointment.value = await updateAppointment(id.value, { appointmentStatus: status })
    notify(`Sesión marcada como ${(STATUS_LABELS[status] ?? status).toLowerCase()}`)
  } catch {
    notify('Error al actualizar el estado', 'error')
  } finally {
    statusLoading.value = false
  }
}

async function doCancel() {
  if (!cancelReason.value.trim()) return
  statusLoading.value = true
  try {
    appointment.value = await cancelAppointment(id.value, {
      cancelReason: cancelReason.value.trim(),
      cancelledBy:  'therapist',
    })
    cancelDialog.value = false
    cancelReason.value = ''
    notify('Sesión cancelada')
  } catch {
    notify('Error al cancelar la sesión', 'error')
  } finally {
    statusLoading.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.sd-page {
  padding: $space-5;
  max-width: 760px;
  margin: 0 auto;
}

// ── Back link ─────────────────────────────────────────────────────────────────
.sd-back {
  display: inline-flex;
  align-items: center;
  font-size: $font-size-sm;
  color: $color-text-muted;
  text-decoration: none;
  margin-bottom: $space-4;
  transition: color $transition-fast;

  &:hover { color: $color-primary; }
}

// ── Center states ─────────────────────────────────────────────────────────────
.sd-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

// ── Appointment header card ───────────────────────────────────────────────────
.sd-appt {
  display: flex;
  align-items: flex-start;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4 $space-5;
  box-shadow: $shadow-xs;
  margin-bottom: $space-4;

  &__date {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: $color-background;
    border-radius: $radius-md;
    padding: $space-2 $space-3;
    min-width: 52px;
    border: 1px solid $color-border;
  }

  &__day {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-primary;
    line-height: 1;
  }

  &__month {
    font-size: $font-size-xs;
    text-transform: uppercase;
    color: $color-text-muted;
    font-weight: $font-weight-medium;
    margin-top: 2px;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__patient {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: 0 0 $space-1;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-1;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: $space-1;
  }

  &__location,
  &__link {
    font-size: $font-size-xs;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    margin-top: $space-1;
  }

  &__link {
    color: $color-primary;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    flex-shrink: 0;
  }
}

.sd-dot {
  color: $color-border;
  font-size: 1.1em;
}

// ── Note form card ────────────────────────────────────────────────────────────
// ── Inline process linker ─────────────────────────────────────────────────────
.sd-link-process {
  background: rgb(var(--v-theme-warning), 0.06);
  border: 1px solid rgb(var(--v-theme-warning), 0.3);
  border-radius: $radius-md;
  padding: $space-4;

  &__header {
    display: flex;
    align-items: center;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__select {
    flex: 1;
  }
}

// ── Note card ─────────────────────────────────────────────────────────────────
.sd-note {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-xs;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: $space-4;
    padding-bottom: $space-3;
    border-bottom: 1px solid $color-divider;
  }

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }

  &__saved-at {
    font-size: $font-size-xs;
    color: $color-text-muted;
    display: flex;
    align-items: center;
  }
}

// ── Form fields ───────────────────────────────────────────────────────────────
.sd-field {
  margin-bottom: $space-4;
}

.sd-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-main;
  margin-bottom: 2px;
}

.sd-required {
  color: $color-error;
  margin-left: 2px;
}

.sd-hint {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin: 0 0 $space-1;
}

// ── Private notes collapsible ─────────────────────────────────────────────────
.sd-private {
  border: 1px solid $color-border;
  border-radius: $radius-md;
  padding: $space-3;
  margin-bottom: $space-4;

  &__toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-secondary;
    list-style: none;
    user-select: none;

    &::marker,
    &::-webkit-details-marker { display: none; }
  }

  &__body {
    padding-top: $space-3;
  }
}

// ── Form actions ──────────────────────────────────────────────────────────────
.sd-form-actions {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-top: $space-3;
  border-top: 1px solid $color-divider;
  margin-top: $space-2;
}
</style>
