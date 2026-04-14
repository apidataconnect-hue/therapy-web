
<template>
  <div class="db-page">

    <!-- ── ADMIN ──────────────────────────────────────────────────────────────── -->
    <template v-if="role === 'ADMIN'">
      <v-card><v-card-title>Panel de administración</v-card-title></v-card>
    </template>

    <!-- ── THERAPIST ──────────────────────────────────────────────────────────── -->
    <template v-else>

      <!-- Header -->
      <div class="db-header">
        <div>
          <h1 class="db-header__title">Panel</h1>
          <p class="db-header__subtitle">Resumen de tu actividad clínica</p>
        </div>
        <span class="db-header__date">{{ todayLabel }}</span>
      </div>

      <!-- KPI cards -->
      <p class="db-section-label">Métricas principales</p>
      <div class="db-kpis">
        <div v-for="kpi in kpis" :key="kpi.label" class="db-kpi">
          <div class="db-kpi__icon-wrap" :style="{ background: kpi.bg }">
            <v-icon :icon="kpi.icon" size="24" :color="kpi.color" />
          </div>
          <div class="db-kpi__body">
            <span v-if="loading" class="db-kpi__value db-kpi__value--skeleton" />
            <span v-else class="db-kpi__value">{{ kpi.value }}</span>
            <span class="db-kpi__label">{{ kpi.label }}</span>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <p class="db-section-label">Actividad clínica</p>
      <div class="db-charts">

        <!-- Donut: by tag -->
        <div class="db-card">
          <div class="db-card__header">
            <v-icon icon="mdi-tag-multiple-outline" size="20" color="primary" class="mr-2" />
            <span class="db-card__title">Terapias por etiqueta</span>
            <v-chip
              v-if="!loading"
              size="x-small"
              variant="tonal"
              color="primary"
              class="ml-auto"
            >{{ tagChartSeries.reduce((s, v) => s + v, 0) }} procesos</v-chip>
          </div>

          <div v-if="loading" class="db-card__center">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>
          <div v-else-if="tagChartSeries.length === 0" class="db-card__center">
            <v-icon icon="mdi-tag-off-outline" size="40" color="disabled" />
            <p class="mt-2 text-medium-emphasis" style="font-size:0.8rem">Sin procesos registrados todavía</p>
          </div>
          <template v-else>
            <client-only>
              <ApexChart
                type="donut"
                height="260"
                :options="donutOptions"
                :series="tagChartSeries"
              />
            </client-only>
            <div class="db-legend">
              <div
                v-for="(label, i) in donutOptions.labels"
                :key="label"
                class="db-legend__item"
              >
                <span class="db-legend__dot" :style="{ background: donutOptions.colors[i] }" />
                <span class="db-legend__name">{{ label }}</span>
                <span class="db-legend__count">{{ tagChartSeries[i] }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Bar: by status -->
        <div class="db-card">
          <div class="db-card__header">
            <v-icon icon="mdi-clipboard-list-outline" size="20" color="primary" class="mr-2" />
            <span class="db-card__title">Terapias por estado</span>
          </div>
          <div v-if="loading" class="db-card__center">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>
          <client-only v-else>
            <ApexChart
              type="bar"
              height="295"
              :options="barOptions"
              :series="barSeries"
            />
          </client-only>
        </div>

      </div>

      <!-- Quick links -->
      <p class="db-section-label">Accesos rápidos</p>
      <div class="db-links">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="db-link"
        >
          <div class="db-link__icon-wrap" :style="{ background: link.bg }">
            <v-icon :icon="link.icon" size="20" :color="link.color" />
          </div>
          <div class="db-link__body">
            <span class="db-link__title">{{ link.title }}</span>
            <span class="db-link__desc">{{ link.desc }}</span>
          </div>
          <v-icon icon="mdi-chevron-right" size="18" color="disabled" />
        </NuxtLink>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTagStore } from '~/stores/tag'
import { getProcesses } from '~/services/processService'
import { getPatients } from '~/services/patientService'

definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })

const auth     = useAuthStore()
const tagStore = useTagStore()
const role     = computed(() => auth.userRole)
const todayLabel = computed(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
// ── State ─────────────────────────────────────────────────────────────────────
const loading       = ref(true)
const processes     = ref<any[]>([])
const totalPatients = ref(0)

async function loadDashboard() {
  loading.value = true
  try {
    const [all, pData] = await Promise.all([
      getProcesses({ size: 500 }),
      getPatients({ size: 1 }),
      tagStore.fetchTags(true),
    ])
    processes.value     = all.items ?? []
    totalPatients.value = pData.total ?? 0
  } catch (e) {
    console.error('[dashboard] load error', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadDashboard())
onActivated(() => loadDashboard())

// ── KPIs ──────────────────────────────────────────────────────────────────────
const statusCount = computed(() => {
  const m: Record<string, number> = {}
  for (const p of processes.value) m[p.processStatus] = (m[p.processStatus] ?? 0) + 1
  return m
})

const kpis = computed(() => [
  { label: 'Pacientes',        value: totalPatients.value,           icon: 'mdi-account-group-outline',      color: '#5B2A86', bg: '#F2EBF9' },
  { label: 'Terapias activas', value: statusCount.value['active'] ?? 0, icon: 'mdi-clipboard-pulse-outline', color: '#2E8B57', bg: '#edf7f1' },
  { label: 'Total procesos',   value: processes.value.length,        icon: 'mdi-folder-multiple-outline',    color: '#7785AC', bg: '#EAEDF5' },
  { label: 'Con etiqueta',     value: processes.value.filter(p => p.tags?.length).length,
                                                                      icon: 'mdi-tag-outline',                color: '#1A7A8A', bg: '#e4f5f7' },
])

// ── Donut ─────────────────────────────────────────────────────────────────────
const liveTagIds = computed(() => new Set(tagStore.tags.map(t => t.id)))

const tagStats = computed(() => {
  const m = new Map<string, { name: string; color: string; count: number }>()
  let untaggedCount = 0
  for (const p of processes.value) {
    if (p.processStatus === 'draft') continue
    const validTags = (p.tags ?? []).filter((t: any) => liveTagIds.value.has(t.id))
    if (validTags.length === 0) {
      untaggedCount++
    } else {
      for (const t of validTags) {
        if (!m.has(t.id)) m.set(t.id, { name: t.name, color: t.color ?? '#9E9E9E', count: 0 })
        m.get(t.id)!.count++
      }
    }
  }
  const result = Array.from(m.values()).sort((a, b) => b.count - a.count)
  if (untaggedCount > 0) result.push({ name: 'Otros', color: '#C8C0D8', count: untaggedCount })
  return result
})

const tagChartSeries = computed(() => tagStats.value.map(t => t.count))

const donutOptions = computed(() => ({
  labels:  tagStats.value.map(t => t.name),
  colors:  tagStats.value.map(t => t.color),
  chart: {
    type: 'donut',
    fontFamily: 'Inter, Roboto, system-ui, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 500 },
  },
  legend:  { show: false },
  stroke:  { width: 2, colors: ['#fff'] },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show:       true,
            label:      'Procesos',
            fontSize:   '11px',
            fontWeight: 400,
            color:      '#9588A8',
            formatter:  (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
          },
          value: { fontSize: '26px', fontWeight: 700, color: '#1A0A2E', offsetY: 2 },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  tooltip:    { y: { formatter: (v: number) => `${v} proceso${v !== 1 ? 's' : ''}` } },
}))

// ── Bar ───────────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string }> = {
  active:   { label: 'Activa',        color: '#2E8B57' },
  draft:    { label: 'Borrador',      color: '#7785AC' },
  paused:   { label: 'Pausada',       color: '#C77B2C' },
  closed:   { label: 'Cerrada',       color: '#9E9E9E' },
  disabled: { label: 'Deshabilitada', color: '#B0583A' },
  archived: { label: 'Archivada',     color: '#607D8B' },
}

const barSeries = computed(() => [{
  name: 'Terapias',
  data: Object.keys(STATUS_META).map(s => statusCount.value[s] ?? 0),
}])

const barOptions = computed(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Inter, Roboto, system-ui, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true, speed: 500 },
  },
  plotOptions: {
    bar: { borderRadius: 8, borderRadiusApplication: 'end', columnWidth: '58%', distributed: true },
  },
  colors: Object.values(STATUS_META).map(m => m.color),
  xaxis: {
    categories: Object.values(STATUS_META).map(m => m.label),
    labels: { style: { fontSize: '12px', colors: '#9588A8', fontFamily: 'Inter, sans-serif' } },
    axisBorder: { show: false },
    axisTicks:  { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#9588A8', fontSize: '12px' },
      formatter: (v: number) => Math.round(v).toString(),
    },
  },
  grid: {
    borderColor: '#EDE9F4',
    strokeDashArray: 4,
    yaxis: { lines: { show: true  } },
    xaxis: { lines: { show: false } },
  },
  dataLabels: {
    enabled:    true,
    style:      { fontSize: '12px', fontWeight: 600, colors: ['#fff'] },
    formatter:  (v: number) => v > 0 ? String(v) : '',
    dropShadow: { enabled: false },
  },
  legend:  { show: false },
  tooltip: { y: { formatter: (v: number) => `${v} terapia${v !== 1 ? 's' : ''}` } },
}))

// ── Quick links ───────────────────────────────────────────────────────────────
const quickLinks = [
  { to: '/app/therapist/therapies', title: 'Terapias',   desc: 'Gestiona los procesos',      icon: 'mdi-clipboard-pulse-outline', color: '#5B2A86', bg: '#F2EBF9' },
  { to: '/app/patients',            title: 'Pacientes',  desc: 'Consulta tus pacientes',     icon: 'mdi-account-group-outline',   color: '#1A7A8A', bg: '#e4f5f7' },
  { to: '/app/therapist/sessions',  title: 'Sesiones',   desc: 'Historial de citas',         icon: 'mdi-calendar-check-outline',  color: '#2E8B57', bg: '#edf7f1' },
  { to: '/app/therapist/calendar',  title: 'Agenda', desc: 'Planifica nuevas citas',     icon: 'mdi-calendar-month-outline',  color: '#C77B2C', bg: '#FEF4E6' },
]
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.db-page {
  padding: $space-6 $space-5;
  max-width: 1160px;
  margin: 0 auto;
}

// ── Header ────────────────────────────────────────────────────────────────────
.db-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-4;
  margin-bottom: $space-7;

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    letter-spacing: -0.02em;
    line-height: $line-height-tight;
    margin: 0 0 $space-1;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;
  }

  &__date {
    flex-shrink: 0;
    font-size: $font-size-sm;
    color: $color-text-muted;
    font-weight: $font-weight-medium;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    padding: $space-1 $space-3;
    text-transform: capitalize;
    white-space: nowrap;
    line-height: 1.6;
    align-self: flex-start;
  }
}

// ── KPIs ──────────────────────────────────────────────────────────────────────
.db-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
  margin-bottom: $space-6;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
}

.db-kpi {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-5;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast, box-shadow $transition-fast, border-color $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $color-primary-muted;
    transform: translateY(-1px);
  }

  &__icon-wrap {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__value {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    line-height: 1;
    letter-spacing: -0.02em;

    &--skeleton {
      display: inline-block;
      width: 48px;
      height: 28px;
      background: $color-border;
      border-radius: $radius-sm;
      animation: db-pulse 1.4s ease-in-out infinite;
    }
  }

  &__label {
    font-size: $font-size-xs;
    color: $color-text-muted;
    font-weight: $font-weight-medium;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}

// ── Charts ────────────────────────────────────────────────────────────────────
.db-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-5;
  margin-bottom: $space-6;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
}

.db-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-5;
  box-shadow: $shadow-sm;

  &__header {
    display: flex;
    align-items: center;
    padding-bottom: $space-4;
    border-bottom: 1px solid $color-divider;
    margin-bottom: $space-4;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    line-height: $line-height-tight;
  }

  &__center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }
}

// ── Legend ────────────────────────────────────────────────────────────────────
.db-legend {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-top: $space-3;
  border-top: 1px solid $color-divider;
  margin-top: $space-3;

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    padding: 2px 0;
  }

  &__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__name {
    flex: 1;
    font-weight: $font-weight-medium;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__count {
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    font-size: $font-size-sm;
    min-width: 20px;
    text-align: right;
  }
}

// ── Quick links ───────────────────────────────────────────────────────────────
.db-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;

  @media (max-width: 750px) { grid-template-columns: repeat(2, 1fr); }
}

.db-link {
  display: flex;
  align-items: center;
  gap: $space-4;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-4 $space-5;
  min-height: 76px;
  text-decoration: none;
  transition: box-shadow $transition-normal, border-color $transition-normal, transform $transition-normal;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $color-primary-muted;
    transform: translateY(-2px);
  }

  &__icon-wrap {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    line-height: $line-height-tight;
  }

  &__desc {
    font-size: $font-size-xs;
    color: $color-text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
// ── Section labels ────────────────────────────────────────────────────────────────────
.db-section-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $color-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 $space-3;
}
// ── Skeleton animation ────────────────────────────────────────────────────────
@keyframes db-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

// ── Patient portal ────────────────────────────────────────────────────────────
.ptb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-4;

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: $space-1 0 0;
  }
}

.ptb-tabs {
  margin-bottom: $space-4;
}

.ptb-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.ptb-section {
  margin-bottom: $space-4;

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    margin: 0 0 $space-3;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: $space-2;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: $space-3;
  }
}

.ptb-appointments {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.ptb-apt {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  flex-wrap: wrap;

  &--past {
    opacity: 0.65;
  }

  &__date {
    display: flex;
    align-items: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    text-transform: capitalize;
  }

  &__time {
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }

  &__meta {
    display: flex;
    gap: $space-1;
    flex: 1;
  }

  &__join {
    margin-left: auto;
  }
}

.ptb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
  color: $color-text-muted;
  font-size: $font-size-sm;
}

.ptb-profile {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;

  &__row {
    display: flex;
    align-items: center;
    padding: $space-3 0;
    border-bottom: 1px solid $color-divider;

    &:last-child { border-bottom: none; }
  }

  &__label {
    width: 180px;
    flex-shrink: 0;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-muted;
  }

  &__value {
    font-size: $font-size-sm;
    color: $color-text-main;
  }
}
</style>
