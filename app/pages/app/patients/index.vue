<template>
  <div class="pt-page">

    <!-- Header -->
    <div class="pt-page__header">
      <div>
        <div class="pt-page__title-wrap">
          <v-icon icon="mdi-account-group-outline" size="26" color="primary" class="mr-2" />
          <span class="pt-page__title">Pacientes</span>
        </div>
        <p class="pt-page__subtitle">Gestiona tus pacientes</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-account-plus-outline"
        size="small"
        :to="'/app/patients/create'"
      >
        Nuevo paciente
      </v-btn>
    </div>

    <!-- Search -->
    <div class="pt-page__toolbar">
      <v-text-field
        v-model="search"
        placeholder="Buscar por nombre o email…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="pt-search"
      />
    </div>

    <!-- Tabs -->
    <div class="pt-tabs-section">
      <v-tabs v-model="tab" color="primary" density="compact" class="app-tabs">
        <v-tab value="active">
          Activos
          <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'active' }">{{ counts.active }}</span>
        </v-tab>
        <v-tab value="inactive">
          Inactivos
          <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'inactive' }">{{ counts.inactive }}</span>
        </v-tab>
        <v-tab value="archived">
          Archivados
          <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'archived' }">{{ counts.archived }}</span>
        </v-tab>
        <v-tab value="all">
          Todos
          <span v-if="!loading" class="tab-count" :class="{ 'tab-count--active': tab === 'all' }">{{ counts.all }}</span>
        </v-tab>
      </v-tabs>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="pt-page__loading">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <template v-else>
      <!-- Empty -->
      <div v-if="filteredList.length === 0" class="pt-page__empty">
        <v-icon icon="mdi-account-off-outline" size="52" color="disabled" />
        <p class="mt-3 text-medium-emphasis">
          {{ search ? 'Sin resultados para tu búsqueda.' : 'No hay pacientes en este apartado.' }}
        </p>
        <v-btn
          v-if="!search && tab === 'all'"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-account-plus-outline"
          size="small"
          class="mt-4"
          :to="'/app/patients/create'"
        >
          Nuevo paciente
        </v-btn>
      </div>

      <!-- Patient cards -->
      <div v-else class="pt-list">
        <div
          v-for="p in filteredList"
          :key="p.id"
          class="pt-card"
          role="button"
          tabindex="0"
          @click="router.push(`/app/patients/${p.id}`)"
          @keyup.enter="router.push(`/app/patients/${p.id}`)"
        >
          <!-- Status bar -->
          <div class="pt-card__status-bar" :class="`pt-card__status-bar--${p.patientStatus}`" />

          <!-- Avatar -->
          <div class="pt-card__avatar">
            <span>{{ initials(p) }}</span>
          </div>

          <!-- Info -->
          <div class="pt-card__info">
            <div class="pt-card__name">{{ p.fullName || `${p.firstName} ${p.lastName}` }}</div>
            <div v-if="p.email" class="pt-card__meta">
              <v-icon icon="mdi-email-outline" size="12" class="mr-1" />{{ p.email }}
            </div>
            <div v-if="p.phone" class="pt-card__meta">
              <v-icon icon="mdi-phone-outline" size="12" class="mr-1" />{{ p.phone }}
            </div>
          </div>

          <!-- Status chip + arrow -->
          <div class="pt-card__right">
            <span class="pt-status" :class="`pt-status--${p.patientStatus}`">
              {{ STATUS_LABELS[p.patientStatus] ?? p.patientStatus }}
            </span>
          </div>
          <div class="pt-card__arrow-wrap">
            <v-icon icon="mdi-chevron-right" size="18" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePatientStore } from '~/stores/patient'
import { getPatients } from '~/services/patientService'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const patientStore = usePatientStore()
const router = useRouter()
const loading = ref(false)
const search = ref('')
const tab = ref('active')

const STATUS_LABELS: Record<string, string> = {
  active:     'Activo',
  inactive:   'Inactivo',
  archived:   'Archivado',
  discharged: 'Alta',
}

const patients = ref<any[]>([])

function initials(p: any): string {
  const name = p.fullName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  return name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')
}

const byTab = computed(() =>
  tab.value === 'all' ? patients.value : patients.value.filter(p => p.patientStatus === tab.value),
)

const filteredList = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return byTab.value
  return byTab.value.filter(p =>
    (p.fullName ?? `${p.firstName} ${p.lastName}`).toLowerCase().includes(q) ||
    (p.email ?? '').toLowerCase().includes(q),
  )
})

const counts = computed(() => ({
  all:      patients.value.length,
  active:   patients.value.filter(p => p.patientStatus === 'active').length,
  inactive: patients.value.filter(p => p.patientStatus === 'inactive').length,
  archived: patients.value.filter(p => p.patientStatus === 'archived').length,
}))

onMounted(async () => {
  loading.value = true
  try {
    const data = await getPatients()
    patients.value = (data.items ?? []).map((p: any) => ({
      ...p,
      fullName: p.fullName ?? (p.firstName ? `${p.firstName} ${p.lastName}` : ''),
    }))
    patientStore.setPatients(patients.value, data.total ?? patients.value.length, data.page ?? 1, data.size ?? patients.value.length)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '~/assets/styles/tokens' as *;

// ── Page shell ────────────────────────────────────────────────────────────────
.pt-page {
  padding: $space-5;
  max-width: 860px;
  margin: 0 auto;
}

// ── Page header ───────────────────────────────────────────────────────────────
.pt-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-4;
  padding-bottom: $space-5;
  margin-bottom: $space-5;
  border-bottom: 1px solid $color-divider;
}

.pt-page__title-wrap {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-bottom: $space-1;
}

.pt-page__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-text-main;
  line-height: $line-height-tight;
  letter-spacing: -0.01em;
}

.pt-page__subtitle {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 0;
  padding-left: 36px;
  line-height: $line-height-normal;
}

// ── Toolbar (search) ──────────────────────────────────────────────────────────
.pt-page__toolbar {
  margin-bottom: $space-4;
}

.pt-search {
  // full width of container
}

// ── Tabs section ──────────────────────────────────────────────────────────────
.pt-tabs-section {
  border-bottom: 2px solid $color-divider;
  margin-bottom: $space-4;
}

:deep(.app-tabs) {
  .v-tab {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-secondary;
    letter-spacing: 0.01em;
    border-radius: $radius-md $radius-md 0 0;
    min-width: 88px;
    transition: background $transition-fast, color $transition-fast;

    &:hover:not(.v-tab--selected) {
      background: $color-hover;
      color: $color-text-main;
    }

    &.v-tab--selected {
      color: $color-primary;
      font-weight: $font-weight-semibold;
      background: $color-primary-subtle !important;
    }
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  margin-left: $space-2;
  border-radius: $radius-full;
  font-size: 0.68rem;
  font-weight: $font-weight-semibold;
  background: rgba($color-text-muted, 0.10);
  color: $color-text-muted;
  transition: background $transition-fast, color $transition-fast;

  &--active {
    background: $color-primary;
    color: #fff;
  }
}

// ── Loading / empty ───────────────────────────────────────────────────────────
.pt-page__loading {
  display: flex;
  justify-content: center;
  padding: $space-8 0;
}

.pt-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-8 0;
  gap: $space-2;
  color: $color-text-muted;
  font-size: $font-size-sm;
}

// ── Patient list ──────────────────────────────────────────────────────────────
.pt-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

// ── Patient card ──────────────────────────────────────────────────────────────
.pt-card {
  display: flex;
  align-items: center;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xs;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow $transition-normal, border-color $transition-normal;
  position: relative;

  &:hover {
    border-color: $color-primary-muted;
    box-shadow: $shadow-sm;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  // Left accent bar (absolute, flush)
  &__status-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 0;

    &--active     { background: $color-success; }
    &--inactive   { background: $color-text-muted; }
    &--archived   { background: $color-warning; }
    &--discharged { background: $color-primary; }
  }

  &__avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: $color-primary-subtle;
    color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    margin-left: $space-5;   // clears the status bar
  }

  &__info {
    flex: 1;
    min-width: 0;
    padding: $space-4 $space-4 $space-4 $space-3;
  }

  &__name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: $line-height-tight;
    margin-bottom: 2px;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: $font-size-xs;
    color: $color-text-muted;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-shrink: 0;
    padding-right: $space-2;
  }
}

// ── Arrow affordance ──────────────────────────────────────────────────────────
.pt-card__arrow-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 $space-3;
  color: $color-text-muted;
  opacity: 0.35;
  transition: opacity $transition-fast, color $transition-fast;
}

.pt-card:hover .pt-card__arrow-wrap {
  opacity: 0.75;
  color: $color-primary;
}

// ── Status pill ───────────────────────────────────────────────────────────────
.pt-status {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: $font-weight-semibold;
  padding: 2px 10px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.5;

  &--active     { background: $color-success-subtle;  color: $color-success; }
  &--inactive   { background: rgba($color-text-muted, 0.10); color: $color-text-secondary; }
  &--archived   { background: $color-warning-subtle;  color: $color-warning; }
  &--discharged { background: $color-primary-subtle;  color: $color-primary; }
}
</style>
