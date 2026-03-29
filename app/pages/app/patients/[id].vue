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
          <div class="pd-page__name">
            {{ patient?.fullName || (patient ? `${patient.firstName} ${patient.lastName}` : '—') }}
          </div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPatient, updatePatient } from '~/services/patientService'
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

const initials = computed(() => {
  if (!patient.value) return ''
  const name = patient.value.fullName || `${patient.value.firstName ?? ''} ${patient.value.lastName ?? ''}`.trim()
  return name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
})

function formatDate(d?: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchPatient() {
  try {
    patient.value = await getPatient(id)
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
</style>
