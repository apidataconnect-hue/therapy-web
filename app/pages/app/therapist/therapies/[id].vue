<template>
  <div class="td-page">
    <div class="td-page__top-bar">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" class="td-back-btn" @click="$router.back()">
        Terapias
      </v-btn>
      <v-menu v-if="process" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" />
        </template>
        <v-list density="compact">
          <!-- draft → active -->
          <v-list-item
            v-if="process.processStatus === 'draft'"
            prepend-icon="mdi-check-circle-outline"
            title="Activar terapia"
            @click="openConfirm('activate')"
          />
          <!-- paused → active -->
          <v-list-item
            v-if="process.processStatus === 'paused'"
            prepend-icon="mdi-play-circle-outline"
            title="Reanudar terapia"
            @click="openConfirm('resume')"
          />
          <!-- active → paused -->
          <v-list-item
            v-if="process.processStatus === 'active'"
            prepend-icon="mdi-pause-circle-outline"
            title="Pausar terapia"
            @click="openConfirm('pause')"
          />
          <!-- active/paused → closed -->
          <v-list-item
            v-if="process.processStatus === 'active' || process.processStatus === 'paused'"
            prepend-icon="mdi-check-all"
            title="Cerrar terapia"
            @click="openConfirm('close')"
          />
          <!-- disabled → active -->
          <v-list-item
            v-if="process.processStatus === 'disabled'"
            prepend-icon="mdi-play-circle-outline"
            title="Habilitar terapia"
            @click="openConfirm('enable')"
          />
          <!-- archived → active -->
          <v-list-item
            v-if="process.processStatus === 'archived'"
            prepend-icon="mdi-package-up"
            title="Desarchivar terapia"
            @click="openConfirm('unarchive')"
          />
          <v-divider v-if="process.processStatus !== 'disabled' && process.processStatus !== 'archived'" />
          <!-- disable (from active/draft/paused) -->
          <v-list-item
            v-if="process.processStatus !== 'disabled' && process.processStatus !== 'archived' && process.processStatus !== 'closed'"
            prepend-icon="mdi-cancel"
            title="Deshabilitar terapia"
            @click="openConfirm('disable')"
          />
          <!-- archive (from any except archived) -->
          <v-list-item
            v-if="process.processStatus !== 'archived'"
            prepend-icon="mdi-archive-outline"
            title="Archivar terapia"
            @click="openConfirm('archive')"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-delete-outline"
            title="Eliminar terapia"
            class="td-action--danger"
            @click="openConfirm('delete')"
          />
        </v-list>
      </v-menu>
    </div>

    <!-- Loading inicial -->
    <div v-if="loading" class="td-loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <template v-else-if="process">
      <!-- Ficha de identidad del proceso -->
      <div class="td-identity">
        <div class="td-identity__meta">
          <div v-if="patientName" class="td-identity__patient">
            <v-icon icon="mdi-account-circle-outline" size="15" class="mr-1" />
            {{ patientName }}
          </div>
          <div class="td-identity__meta-right">
            <span v-if="process.openedAt" class="td-identity__date">
              Desde {{ formatDate(process.openedAt) }}
            </span>
            <span v-if="process.closedAt" class="td-identity__date">
              · Cerrado {{ formatDate(process.closedAt) }}
            </span>
            <span class="td-status-badge" :class="'td-status-badge--' + process.processStatus">
              <span class="td-status-badge__dot" />
              {{ statusLabel(process.processStatus) }}
            </span>
          </div>
        </div>
        <h4 class="td-identity__title">{{ process.reasonForConsultation }}</h4>

        <!-- ── Tags ────────────────────────────────────────────────────────── -->
        <div class="td-tags">
          <transition-group name="td-tag" tag="div" class="td-tags__list">
            <span
              v-for="tag in process.tags"
              :key="tag.id"
              class="td-tag-pill"
              :style="{ '--tag-color': tag.color ?? '#9E9E9E' }"
            >
              {{ tag.name }}
              <button
                type="button"
                class="td-tag-pill__remove"
                :disabled="removingTagId === tag.id"
                :title="'Quitar ' + tag.name"
                @click="removeTag(tag)"
              >
                <v-progress-circular
                  v-if="removingTagId === tag.id"
                  indeterminate
                  size="10"
                  width="1.5"
                />
                <v-icon v-else icon="mdi-close" size="12" />
              </button>
            </span>
          </transition-group>

          <!-- Add tag button -->
          <v-menu
            v-model="tagMenuOpen"
            :close-on-content-click="false"
            location="bottom start"
            max-width="240"
          >
            <template #activator="{ props: menuProps }">
              <button
                v-bind="menuProps"
                type="button"
                class="td-tags__add-btn"
                title="Añadir etiqueta"
              >
                <v-icon icon="mdi-tag-plus-outline" size="14" class="mr-1" />
                Añadir etiqueta
              </button>
            </template>

            <v-card class="td-tag-menu">
              <div class="td-tag-menu__search">
                <v-text-field
                  v-model="tagSearch"
                  placeholder="Buscar…"
                  prepend-inner-icon="mdi-magnify"
                  variant="plain"
                  density="compact"
                  hide-details
                  autofocus
                />
              </div>
              <v-divider />
              <div class="td-tag-menu__list">
                <div v-if="tagStore.loading" class="td-tag-menu__loading">
                  <v-progress-circular indeterminate color="primary" size="22" />
                </div>
                <template v-else>
                  <div
                    v-if="filteredMenuTags.length === 0"
                    class="td-tag-menu__empty"
                  >Sin etiquetas disponibles</div>
                  <button
                    v-for="tag in filteredMenuTags"
                    :key="tag.id"
                    type="button"
                    class="td-tag-menu__item"
                    :class="{ 'td-tag-menu__item--applied': isApplied(tag.id), 'td-tag-menu__item--loading': addingTagId === tag.id }"
                    @click="toggleTag(tag)"
                  >
                    <span class="td-tag-menu__dot" :style="{ background: tag.color ?? '#9E9E9E' }" />
                    <span class="td-tag-menu__name">{{ tag.name }}</span>
                    <v-progress-circular
                      v-if="addingTagId === tag.id"
                      indeterminate
                      size="14"
                      width="2"
                      class="ml-auto"
                    />
                    <v-icon
                      v-else-if="isApplied(tag.id)"
                      icon="mdi-check"
                      size="16"
                      color="primary"
                      class="ml-auto"
                    />
                  </button>
                </template>
              </div>
            </v-card>
          </v-menu>
        </div>
      </div>

      <!-- Observaciones iniciales -->
      <div v-if="process.initialObservations" class="td-observations">
        <div class="td-observations__label">Observaciones iniciales</div>
        <p class="td-observations__text">{{ process.initialObservations }}</p>
      </div>

      <!-- Sección de sesiones -->
      <div class="td-section">
        <div class="td-section__header">
          <div class="td-section__header-left">
            <v-icon icon="mdi-calendar-check-outline" size="18" color="primary" class="mr-2" />
            <span class="td-section__title">Sesiones</span>
          </div>
          <span class="td-section__count">{{ sessions.length }}</span>
        </div>

        <div v-if="sessions.length === 0" class="td-empty">
          <v-icon icon="mdi-calendar-blank-outline" size="36" color="disabled" />
          <p class="td-empty__text">Sin sesiones registradas en esta terapia</p>
        </div>

        <template v-else>
          <!-- Próximas -->
          <div class="td-subsection-label td-subsection-label--upcoming">
            <span class="td-subsection-label__text">Próximas</span>
            <span class="td-subsection-label__count">{{ upcomingSessions.length }}</span>
          </div>
          <div v-if="upcomingSessions.length === 0" class="td-empty td-empty--sm">
            <v-icon icon="mdi-calendar-remove-outline" size="18" color="disabled" />
            <p class="td-empty__text">Sin sesiones próximas</p>
          </div>
          <div v-else class="td-sessions">
            <NuxtLink
              v-for="session in upcomingSessions"
              :key="session.id"
              :to="`/app/therapist/sessions/${session.id}`"
              class="td-session td-session--link"
            >
              <div class="td-session__bar" :class="'td-session__bar--' + session.appointmentStatus" />
              <div class="td-session__date-block">
                <span class="td-session__day">{{ sessionDay(session.startAt) }}</span>
                <span class="td-session__month">{{ sessionMonth(session.startAt) }}</span>
              </div>
              <div class="td-session__body">
                <div class="td-session__time">
                  {{ sessionTime(session.startAt) }} – {{ sessionTime(session.endAt) }}
                  <span class="td-session__duration">{{ sessionDuration(session.startAt, session.endAt) }}</span>
                </div>
                <div class="td-session__type">
                  <v-icon :icon="typeIcon(session.appointmentType)" size="13" class="mr-1" />
                  {{ typeLabel(session.appointmentType) }}
                  <span v-if="session.locationText" class="td-session__location">· {{ session.locationText }}</span>
                </div>
              </div>
              <span class="td-appt-badge" :class="'td-appt-badge--' + session.appointmentStatus">
                {{ apptStatusLabel(session.appointmentStatus) }}
              </span>
              <v-icon icon="mdi-chevron-right" size="16" class="td-session__chevron" />
            </NuxtLink>
          </div>

          <!-- Pasadas -->
          <div class="td-subsection-label td-subsection-label--past">
            <span class="td-subsection-label__text">Pasadas</span>
            <span class="td-subsection-label__count">{{ pastSessions.length }}</span>
          </div>
          <div v-if="pastSessions.length === 0" class="td-empty td-empty--sm">
            <v-icon icon="mdi-history" size="18" color="disabled" />
            <p class="td-empty__text">Sin sesiones anteriores</p>
          </div>
          <div v-else class="td-sessions">
            <NuxtLink
              v-for="session in pastSessions"
              :key="session.id"
              :to="`/app/therapist/sessions/${session.id}`"
              class="td-session td-session--link"
            >
              <div class="td-session__bar" :class="'td-session__bar--' + session.appointmentStatus" />
              <div class="td-session__date-block">
                <span class="td-session__day">{{ sessionDay(session.startAt) }}</span>
                <span class="td-session__month">{{ sessionMonth(session.startAt) }}</span>
              </div>
              <div class="td-session__body">
                <div class="td-session__time">
                  {{ sessionTime(session.startAt) }} – {{ sessionTime(session.endAt) }}
                  <span class="td-session__duration">{{ sessionDuration(session.startAt, session.endAt) }}</span>
                </div>
                <div class="td-session__type">
                  <v-icon :icon="typeIcon(session.appointmentType)" size="13" class="mr-1" />
                  {{ typeLabel(session.appointmentType) }}
                  <span v-if="session.locationText" class="td-session__location">· {{ session.locationText }}</span>
                </div>
              </div>
              <span class="td-appt-badge" :class="'td-appt-badge--' + session.appointmentStatus">
                {{ apptStatusLabel(session.appointmentStatus) }}
              </span>
              <v-icon icon="mdi-chevron-right" size="16" class="td-session__chevron" />
            </NuxtLink>
          </div>
        </template>
      </div>
    </template>

    <!-- Confirm dialog (process actions) -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-body-1 font-weight-bold pt-5 px-5">{{ confirmTitle }}</v-card-title>
        <v-card-text class="px-5 pb-2 text-medium-emphasis">{{ confirmText }}</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Cancelar</v-btn>
          <v-btn
            :color="confirmAction === 'delete' ? 'error' : 'primary'"
            variant="flat"
            :loading="actionLoading"
            @click="executeAction"
          >Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProcess, disableProcess, archiveProcess, deleteProcess, updateProcess, addTagToProcess, removeTagFromProcess, type ProcessStatus } from '~/services/processService'
import { getPatient } from '~/services/patientService'
import { useTagStore } from '~/stores/tag'
import type { Appointment, AppointmentType, AppointmentStatus } from '~/services/appointmentService'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const route = useRoute()
const router = useRouter()
const tagStore = useTagStore()
const id = route.params.id as string
const process = ref<any>(null)
const patientName = ref((route.query.patientName as string) || '')
const sessions = ref<Appointment[]>([])
const loading = ref(true)
const error = ref('')

// ── Tag management ──────────────────────────────────────────────────────────────
const tagMenuOpen    = ref(false)
const tagSearch      = ref('')
const addingTagId    = ref<string | null>(null)
const removingTagId  = ref<string | null>(null)

// Re-fetch tags every time the menu opens (covers cold/stale state)
watch(tagMenuOpen, (open) => {
  if (open) {
    tagSearch.value = ''
    tagStore.fetchTags(true)
  }
})

const filteredMenuTags = computed(() => {
  const q = tagSearch.value.trim().toLowerCase()
  const list = tagStore.activeTags
  return q ? list.filter(t => t.name.toLowerCase().includes(q)) : list
})

function isApplied(tagId: string) {
  return process.value?.tags?.some((t: any) => t.id === tagId) ?? false
}

async function toggleTag(tag: { id: string; name: string; color?: string | null }) {
  if (addingTagId.value || removingTagId.value) return
  if (isApplied(tag.id)) {
    await removeTag(tag)
  } else {
    addingTagId.value = tag.id
    try {
      await addTagToProcess(id, tag.id)
      process.value.tags = [...(process.value.tags ?? []), tag]
    } catch (e) {
      console.error('[therapies/id] addTag error', e)
    } finally {
      addingTagId.value = null
    }
  }
}

async function removeTag(tag: { id: string; name: string; color?: string | null }) {
  removingTagId.value = tag.id
  try {
    await removeTagFromProcess(id, tag.id)
    process.value.tags = (process.value.tags ?? []).filter((t: any) => t.id !== tag.id)
  } catch (e) {
    console.error('[therapies/id] removeTag error', e)
  } finally {
    removingTagId.value = null
  }
}

// ── Status helpers ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<ProcessStatus, string> = {
  draft: '#7785AC',
  active: '#2E8B57',
  paused: '#C77B2C',
  closed: '#9E9E9E',
  disabled: '#B0583A',
  archived: '#607D8B',
}
const STATUS_LABELS: Record<ProcessStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  paused: 'Pausado',
  closed: 'Cerrado',
  disabled: 'Deshabilitado',
  archived: 'Archivado',
}
function statusColor(status: ProcessStatus) { return STATUS_COLORS[status] ?? '#9E9E9E' }
function statusLabel(status: ProcessStatus) { return STATUS_LABELS[status] ?? status }

// ── Appointment type helpers ────────────────────────────────────────────────────
const TYPE_ICONS: Record<AppointmentType, string> = {
  in_person:  'mdi-office-building-outline',
  online:     'mdi-video-outline',
  phone:      'mdi-phone-outline',
  home_visit: 'mdi-home-outline',
}
const TYPE_LABELS: Record<AppointmentType, string> = {
  in_person:  'Presencial',
  online:     'Online',
  phone:      'Teléfono',
  home_visit: 'Domicilio',
}
function typeIcon(t: AppointmentType) { return TYPE_ICONS[t] ?? 'mdi-calendar-outline' }
function typeLabel(t: AppointmentType) { return TYPE_LABELS[t] ?? t }

// ── Appointment status helpers ──────────────────────────────────────────────────
const APPT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled:  '#7785AC',
  confirmed:  '#5B2A86',
  completed:  '#2E8B57',
  cancelled:  '#C0392B',
  no_show:    '#C77B2C',
}
const APPT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled:  'Programada',
  confirmed:  'Confirmada',
  completed:  'Completada',
  cancelled:  'Cancelada',
  no_show:    'No asistió',
}
function apptStatusColor(s: AppointmentStatus) { return APPT_STATUS_COLORS[s] ?? '#9E9E9E' }
function apptStatusLabel(s: AppointmentStatus) { return APPT_STATUS_LABELS[s] ?? s }

// ── Session split ──────────────────────────────────────────────────────────────
const now = new Date().toISOString()
const upcomingSessions = computed(() =>
  sessions.value
    .filter(s => s.startAt >= now && (s.appointmentStatus === 'scheduled' || s.appointmentStatus === 'confirmed'))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
)
const pastSessions = computed(() =>
  sessions.value
    .filter(s => s.startAt < now || s.appointmentStatus === 'completed' || s.appointmentStatus === 'cancelled' || s.appointmentStatus === 'no_show')
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
)

// ── Date/time helpers ───────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}
function sessionDay(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit' })
}
function sessionMonth(iso: string) {
  return new Date(iso).toLocaleDateString('es', { month: 'short' })
}
function sessionTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function sessionDuration(startIso: string, endIso: string) {
  const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

// ── Actions ────────────────────────────────────────────────────────────────────
type ConfirmAction = 'activate' | 'resume' | 'pause' | 'close' | 'enable' | 'unarchive' | 'disable' | 'archive' | 'delete'

const confirmDialog = ref(false)
const confirmAction = ref<ConfirmAction>('disable')
const actionLoading = ref(false)

const CONFIRM_META: Record<ConfirmAction, { title: string; text: string }> = {
  activate: {
    title: 'Activar terapia',
    text: 'La terapia pasará de borrador a activa. ¿Continuar?',
  },
  resume: {
    title: 'Reanudar terapia',
    text: '¿Quieres reanudar esta terapia pausada?',
  },
  pause: {
    title: 'Pausar terapia',
    text: 'La terapia quedará temporalmente en pausa. Podrás reanudarla en cualquier momento.',
  },
  close: {
    title: 'Cerrar terapia',
    text: 'Se marcará la terapia como cerrada. Esto indica que el tratamiento ha finalizado. ¿Continuar?',
  },
  enable: {
    title: 'Habilitar terapia',
    text: '¿Quieres reactivar esta terapia como activa?',
  },
  unarchive: {
    title: 'Desarchivar terapia',
    text: '¿Quieres sacar esta terapia del archivo y reactivarla?',
  },
  disable: {
    title: 'Deshabilitar terapia',
    text: 'La terapia quedará temporalmente inactiva pero seguirá visible. ¿Continuar?',
  },
  archive: {
    title: 'Archivar terapia',
    text: 'La terapia pasará a modo solo lectura. No se podrán añadir más sesiones ni notas. ¿Continuar?',
  },
  delete: {
    title: 'Eliminar terapia',
    text: 'Esta acción es permanente y no se puede deshacer. ¿Seguro que quieres eliminar esta terapia?',
  },
}

const confirmTitle = computed(() => CONFIRM_META[confirmAction.value].title)
const confirmText  = computed(() => CONFIRM_META[confirmAction.value].text)

function openConfirm(action: ConfirmAction) {
  confirmAction.value = action
  confirmDialog.value = true
}

async function executeAction() {
  actionLoading.value = true
  try {
    switch (confirmAction.value) {
      case 'activate':
      case 'resume':
      case 'enable':
      case 'unarchive':
        await updateProcess(id, { processStatus: 'active' })
        router.replace('/app/therapist/therapies?tab=active')
        break
      case 'pause':
        await updateProcess(id, { processStatus: 'paused' })
        router.replace('/app/therapist/therapies?tab=inactive')
        break
      case 'close':
        await updateProcess(id, { processStatus: 'closed' })
        router.replace('/app/therapist/therapies?tab=archived')
        break
      case 'disable':
        await disableProcess(id)
        router.replace('/app/therapist/therapies?tab=inactive')
        break
      case 'archive':
        await archiveProcess(id)
        router.replace('/app/therapist/therapies?tab=archived')
        break
      case 'delete':
        await deleteProcess(id)
        router.replace('/app/therapist/therapies')
        break
    }
  } catch (e) {
    console.error('[therapies/[id]] action error', e)
    actionLoading.value = false
    confirmDialog.value = false
  }
}

// ── Data loading ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await tagStore.fetchTags()
  try {
    process.value = await getProcess(id)
    sessions.value = [...(process.value.appointments ?? [])]
      .sort((a: Appointment, b: Appointment) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    if (!patientName.value && process.value.patientId) {
      try {
        const patient = await getPatient(process.value.patientId)
        patientName.value = patient.fullName ?? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim()
      } catch { /* non-critical */ }
    }
  }
  catch {
    error.value = 'No se pudo cargar el proceso terapéutico.'
  }
  finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

// ── Page wrapper ──────────────────────────────────────────────────────────────
.td-page {
  padding: $space-4 $space-5 $space-7;
  max-width: 780px;
  margin: 0 auto;

  &__top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $space-4;
    margin-bottom: $space-5;
    border-bottom: 1px solid $color-divider;
  }
}

.td-back-btn {
  font-size: $font-size-sm !important;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  letter-spacing: 0;
}

.td-action--danger :deep(.v-list-item__prepend .v-icon),
.td-action--danger :deep(.v-list-item-title) {
  color: rgb(var(--v-theme-error)) !important;
}

.td-loading {
  display: flex;
  justify-content: center;
  padding: $space-7 0;
}

// ── Process identity card ─────────────────────────────────────────────────────
.td-identity {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  padding: $space-5 $space-6;
  margin-bottom: $space-5;

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    margin-bottom: $space-3;
  }

  &__meta-right {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-shrink: 0;
  }

  &__date {
    font-size: $font-size-sm;
    color: $color-text-muted;
    line-height: $line-height-normal;
    white-space: nowrap;
  }

  &__patient {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-secondary;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    line-height: $line-height-tight;
    letter-spacing: -0.01em;
    margin: 0 0 $space-4;
  }
}

// ── Process status badge ──────────────────────────────────────────────────────
.td-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.03em;
  padding: 3px 10px 3px 8px;
  border-radius: $radius-full;

  &__dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--active {
    background: color-mix(in srgb, #{$color-success} 12%, transparent);
    color: $color-success;
    border: 1px solid color-mix(in srgb, #{$color-success} 28%, transparent);
  }
  &--draft {
    background: color-mix(in srgb, #{$color-info} 12%, transparent);
    color: $color-info;
    border: 1px solid color-mix(in srgb, #{$color-info} 28%, transparent);
  }
  &--paused {
    background: color-mix(in srgb, #{$color-warning} 12%, transparent);
    color: $color-warning;
    border: 1px solid color-mix(in srgb, #{$color-warning} 28%, transparent);
  }
  &--closed {
    background: $color-disabled-bg;
    color: $color-text-muted;
    border: 1px solid $color-border;
  }
  &--disabled {
    background: color-mix(in srgb, #{$color-error} 10%, transparent);
    color: $color-error;
    border: 1px solid color-mix(in srgb, #{$color-error} 22%, transparent);
  }
  &--archived {
    background: $color-disabled-bg;
    color: $color-text-muted;
    border: 1px solid $color-border;
  }
}

// ── Tag row ───────────────────────────────────────────────────────────────────
.td-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $space-2;

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    align-items: center;
  }

  &__add-btn {
    display: inline-flex;
    align-items: center;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $color-text-muted;
    padding: 4px 10px;
    border-radius: $radius-full;
    border: 1.5px dashed $color-border;
    background: transparent;
    cursor: pointer;
    transition: border-color $transition-fast, color $transition-fast, background $transition-fast;
    outline: none;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
      background: $color-primary-subtle;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }
}

.td-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  padding: 4px 8px 4px 10px;
  border-radius: $radius-full;
  background: color-mix(in srgb, var(--tag-color) 13%, transparent);
  color: var(--tag-color);
  border: 1px solid color-mix(in srgb, var(--tag-color) 28%, transparent);
  letter-spacing: 0.02em;

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    opacity: 0.65;
    padding: 0;
    flex-shrink: 0;
    transition: opacity $transition-fast, background $transition-fast;

    &:hover { opacity: 1; background: color-mix(in srgb, var(--tag-color) 20%, transparent); }
    &:disabled { cursor: default; opacity: 0.45; }
  }
}

// Transition for adding/removing tag pills
.td-tag-enter-active,
.td-tag-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.td-tag-enter-from   { opacity: 0; transform: scale(0.85); }
.td-tag-leave-to     { opacity: 0; transform: scale(0.85); }

// ── Tag dropdown menu ─────────────────────────────────────────────────────────
.td-tag-menu {
  &__search {
    padding: 0 $space-3;
  }

  &__list {
    max-height: 220px;
    overflow-y: auto;
    padding: $space-1 0;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: $space-4;
  }

  &__empty {
    font-size: $font-size-sm;
    color: $color-text-muted;
    padding: $space-3 $space-4;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    width: 100%;
    padding: $space-2 $space-4;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-main;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background $transition-fast;

    &:hover { background: rgba(var(--v-theme-primary), 0.06); }
    &--applied { background: rgba(var(--v-theme-primary), 0.04); }
    &--loading { opacity: 0.7; pointer-events: none; }
  }

  &__dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── Initial observations block ────────────────────────────────────────────────
.td-observations {
  background: $color-surface;
  border: 1px solid $color-border;
  border-left: 3px solid $color-primary-muted;
  border-radius: $radius-lg;
  padding: $space-4 $space-5;
  margin-bottom: $space-5;

  &__label {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $color-text-muted;
    margin-bottom: $space-2;
  }

  &__text {
    font-size: $font-size-base;
    color: $color-text-main;
    line-height: 1.65;
    margin: 0;
    white-space: pre-wrap;
  }
}

// ── Sessions section ──────────────────────────────────────────────────────────
.td-section {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $space-3;
    margin-bottom: $space-4;
    border-bottom: 1.5px solid $color-divider;
  }

  &__header-left {
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    letter-spacing: -0.01em;
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 $space-2;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    background: $color-primary-subtle;
    color: $color-primary;
    border-radius: $radius-full;
  }
}

// ── Subsection labels ─────────────────────────────────────────────────────────
.td-subsection-label {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin: $space-5 0 $space-3;
  padding-left: $space-3;
  border-left: 3px solid transparent;

  &--upcoming { border-left-color: $color-primary; }
  &--past     { border-left-color: $color-border; }

  &__text {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    letter-spacing: 0.01em;
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 18px;
    padding: 0 6px;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    border-radius: $radius-full;
  }
}

.td-subsection-label--upcoming .td-subsection-label__count {
  background: $color-primary-subtle;
  color: $color-primary;
}
.td-subsection-label--past .td-subsection-label__count {
  background: $color-disabled-bg;
  color: $color-text-muted;
}

// ── Empty states ──────────────────────────────────────────────────────────────
.td-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-6 0;
  border: 1px dashed $color-border;
  border-radius: $radius-lg;

  &__text {
    margin-top: $space-2;
    font-size: $font-size-sm;
    color: $color-text-muted;
  }

  &--sm {
    flex-direction: row;
    gap: $space-2;
    padding: $space-3 $space-4;
    border: none;
    background: $color-disabled-bg;
    border-radius: $radius-md;

    .td-empty__text {
      margin-top: 0;
    }
  }
}

// ── Sessions list ─────────────────────────────────────────────────────────────
.td-sessions {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

// ── Session card ──────────────────────────────────────────────────────────────
.td-session {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  padding: $space-3 $space-4 $space-3 0;

  &--link {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: border-color $transition-normal, box-shadow $transition-normal, transform $transition-fast;

    &:hover {
      border-color: $color-primary-muted;
      box-shadow: $shadow-sm;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: none;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__bar {
    flex-shrink: 0;
    width: 4px;
    align-self: stretch;

    &--scheduled { background: $color-info; }
    &--confirmed { background: $color-primary; }
    &--completed { background: $color-success; }
    &--cancelled { background: $color-error; }
    &--no_show   { background: $color-warning; }
  }

  &__date-block {
    flex-shrink: 0;
    width: 48px;
    text-align: center;
    background: $color-primary-subtle;
    border-radius: $radius-md;
    padding: $space-2 $space-1;
  }

  &__day {
    display: block;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-primary;
    line-height: 1.1;
  }

  &__month {
    display: block;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-primary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 1px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__time {
    display: flex;
    align-items: baseline;
    gap: $space-2;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    line-height: $line-height-tight;
  }

  &__duration {
    font-size: $font-size-sm;
    font-weight: $font-weight-regular;
    color: $color-text-muted;
  }

  &__type {
    display: flex;
    align-items: center;
    margin-top: 3px;
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }

  &__location {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $color-text-muted;
  }

  &__chevron {
    flex-shrink: 0;
    color: $color-text-muted;
    opacity: 0.7;
  }
}

// ── Appointment status badge ──────────────────────────────────────────────────
.td-appt-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.02em;
  padding: 3px 9px;
  border-radius: $radius-full;
  white-space: nowrap;

  &--scheduled {
    background: color-mix(in srgb, #{$color-info} 12%, transparent);
    color: $color-info;
  }
  &--confirmed {
    background: $color-primary-subtle;
    color: $color-primary;
  }
  &--completed {
    background: color-mix(in srgb, #{$color-success} 12%, transparent);
    color: $color-success;
  }
  &--cancelled {
    background: color-mix(in srgb, #{$color-error} 10%, transparent);
    color: $color-error;
  }
  &--no_show {
    background: color-mix(in srgb, #{$color-warning} 12%, transparent);
    color: $color-warning;
  }
}
</style>

