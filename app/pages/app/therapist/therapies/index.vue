<template>
  <div class="tq-page">
    <!-- Header -->
    <div class="tq-page__header">
      <div>
        <div class="tq-page__title-wrap">
          <v-icon icon="mdi-clipboard-pulse-outline" size="26" color="primary" class="mr-2" />
          <span class="tq-page__title">Terapias</span>
        </div>
        <p class="tq-page__subtitle">Procesos terapéuticos de tus pacientes</p>
      </div>
      <div class="tq-page__header-actions">
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-tag-outline"
          size="small"
          @click="tagManagerOpen = true"
        >
          Etiquetas
        </v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" size="small" @click="createDialog = true">
          Nueva terapia
        </v-btn>
      </div>
    </div>

    <!-- Search + tag filter -->
    <div class="tq-toolbar">
      <v-text-field
        v-model="search"
        placeholder="Buscar por nombre de paciente…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="tq-search"
      />
      <div v-if="tagStore.activeTags.length > 0" class="tq-tag-filter">
        <span class="tq-tag-filter__label">Filtrar:</span>
        <button
          v-for="tag in tagStore.activeTags"
          :key="tag.id"
          type="button"
          class="tq-tag-chip"
          :class="{ 'tq-tag-chip--active': selectedTagIds.includes(tag.id) }"
          :style="selectedTagIds.includes(tag.id) ? { background: tag.color ?? '#9E9E9E', color: '#fff', borderColor: tag.color ?? '#9E9E9E' } : { borderColor: tag.color ?? '#9E9E9E', color: tag.color ?? '#9E9E9E' }"
          @click="toggleTagFilter(tag.id)"
        >
          {{ tag.name }}
        </button>
        <button
          v-if="selectedTagIds.length > 0"
          type="button"
          class="tq-tag-chip tq-tag-chip--clear"
          @click="selectedTagIds = []"
        >
          <v-icon icon="mdi-close" size="11" class="mr-1" />Limpiar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tab" class="app-tabs mb-4" color="primary" density="compact">
      <v-tab value="active">
        Activos
        <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'active' }">{{ counts.active }}</span>
      </v-tab>
      <v-tab value="draft">
        Borrador
        <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'draft' }">{{ counts.draft }}</span>
      </v-tab>
      <v-tab value="paused">
        Pausados
        <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'paused' }">{{ counts.paused }}</span>
      </v-tab>
      <v-tab value="archived">
        Archivados
        <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'archived' }">{{ counts.archived }}</span>
      </v-tab>
    </v-tabs>

    <!-- Loading -->
    <div v-if="loading" class="tq-page__loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <template v-else>
      <!-- Empty -->
      <div v-if="filteredList.length === 0" class="tq-page__empty">
        <v-icon icon="mdi-clipboard-off-outline" size="48" color="disabled" />
        <p class="mt-3 text-medium-emphasis">{{ search ? 'Sin resultados para tu búsqueda.' : 'No hay terapias en este apartado.' }}</p>
      </div>

      <!-- List -->
      <div v-else class="tq-list">
        <div
          v-for="proc in filteredList"
          :key="proc.id"
          class="tq-card"
          role="button"
          tabindex="0"
          @click="router.push({ path: `/app/therapist/therapies/${proc.id}`, query: { patientName: proc.patientName ?? '' } })"
          @keyup.enter="router.push({ path: `/app/therapist/therapies/${proc.id}`, query: { patientName: proc.patientName ?? '' } })"
        >
          <!-- Status bar -->
          <div class="tq-card__status-bar" :class="`tq-card__status-bar--${proc.processStatus}`" />

          <!-- Body -->
          <div class="tq-card__body">
            <div class="tq-card__name">{{ proc.patientName ?? '—' }}</div>
            <div class="tq-card__reason">{{ proc.reasonForConsultation }}</div>
            <div class="tq-card__meta">
              <span v-if="tab === 'active' && proc.nextAppointmentAt" class="tq-card__next">
                <v-icon icon="mdi-calendar-clock-outline" size="13" class="mr-1" />
                Próxima: {{ formatDate(proc.nextAppointmentAt) }}
              </span>
              <span v-else-if="tab === 'active'" class="tq-card__no-appt">Sin cita programada</span>
              <span v-if="proc.openedAt" class="tq-card__date">
                Desde {{ formatDate(proc.openedAt) }}
              </span>
              <span v-if="proc.closedAt" class="tq-card__date tq-card__date--closed">
                · Cerrado {{ formatDate(proc.closedAt) }}
              </span>
            </div>
            <div v-if="proc.tags?.length" class="tq-card__tags">
              <v-chip
                v-for="tag in proc.tags"
                :key="tag.id"
                :color="tag.color ?? undefined"
                size="x-small"
                variant="tonal"
                class="mr-1"
              >{{ tag.name }}</v-chip>
            </div>
          </div>

          <v-icon icon="mdi-chevron-right" size="20" class="tq-card__arrow" />
        </div>
      </div>
    </template>

    <!-- Tag manager -->
    <TagManager v-model="tagManagerOpen" />

    <!-- Create therapy dialog -->
    <v-dialog v-model="createDialog" max-width="520" :persistent="createLoading">
      <v-card>
        <v-card-title class="pt-5 px-5 text-body-1 font-weight-bold">Nueva terapia</v-card-title>
        <v-card-text class="px-5 pb-2">
          <!-- Patient search -->
          <v-autocomplete
            v-model="newPatientId"
            :items="patientOptions"
            item-title="fullName"
            item-value="id"
            label="Paciente *"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="compact"
            :loading="patientSearchLoading"
            no-data-text="Sin resultados"
            clearable
            hide-details="auto"
            class="mb-3"
          />
          <!-- Reason -->
          <v-textarea
            v-model="newReason"
            label="Motivo de consulta *"
            variant="outlined"
            density="compact"
            rows="3"
            hide-details="auto"
            counter="500"
            maxlength="500"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" :disabled="createLoading" @click="closeCreateDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="createLoading"
            :disabled="!newPatientId || !newReason.trim()"
            @click="submitCreate"
          >Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProcesses, createProcess, type TherapyProcess, type ProcessStatus } from '~/services/processService'
import { getPatients } from '~/services/patientService'
import { useTagStore } from '~/stores/tag'
import TagManager from '~/components/base/TagManager.vue'

definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })

const router = useRouter()
const route = useRoute()
const tagStore = useTagStore()
const tagManagerOpen = ref(false)
const selectedTagIds = ref<string[]>([])

function toggleTagFilter(id: string) {
  const idx = selectedTagIds.value.indexOf(id)
  if (idx === -1) selectedTagIds.value.push(id)
  else selectedTagIds.value.splice(idx, 1)
}

const tab = ref<'active' | 'draft' | 'paused' | 'archived'>(
  (['active', 'draft', 'paused', 'archived'].includes(route.query.tab as string)
    ? route.query.tab as 'active' | 'draft' | 'paused' | 'archived'
    : 'active')
)
const loading = ref(true)

const activeList   = ref<TherapyProcess[]>([])
const draftList    = ref<TherapyProcess[]>([])
const pausedList   = ref<TherapyProcess[]>([])
const archivedList = ref<TherapyProcess[]>([])

const currentList = computed(() => {
  if (tab.value === 'active')   return activeList.value
  if (tab.value === 'draft')    return draftList.value
  if (tab.value === 'paused')   return pausedList.value
  return archivedList.value
})

const search = ref('')
const filteredList = computed(() => {
  let list = currentList.value
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(p => (p.patientName ?? '').toLowerCase().includes(q))
  if (selectedTagIds.value.length > 0) {
    list = list.filter(p =>
      p.tags?.some((t: any) => selectedTagIds.value.includes(t.id))
    )
  }
  return list
})

const counts = computed(() => ({
  active:   activeList.value.length,
  draft:    draftList.value.length,
  paused:   pausedList.value.length,
  archived: archivedList.value.length,
}))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Create dialog ────────────────────────────────────────────────────────────
const createDialog    = ref(false)
const createLoading   = ref(false)
const newPatientId    = ref<string | null>(null)
const newReason       = ref('')
const patientSearchLoading = ref(false)
const patientOptions  = ref<any[]>([])

function closeCreateDialog() {
  createDialog.value = false
  newPatientId.value = null
  newReason.value    = ''
}

async function submitCreate() {
  if (!newPatientId.value || !newReason.value.trim()) return
  createLoading.value = true
  try {
    await createProcess({ patientId: newPatientId.value, reasonForConsultation: newReason.value.trim() })
    closeCreateDialog()
    await loadAll()
  } catch (e) {
    console.error('[therapies] create error', e)
  } finally {
    createLoading.value = false
  }
}

// ── Data loading ─────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const [a, d, p, ar] = await Promise.all([
      getProcesses({ processStatus: ['active'], sortBy: 'nextAppointmentAt', order: 'asc', size: 100 }),
      getProcesses({ processStatus: ['draft'], sortBy: 'openedAt', order: 'desc', size: 100 }),
      getProcesses({ processStatus: ['paused', 'disabled'], sortBy: 'openedAt', order: 'desc', size: 100 }),
      getProcesses({ processStatus: ['closed', 'archived'], sortBy: 'closedAt', order: 'desc', size: 100 }),
    ])
    activeList.value   = a.items ?? []
    draftList.value    = d.items ?? []
    pausedList.value   = p.items ?? []
    archivedList.value = ar.items ?? []
  }
  catch (e) {
    console.error('[therapies] load error', e)
  }
}

onMounted(async () => {
  tagStore.fetchTags()
  await loadAll()
  patientSearchLoading.value = true
  try {
    const pData = await getPatients()
    patientOptions.value = (pData.items ?? []).map((p: any) => ({
      ...p,
      fullName: p.fullName ?? (p.firstName ? `${p.firstName} ${p.lastName}` : p.id),
    }))
  } finally {
    patientSearchLoading.value = false
  }
  loading.value = false
})
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.tq-page {
  padding: $space-5;
  max-width: 720px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: $space-4;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-shrink: 0;
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

  &__loading,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-7 0;
  }
}



// ── Toolbar (search + tag filter) ─────────────────────────────────────────────
.tq-toolbar {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-bottom: $space-3;
}

.tq-search { max-width: 400px; }

.tq-tag-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $space-1;

  &__label {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: $space-1;
  }
}

.tq-tag-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: $font-weight-medium;
  padding: 2px 10px;
  border-radius: $radius-full;
  border: 1.5px solid;
  background: transparent;
  cursor: pointer;
  transition: background $transition-fast, color $transition-fast, transform $transition-fast;
  outline: none;

  &:hover { transform: translateY(-1px); }
  &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }

  &--clear {
    border-color: $color-text-muted !important;
    color: $color-text-muted !important;
    background: transparent !important;
    font-size: 0.68rem;
  }
}

.tq-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-top: $space-3;
}

.tq-card {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  cursor: pointer;
  transition: box-shadow $transition-fast, border-color $transition-fast, transform $transition-fast;

  &:hover {
    border-color: $color-primary-light;
    box-shadow: $shadow-sm;
    transform: translateY(-1px);
  }

  &__status-bar {
    flex-shrink: 0;
    width: 4px;
    align-self: stretch;
    border-radius: $radius-xs;

    &--active   { background: #2E8B57; }
    &--draft    { background: #7785AC; }
    &--paused   { background: #C77B2C; }
    &--closed   { background: #9E9E9E; }
    &--disabled { background: #B0583A; }
    &--archived { background: #607D8B; }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  &__reason {
    font-size: $font-size-sm;
    font-weight: $font-weight-regular;
    color: $color-text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: $space-1;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-2;
    margin-bottom: $space-1;
  }

  &__next {
    display: flex;
    align-items: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-primary;
  }

  &__no-appt {
    font-size: $font-size-sm;
    color: $color-text-muted;
    font-style: italic;
  }

  &__date {
    font-size: $font-size-sm;
    color: $color-text-muted;

    &--closed { font-style: italic; }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: $space-1;
  }

  &__arrow {
    flex-shrink: 0;
    color: $color-text-muted;
  }
}

// ── Tab activo ────────────────────────────────────────────────────────────────
:deep(.app-tabs) {
  .v-tab {
    border-radius: $radius-md $radius-md 0 0;
    transition: background 0.15s, color 0.15s;

    &.v-tab--selected {
      background: $color-primary-muted !important;
    }
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: $space-2;
  border-radius: $radius-full;
  font-size: 0.7rem;
  font-weight: $font-weight-semibold;
  background: rgba($color-text-muted, 0.12);
  color: $color-text-muted;
  transition: background 0.2s, color 0.2s;

  &--active {
    background: $color-primary;
    color: #fff;
  }
}
</style>
