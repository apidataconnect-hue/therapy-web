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
        :to="'/app/patients/invite'"
      >
        Invitar paciente
      </v-btn>
    </div>

    <!-- Search + filter bar -->
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
      <v-tabs v-model="tab" color="primary" density="compact" class="pt-tabs">
        <v-tab value="all">
          Todos
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'all' ? 'primary' : undefined">
            {{ counts.all }}
          </v-chip>
        </v-tab>
        <v-tab value="active">
          Activos
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'active' ? 'primary' : undefined">
            {{ counts.active }}
          </v-chip>
        </v-tab>
        <v-tab value="inactive">
          Inactivos
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'inactive' ? 'primary' : undefined">
            {{ counts.inactive }}
          </v-chip>
        </v-tab>
        <v-tab value="archived">
          Archivados
          <v-chip v-if="!loading" size="x-small" class="ml-2" variant="tonal" :color="tab === 'archived' ? 'primary' : undefined">
            {{ counts.archived }}
          </v-chip>
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
          :to="'/app/patients/invite'"
        >
          Invitar primer paciente
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

          <!-- Status chip -->
          <div class="pt-card__right">
            <span class="pt-status" :class="`pt-status--${p.patientStatus}`">
              {{ STATUS_LABELS[p.patientStatus] ?? p.patientStatus }}
            </span>
            <v-icon icon="mdi-chevron-right" size="18" class="pt-card__chevron" />
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
const tab = ref('all')

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

.pt-search {
  max-width: 380px;
}

.pt-tabs {
  border-bottom: 1px solid $color-border;
}

// ── List ──────────────────────────────────────────────────────────────────────
.pt-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

// ── Card ──────────────────────────────────────────────────────────────────────
.pt-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-3 $space-4;
  cursor: pointer;
  transition: box-shadow $transition-fast, border-color $transition-fast;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: $shadow-md;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  // Left accent bar
  &__status-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: $radius-lg 0 0 $radius-lg;
    background: $color-border;

    &--active    { background: #22c55e; }
    &--inactive  { background: $color-text-muted; }
    &--archived  { background: $color-warning; }
    &--discharged{ background: rgb(var(--v-theme-primary)); }
  }

  &__avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: rgba(var(--v-theme-primary), 0.1);
    color: rgb(var(--v-theme-primary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    margin-left: $space-3;
  }

  &__info {
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
  }

  &__meta {
    display: flex;
    align-items: center;
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
  }

  &__chevron {
    color: $color-text-muted;
  }
}

// ── Status pill ───────────────────────────────────────────────────────────────
.pt-status {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: $font-weight-semibold;
  padding: 2px 10px;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--active    { background: rgba(#22c55e, 0.12); color: #15803d; }
  &--inactive  { background: rgba($color-text-muted, 0.12); color: $color-text-secondary; }
  &--archived  { background: rgba($color-warning, 0.12); color: $color-warning; }
  &--discharged{ background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
}
</style>
