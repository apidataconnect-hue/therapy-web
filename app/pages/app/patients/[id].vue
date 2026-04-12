<template>
  <div class="pd-page">

    <!-- Back + header -->
    <div class="pd-page__header">
      <v-btn
        variant="text"
        density="compact"
        prepend-icon="mdi-arrow-left"
        color="primary"
        class="pd-page__back"
        @click="router.back()"
      >
        Pacientes
      </v-btn>

      <div class="pd-page__title-row">
        <!-- Avatar -->
        <div class="pd-avatar">{{ initials }}</div>

        <div class="pd-page__title-info">
          <div class="pd-page__name">{{ displayName }}</div>
          <span v-if="patient" class="pd-status" :class="`pd-status--${patient.patientStatus}`">
            {{ STATUS_LABELS[patient.patientStatus] ?? patient.patientStatus }}
          </span>
        </div>

        <!-- Actions menu -->
        <v-menu v-if="patient" offset-y>
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              variant="outlined"
              color="primary"
              size="small"
              append-icon="mdi-chevron-down"
              class="ml-auto"
            >
              Acciones
            </v-btn>
          </template>
          <v-list density="compact" min-width="200">
            <v-list-item
              prepend-icon="mdi-pencil-outline"
              title="Editar información"
              @click="openEditDialog"
            />
            <v-divider class="my-1" />
            <v-list-item
              v-if="patient.patientStatus !== 'active'"
              prepend-icon="mdi-account-check-outline"
              title="Activar"
              @click="setStatus('active')"
            />
            <v-list-item
              v-if="patient.patientStatus === 'active'"
              prepend-icon="mdi-account-off-outline"
              title="Desactivar"
              @click="setStatus('inactive')"
            />
            <v-list-item
              v-if="patient.patientStatus !== 'archived'"
              prepend-icon="mdi-archive-outline"
              title="Archivar"
              @click="setStatus('archived')"
            />
            <v-list-item
              v-if="patient.patientStatus !== 'discharged'"
              prepend-icon="mdi-clipboard-check-outline"
              title="Dar de alta"
              @click="setStatus('discharged')"
            />
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="!patient && !error" class="pd-page__loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <!-- Error -->
    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-if="patient">
      <!-- Info grid -->
      <div class="pd-section">
        <div class="pd-section__label">
          <v-icon icon="mdi-information-outline" size="15" class="mr-1" />
          Información de contacto
        </div>
        <div class="pd-info-grid">
          <div class="pd-info-item">
            <span class="pd-info-item__key">Email</span>
            <span class="pd-info-item__val">{{ patient.email || '—' }}</span>
          </div>
          <div class="pd-info-item">
            <span class="pd-info-item__key">Teléfono</span>
            <span class="pd-info-item__val">{{ patient.phone || '—' }}</span>
          </div>
          <div class="pd-info-item">
            <span class="pd-info-item__key">Fecha de nacimiento</span>
            <span class="pd-info-item__val">{{ formatDate(patient.birthDate) }}</span>
          </div>
          <div class="pd-info-item">
            <span class="pd-info-item__key">Menor de edad</span>
            <span class="pd-info-item__val">{{ patient.isMinor ? 'Sí' : 'No' }}</span>
          </div>
          <div v-if="patient.documentNumber" class="pd-info-item">
            <span class="pd-info-item__key">Documento</span>
            <span class="pd-info-item__val">{{ patient.documentNumber }}</span>
          </div>
          <div v-if="patient.address" class="pd-info-item">
            <span class="pd-info-item__key">Dirección</span>
            <span class="pd-info-item__val">{{ patient.address }}</span>
          </div>
          <div v-if="patient.emergencyContactName" class="pd-info-item">
            <span class="pd-info-item__key">Contacto urgencia</span>
            <span class="pd-info-item__val">
              {{ patient.emergencyContactName }}
              <template v-if="patient.emergencyContactPhone"> · {{ patient.emergencyContactPhone }}</template>
            </span>
          </div>
          <div v-if="patient.notesAdministrative" class="pd-info-item pd-info-item--full">
            <span class="pd-info-item__key">Notas administrativas</span>
            <span class="pd-info-item__val">{{ patient.notesAdministrative }}</span>
          </div>
        </div>
      </div>

      <!-- Processes -->
      <div class="pd-section">
        <div class="pd-section__label">
          <v-icon icon="mdi-clipboard-pulse-outline" size="15" class="mr-1" />
          Procesos terapéuticos
        </div>

        <div v-if="loadingProcesses" class="pd-page__loading">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>

        <div v-else-if="processes.length === 0" class="pd-empty">
          <v-icon icon="mdi-clipboard-off-outline" size="36" color="disabled" />
          <p class="mt-2">No hay procesos terapéuticos registrados.</p>
        </div>

        <div v-else class="pd-process-list">
          <div
            v-for="proc in processes"
            :key="proc.id"
            class="pd-process-card"
            role="button"
            tabindex="0"
            @click="router.push(`/app/therapist/therapies/${proc.id}`)"
            @keyup.enter="router.push(`/app/therapist/therapies/${proc.id}`)"
          >
            <div class="pd-process-card__bar" :class="`pd-process-card__bar--${proc.processStatus}`" />
            <div class="pd-process-card__body">
              <div class="pd-process-card__reason">{{ proc.reasonForConsultation || '—' }}</div>
              <div class="pd-process-card__meta">
                <span v-if="proc.openedAt" class="pd-process-card__date">
                  <v-icon icon="mdi-calendar-outline" size="12" class="mr-1" />
                  {{ formatDate(proc.openedAt) }}
                </span>
              </div>
            </div>
            <span class="pd-proc-status" :class="`pd-proc-status--${proc.processStatus}`">
              {{ PROCESS_STATUS_LABELS[proc.processStatus] ?? proc.processStatus }}
            </span>
            <v-icon icon="mdi-chevron-right" size="16" color="disabled" class="ml-1" />
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ── Edit patient dialog ──────────────────────────────────────────────── -->
  <v-dialog v-model="editDialog" max-width="600" scrollable>
    <v-card>
      <v-card-title class="pt-5 px-5 pb-2">Editar información del paciente</v-card-title>

      <v-card-text class="px-5 py-3">
        <!-- Basic info -->
        <div class="pd-edit-section-label">Datos personales</div>
        <div class="pd-edit-grid">
          <v-text-field
            v-model="editForm.firstName"
            label="Nombre"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :error-messages="editFieldErrors.firstName"
            @input="delete editFieldErrors.firstName"
          />
          <v-text-field
            v-model="editForm.lastName"
            label="Apellidos"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :error-messages="editFieldErrors.lastName"
            @input="delete editFieldErrors.lastName"
          />
          <v-text-field
            v-model="editForm.birthDate"
            label="Fecha de nacimiento"
            type="date"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-text-field
            v-model="editForm.documentNumber"
            label="Documento"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </div>
        <v-checkbox
          v-model="editForm.isMinor"
          label="Menor de edad"
          density="compact"
          hide-details
          class="mt-1 mb-3"
        />

        <!-- Contact -->
        <div class="pd-edit-section-label">Contacto</div>
        <div class="pd-edit-grid">
          <v-text-field
            v-model="editForm.email"
            label="Email"
            type="email"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-text-field
            v-model="editForm.phone"
            label="Teléfono"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </div>
        <v-text-field
          v-model="editForm.address"
          label="Dirección"
          variant="outlined"
          density="compact"
          hide-details="auto"
          class="mb-4"
        />

        <!-- Emergency contact -->
        <div class="pd-edit-section-label">Contacto de urgencia</div>
        <div class="pd-edit-grid">
          <v-text-field
            v-model="editForm.emergencyContactName"
            label="Nombre"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-text-field
            v-model="editForm.emergencyContactPhone"
            label="Teléfono"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </div>
        <v-text-field
          v-if="editForm.isMinor"
          v-model="editForm.emergencyContactRelation"
          label="Relación (tutor / responsable)"
          variant="outlined"
          density="compact"
          hide-details="auto"
          class="mb-4"
        />

        <!-- Administrative -->
        <div class="pd-edit-section-label">Administrativo</div>
        <div class="pd-edit-grid">
          <v-text-field
            v-model="editForm.internalReference"
            label="Ref. interna"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
          <v-text-field
            v-model="editForm.source"
            label="Cómo nos conoció"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </div>
        <v-textarea
          v-model="editForm.notesAdministrative"
          label="Notas administrativas"
          variant="outlined"
          density="compact"
          rows="3"
          hide-details="auto"
          auto-grow
        />

        <v-alert
          v-if="editError"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >{{ editError }}</v-alert>
      </v-card-text>

      <v-card-actions class="px-5 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="editSaving"
          @click="saveEdit"
        >Guardar cambios</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPatient, updatePatient, type UpdatePatientPayload } from '~/services/patientService'
import { getPatientProcesses } from '~/services/processService'
import { useNotificationStore } from '~/stores/notification'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const patient = ref<any>(null)
const error = ref('')
const processes = ref<any[]>([])
const loadingProcesses = ref(false)
const notification = useNotificationStore()

const STATUS_LABELS: Record<string, string> = {
  active:     'Activo',
  inactive:   'Inactivo',
  archived:   'Archivado',
  discharged: 'Alta',
}

const PROCESS_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  draft:  'Borrador',
  paused: 'Pausado',
  closed: 'Cerrado',
}

function resolveName(p: any): string {
  if (!p) return ''
  const full = p.fullName?.trim()
  if (full) return full
  const first = p.firstName ?? p.first_name ?? ''
  const last  = p.lastName  ?? p.last_name  ?? ''
  return `${first} ${last}`.trim()
}

const displayName = computed(() => resolveName(patient.value) || '—')

const initials = computed(() => {
  const name = resolveName(patient.value)
  if (!name) return ''
  return name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
})

// ── Edit dialog ───────────────────────────────────────────────────────────────
const editDialog      = ref(false)
const editSaving      = ref(false)
const editError       = ref<string | null>(null)
const editFieldErrors = ref<Record<string, string>>({})
const editForm        = ref<UpdatePatientPayload>({})

/** Convert empty string to null; keep non-empty strings as-is */
function strOrNull(v: any): string | null {
  const s = (v ?? '').toString().trim()
  return s || null
}

function openEditDialog() {
  const p = patient.value as any
  if (!p) return
  editForm.value = {
    firstName:                p.firstName               ?? p.first_name                ?? '',
    lastName:                 p.lastName                ?? p.last_name                 ?? '',
    birthDate:                p.birthDate               ?? p.birth_date                ?? null,
    phone:                    p.phone                   ?? null,
    email:                    p.email                   ?? null,
    documentNumber:           p.documentNumber          ?? p.document_number           ?? null,
    address:                  p.address                 ?? null,
    isMinor:                  p.isMinor                 ?? p.is_minor                  ?? false,
    internalReference:        p.internalReference       ?? p.internal_reference        ?? null,
    notesAdministrative:      p.notesAdministrative     ?? p.notes_administrative      ?? null,
    emergencyContactName:     p.emergencyContactName    ?? p.emergency_contact_name    ?? null,
    emergencyContactPhone:    p.emergencyContactPhone   ?? p.emergency_contact_phone   ?? null,
    emergencyContactRelation: p.emergencyContactRelation ?? p.emergency_contact_relation ?? null,
    source:                   p.source                  ?? null,
  }
  editError.value = null
  editFieldErrors.value = {}
  editDialog.value = true
}

async function saveEdit() {
  editFieldErrors.value = {}
  editError.value = null

  // Required field validation
  const errs: Record<string, string> = {}
  if (!editForm.value.firstName?.toString().trim()) errs.firstName = 'El nombre es obligatorio.'
  if (!editForm.value.lastName?.toString().trim())  errs.lastName  = 'Los apellidos son obligatorios.'
  if (Object.keys(errs).length) { editFieldErrors.value = errs; return }

  // Normalize: empty strings → null, trim required strings
  const payload: UpdatePatientPayload = {
    firstName:                editForm.value.firstName!.trim(),
    lastName:                 editForm.value.lastName!.trim(),
    birthDate:                strOrNull(editForm.value.birthDate),
    phone:                    strOrNull(editForm.value.phone),
    email:                    strOrNull(editForm.value.email),
    documentNumber:           strOrNull(editForm.value.documentNumber),
    address:                  strOrNull(editForm.value.address),
    isMinor:                  editForm.value.isMinor ?? false,
    internalReference:        strOrNull(editForm.value.internalReference),
    notesAdministrative:      strOrNull(editForm.value.notesAdministrative),
    emergencyContactName:     strOrNull(editForm.value.emergencyContactName),
    emergencyContactPhone:    strOrNull(editForm.value.emergencyContactPhone),
    emergencyContactRelation: strOrNull(editForm.value.emergencyContactRelation),
    source:                   strOrNull(editForm.value.source),
  }

  editSaving.value = true
  try {
    const updated = await updatePatient(id, payload) as any
    patient.value = updated?.person ? { ...updated, ...updated.person } : updated
    editDialog.value = false
    notification.notify({ message: 'Información actualizada', color: 'success' })
  } catch (e: any) {
    const status = e?.response?.status
    const msgs: string[] = [].concat(e?.response?.data?.message ?? [])
    if (status === 400 && msgs.length) {
      const fieldMap: Record<string, string> = {
        firstName: 'firstName', lastName: 'lastName', email: 'email',
        phone: 'phone', birthDate: 'birthDate', address: 'address',
        documentNumber: 'documentNumber', isMinor: 'isMinor',
        internalReference: 'internalReference', source: 'source',
        notesAdministrative: 'notesAdministrative',
        emergencyContactName: 'emergencyContactName',
        emergencyContactPhone: 'emergencyContactPhone',
        emergencyContactRelation: 'emergencyContactRelation',
      }
      const fieldErrors: Record<string, string> = {}
      for (const msg of msgs) {
        const matched = Object.keys(fieldMap).find(k => msg.toLowerCase().includes(k.toLowerCase()))
        if (matched) fieldErrors[fieldMap[matched]!] = msg
        else editError.value = msg
      }
      if (Object.keys(fieldErrors).length) editFieldErrors.value = fieldErrors
    } else {
      editError.value = msgs[0] ?? 'No se pudo guardar los cambios.'
    }
  } finally {
    editSaving.value = false
  }
}

function formatDate(d?: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchPatient() {
  try {
    const raw = await getPatient(id) as any
    // Some API builds nest personal fields under a 'person' sub-object
    patient.value = raw?.person ? { ...raw, ...raw.person } : raw
  } catch {
    error.value = 'No se pudo cargar el paciente.'
  }
}

async function fetchProcesses() {
  loadingProcesses.value = true
  try {
    processes.value = await getPatientProcesses(id)
  } catch {
    // no processes — show empty
  } finally {
    loadingProcesses.value = false
  }
}

async function setStatus(status: string) {
  try {
    await updatePatient(id, { patientStatus: status as any })
    await fetchPatient()
    notification.notify({ message: 'Estado actualizado', color: 'success' })
  } catch {
    notification.notify({ message: 'No se pudo actualizar el estado.', color: 'error' })
  }
}

onMounted(async () => {
  await fetchPatient()
  await fetchProcesses()
})
</script>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

// ── Page ─────────────────────────────────────────────────────────────────────
.pd-page {
  padding: $space-5;
  max-width: 780px;
  margin: 0 auto;

  &__header {
    margin-bottom: $space-5;
  }

  &__back {
    margin-bottom: $space-3;
    padding-left: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__title-info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__name {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: $space-7 0;
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
.pd-avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: $radius-full;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
}

// ── Status pill ───────────────────────────────────────────────────────────────
.pd-status {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: $font-weight-semibold;
  padding: 2px 10px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &--active    { background: rgba(#22c55e, 0.12); color: #15803d; }
  &--inactive  { background: rgba($color-text-muted, 0.12); color: $color-text-secondary; }
  &--archived  { background: rgba($color-warning, 0.12); color: $color-warning; }
  &--discharged{ background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
}

// ── Section ───────────────────────────────────────────────────────────────────
.pd-section {
  margin-bottom: $space-6;

  &__label {
    display: flex;
    align-items: center;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $color-text-muted;
    margin-bottom: $space-3;
  }
}

// ── Info grid ────────────────────────────────────────────────────────────────
.pd-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: $space-1;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
}

.pd-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $space-3 $space-4;
  border-bottom: 1px solid $color-border;

  &--full {
    grid-column: 1 / -1;
  }

  &__key {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-muted;
  }

  &__val {
    font-size: $font-size-sm;
    color: $color-text-main;
  }
}

// ── Process list ─────────────────────────────────────────────────────────────
.pd-process-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.pd-process-card {
  display: flex;
  align-items: center;
  gap: $space-3;
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

    &--active  { background: #22c55e; }
    &--draft   { background: rgb(var(--v-theme-primary)); }
    &--paused  { background: $color-warning; }
    &--closed  { background: $color-text-muted; }
  }

  &__body {
    flex: 1;
    min-width: 0;
    margin-left: $space-3;
  }

  &__reason {
    font-size: $font-size-sm;
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
    margin-top: 2px;
  }

  &__date {
    display: flex;
    align-items: center;
    font-size: $font-size-xs;
    color: $color-text-muted;
  }
}

// ── Process status pill ───────────────────────────────────────────────────────
.pd-proc-status {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: $font-weight-semibold;
  padding: 2px 9px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--active  { background: rgba(#22c55e, 0.12); color: #15803d; }
  &--draft   { background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
  &--paused  { background: rgba($color-warning, 0.12); color: $color-warning; }
  &--closed  { background: rgba($color-text-muted, 0.1); color: $color-text-secondary; }
}

// ── Empty ─────────────────────────────────────────────────────────────────────
.pd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-6 0;
  color: $color-text-muted;
  font-size: $font-size-sm;
}

// ── Edit dialog ───────────────────────────────────────────────────────────────
.pd-edit-section-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: $color-text-muted;
  margin-bottom: $space-3;
  margin-top: $space-4;

  &:first-child { margin-top: 0; }
}

.pd-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-3;
  margin-bottom: $space-3;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
</style>
