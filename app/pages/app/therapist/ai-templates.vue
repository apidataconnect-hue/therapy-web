<template>
  <div class="ai-page">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="ai-page__header">
      <div>
        <div class="ai-page__title-wrap">
          <v-icon icon="mdi-creation-outline" size="26" color="primary" class="mr-2" />
          <span class="ai-page__title">Plantillas IA</span>
        </div>
        <p class="ai-page__subtitle">Configura las instrucciones de IA para generar planes de sesión</p>
      </div>

      <v-tooltip :disabled="!atLimit" location="bottom">
        <template #activator="{ props: tip }">
          <span v-bind="tip">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-plus"
              size="small"
              :disabled="atLimit"
              @click="openCreate"
            >Nueva plantilla</v-btn>
          </span>
        </template>
        Solo puedes tener un máximo de 3 plantillas propias
      </v-tooltip>
    </div>

    <!-- ── Skeleton loaders ────────────────────────────────────────────────── -->
    <div v-if="store.loading" class="ai-grid">
      <v-skeleton-loader
        v-for="n in 3"
        :key="n"
        type="card"
        class="ai-grid__skeleton"
      />
    </div>

    <!-- ── Empty state ─────────────────────────────────────────────────────── -->
    <div v-else-if="store.templates.length === 0" class="ai-empty">
      <v-icon icon="mdi-creation-outline" size="56" color="disabled" />
      <div>
        <p class="ai-empty__title">Sin plantillas</p>
        <p class="ai-empty__hint">Crea tu primera plantilla de IA para generar planes de sesión</p>
      </div>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" size="small" @click="openCreate">
        Crear plantilla
      </v-btn>
    </div>

    <!-- ── Card grid ───────────────────────────────────────────────────────── -->
    <div v-else class="ai-grid">
      <div
        v-for="(tpl, idx) in store.templates"
        :key="tpl.id"
        class="ai-card"
        :style="{ '--accent': CARD_COLORS[idx % CARD_COLORS.length] }"
      >
        <!-- Accent strip -->
        <div class="ai-card__strip" />

        <div class="ai-card__body">
          <!-- Name + badges -->
          <div class="ai-card__top">
            <span class="ai-card__name">{{ tpl.name }}</span>
            <div class="ai-card__badges">
              <v-chip
                v-if="tpl.isDefault"
                size="x-small"
                variant="flat"
                color="primary"
              >Por defecto</v-chip>
              <v-chip
                v-if="tpl.isSystem"
                size="x-small"
                variant="tonal"
                color="secondary"
              >Sistema</v-chip>
            </div>
          </div>

          <!-- Description -->
          <p class="ai-card__desc">{{ tpl.description || '—' }}</p>

          <!-- Sessions badge -->
          <div class="ai-card__meta">
            <v-chip size="x-small" variant="tonal" prepend-icon="mdi-history">
              {{ tpl.sessionsToAnalyze }} sesion{{ tpl.sessionsToAnalyze === 1 ? '' : 'es' }}
            </v-chip>
          </div>
        </div>

        <!-- Actions (hidden for system templates) -->
        <div v-if="!tpl.isSystem" class="ai-card__actions">
          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                :icon="tpl.isDefault ? 'mdi-star' : 'mdi-star-outline'"
                :color="tpl.isDefault ? 'warning' : undefined"
                variant="text"
                density="compact"
                size="small"
                :loading="settingDefault === tpl.id"
                :disabled="tpl.isDefault"
                @click.stop="handleSetDefault(tpl)"
              />
            </template>
            {{ tpl.isDefault ? 'Plantilla por defecto' : 'Establecer como por defecto' }}
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-pencil-outline"
                variant="text"
                density="compact"
                size="small"
                @click.stop="openEdit(tpl)"
              />
            </template>
            Editar
          </v-tooltip>

          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-delete-outline"
                variant="text"
                density="compact"
                size="small"
                color="error"
                @click.stop="openConfirmDelete(tpl)"
              />
            </template>
            Eliminar
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- ── Create / Edit dialog ────────────────────────────────────────────── -->
    <v-dialog
      v-model="formDialog"
      max-width="700"
      :persistent="store.saving || loadingForm"
      scrollable
    >
      <v-card>
        <v-card-title class="pt-5 px-6 pb-3 d-flex align-center">
          <v-icon
            :icon="editId ? 'mdi-pencil-outline' : 'mdi-creation-outline'"
            size="20"
            color="primary"
            class="mr-2"
          />
          {{ editId ? 'Editar plantilla' : 'Nueva plantilla' }}
        </v-card-title>

        <v-divider />

        <v-card-text class="px-6 pb-2 pt-5">
          <!-- Loading full template -->
          <div v-if="loadingForm" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>

          <v-form v-else ref="formRef" @submit.prevent="submitForm">
            <!-- Nombre -->
            <div class="ai-field mb-5">
              <label class="ai-label">Nombre <span class="ai-required">*</span></label>
              <v-text-field
                v-model="form.name"
                placeholder="Nombre de la plantilla…"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :rules="[v => !!v?.trim() || 'El nombre es obligatorio']"
              />
            </div>

            <!-- Descripción -->
            <div class="ai-field mb-5">
              <label class="ai-label">Descripción</label>
              <v-textarea
                v-model="form.description"
                placeholder="Descripción breve de la plantilla…"
                variant="outlined"
                density="compact"
                rows="2"
                auto-grow
                hide-details
              />
            </div>

            <!-- System Prompt -->
            <div class="ai-field mb-5">
              <div class="ai-label-row">
                <label class="ai-label">Instrucciones del sistema <span class="ai-required">*</span></label>
                <v-tooltip max-width="300" location="right">
                  <template #activator="{ props: tip }">
                    <v-icon
                      v-bind="tip"
                      icon="mdi-information-outline"
                      size="15"
                      color="info"
                      class="ml-1 cursor-pointer"
                    />
                  </template>
                  Mensaje de rol "system" de OpenAI. Define el comportamiento y las instrucciones generales de la IA para generar el plan de sesión.
                </v-tooltip>
              </div>
              <v-textarea
                v-model="form.systemPrompt"
                placeholder="Eres un terapeuta experto. Genera un plan estructurado para la próxima sesión teniendo en cuenta el historial del paciente…"
                variant="outlined"
                density="comfortable"
                rows="6"
                auto-grow
                hide-details="auto"
                :rules="[v => !!v?.trim() || 'Las instrucciones del sistema son obligatorias']"
              />
            </div>

            <!-- User Prompt Template -->
            <div class="ai-field mb-5">
              <div class="ai-label-row">
                <label class="ai-label">Plantilla de prompt de usuario</label>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="primary"
                  class="ml-auto"
                  @click="tokensOpen = !tokensOpen"
                >
                  <v-icon icon="mdi-code-braces" size="14" class="mr-1" />
                  Tokens disponibles
                </v-btn>
              </div>

              <v-expand-transition>
                <div v-if="tokensOpen" class="ai-tokens mb-2">
                  <div class="ai-tokens__title">Variables disponibles en el prompt:</div>
                  <div class="ai-tokens__list">
                    <div v-for="token in TOKENS" :key="token.key" class="ai-token">
                        <code class="ai-token__key">{{ token.label }}</code>
                      <span class="ai-token__desc">{{ token.desc }}</span>
                    </div>
                  </div>
                </div>
              </v-expand-transition>

              <v-textarea
                v-model="form.userPromptTemplate"
                placeholder="Paciente: {{patient_name}}. Motivo: {{reason_for_consultation}}. Sesiones realizadas: {{session_count}}…"
                variant="outlined"
                density="comfortable"
                rows="5"
                auto-grow
                hide-details
              />
            </div>

            <!-- Sesiones a analizar -->
            <div class="ai-field mb-5">
              <div class="ai-label-row">
                <label class="ai-label">
                  Sesiones a analizar: <strong>{{ form.sessionsToAnalyze }}</strong>
                </label>
                <v-tooltip max-width="280" location="right">
                  <template #activator="{ props: tip }">
                    <v-icon
                      v-bind="tip"
                      icon="mdi-information-outline"
                      size="15"
                      color="info"
                      class="ml-1 cursor-pointer"
                    />
                  </template>
                  Número de resúmenes de sesiones anteriores que se incluirán como contexto para la IA al generar el plan.
                </v-tooltip>
              </div>
              <div class="ai-slider-wrap">
                <span class="ai-slider__label">1</span>
                <v-slider
                  v-model="form.sessionsToAnalyze"
                  :min="1"
                  :max="10"
                  :step="1"
                  thumb-label
                  color="primary"
                  density="compact"
                  hide-details
                  class="ai-slider"
                />
                <span class="ai-slider__label">10</span>
              </div>
            </div>

            <!-- Default toggle -->
            <div class="ai-field">
              <v-switch
                v-model="form.isDefault"
                label="Establecer como plantilla por defecto"
                color="primary"
                density="compact"
                hide-details
              />
            </div>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn variant="text" :disabled="store.saving" @click="formDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="store.saving"
            :disabled="loadingForm"
            @click="submitForm"
          >Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete confirmation dialog ─────────────────────────────────────── -->
    <v-dialog v-model="deleteDialog" max-width="440">
      <v-card>
        <v-card-title class="pt-5 px-5">¿Eliminar plantilla?</v-card-title>
        <v-card-text class="px-5">
          La plantilla <strong>{{ deleteTarget?.name }}</strong> se eliminará permanentemente.
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="store.deleting"
            @click="doDelete"
          >Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ────────────────────────────────────────────────────────── -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3500" location="bottom end">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSessionPlanTemplateStore } from '~/stores/sessionPlanTemplate'
import { getTemplate, type SessionPlanTemplate } from '~/services/sessionPlanTemplateService'

definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })

const store = useSessionPlanTemplateStore()

onMounted(() => store.fetchAll())

// ── Card accent colors (4 hues from the design system) ───────────────────────
const CARD_COLORS = ['#5B2A86', '#9AC6C5', '#C77B2C', '#7785AC']

const TOKENS = [
  { key: 'patient_name',            label: '{{patient_name}}',            desc: 'Nombre del paciente' },
  { key: 'reason_for_consultation', label: '{{reason_for_consultation}}', desc: 'Motivo de consulta' },
  { key: 'session_count',           label: '{{session_count}}',           desc: 'Número total de sesiones' },
  { key: 'previous_sessions',       label: '{{previous_sessions}}',       desc: 'Resúmenes de sesiones anteriores' },
  { key: 'next_appointment_date',   label: '{{next_appointment_date}}',   desc: 'Fecha de la próxima cita' },
  { key: 'next_appointment_type',   label: '{{next_appointment_type}}',   desc: 'Tipo de la próxima cita' },
]

// ── Limit (max 3 own templates) ───────────────────────────────────────────────
const ownTemplates = computed(() => store.templates.filter(t => !t.isSystem))
const atLimit      = computed(() => ownTemplates.value.length >= 3)

// ── Snackbar ──────────────────────────────────────────────────────────────────
const snackbar = ref({ show: false, text: '', color: 'success' })
function notify(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

// ── Form dialog ───────────────────────────────────────────────────────────────
const formDialog  = ref(false)
const editId      = ref<string | null>(null)
const loadingForm = ref(false)
const tokensOpen  = ref(false)
const formRef     = ref<any>(null)

const form = ref({
  name:               '',
  description:        '',
  systemPrompt:       '',
  userPromptTemplate: '',
  sessionsToAnalyze:  3,
  isDefault:          false,
})

function resetForm() {
  form.value = {
    name:               '',
    description:        '',
    systemPrompt:       '',
    userPromptTemplate: '',
    sessionsToAnalyze:  3,
    isDefault:          false,
  }
  editId.value     = null
  tokensOpen.value = false
}

function openCreate() {
  resetForm()
  formDialog.value = true
}

async function openEdit(tpl: SessionPlanTemplate) {
  resetForm()
  editId.value     = tpl.id
  formDialog.value = true
  loadingForm.value = true
  try {
    const full = await getTemplate(tpl.id)
    form.value.name               = full.name
    form.value.description        = full.description ?? ''
    form.value.systemPrompt       = full.systemPrompt ?? ''
    form.value.userPromptTemplate = full.userPromptTemplate ?? ''
    form.value.sessionsToAnalyze  = full.sessionsToAnalyze ?? 3
    form.value.isDefault          = full.isDefault
  } catch {
    notify('Error al cargar la plantilla', 'error')
    formDialog.value = false
  } finally {
    loadingForm.value = false
  }
}

async function submitForm() {
  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  const payload = {
    name:               form.value.name.trim(),
    description:        form.value.description.trim() || null,
    systemPrompt:       form.value.systemPrompt.trim(),
    userPromptTemplate: form.value.userPromptTemplate.trim() || null,
    sessionsToAnalyze:  form.value.sessionsToAnalyze,
    isDefault:          form.value.isDefault,
  }

  try {
    if (editId.value) {
      await store.update(editId.value, payload)
      notify('Plantilla actualizada')
    } else {
      await store.create(payload)
      notify('Plantilla creada')
    }
    formDialog.value = false
    resetForm()
    // Refresh list so isDefault state is consistent across all templates
    await store.fetchAll()
  } catch (e: any) {
    const msgs = e?.response?.data?.message
    const text = Array.isArray(msgs) ? msgs[0] : (msgs ?? 'Error al guardar la plantilla')
    notify(String(text), 'error')
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteDialog = ref(false)
const deleteTarget = ref<SessionPlanTemplate | null>(null)

function openConfirmDelete(tpl: SessionPlanTemplate) {
  deleteTarget.value = tpl
  deleteDialog.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await store.remove(deleteTarget.value.id)
    deleteDialog.value = false
    deleteTarget.value = null
    notify('Plantilla eliminada')
  } catch (e: any) {
    const msgs = e?.response?.data?.message
    const text = Array.isArray(msgs) ? msgs[0] : 'Error al eliminar la plantilla'
    notify(String(text), 'error')
  }
}

// ── Set default ───────────────────────────────────────────────────────────────
const settingDefault = ref<string | null>(null)

async function handleSetDefault(tpl: SessionPlanTemplate) {
  if (tpl.isDefault) return
  settingDefault.value = tpl.id
  try {
    await store.setDefault(tpl.id)
    notify(`"${tpl.name}" establecida como plantilla por defecto`)
  } catch {
    notify('Error al actualizar la plantilla', 'error')
  } finally {
    settingDefault.value = null
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.ai-page {
  padding: $space-5;
  max-width: 1100px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: $space-5;
    gap: $space-4;
    flex-wrap: wrap;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: $space-1;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-base;
    color: $color-text-muted;
    margin: 0;
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
.ai-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.ai-grid__skeleton {
  border-radius: $radius-lg !important;
  min-height: 200px;
}

// ── Card ──────────────────────────────────────────────────────────────────────
.ai-card {
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow $transition-fast, transform $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }

  &__strip {
    height: 5px;
    background: var(--accent, #{$color-primary});
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    padding: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__top {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    word-break: break-word;
    line-height: $line-height-tight;
  }

  &__badges {
    display: flex;
    gap: $space-1;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  &__desc {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.6em;
    line-height: 1.4;
  }

  &__meta {
    margin-top: auto;
    padding-top: $space-2;
  }

  &__actions {
    padding: $space-2 $space-3;
    border-top: 1px solid $color-divider;
    display: flex;
    justify-content: flex-end;
    gap: $space-1;
    background: $color-background;
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────
.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  padding: $space-8 $space-5;
  text-align: center;
  background: $state-empty-bg;
  border: 1px dashed $color-border;
  border-radius: $radius-lg;

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    margin: 0 0 $space-1;
  }

  &__hint {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0;
  }
}

// ── Form fields ───────────────────────────────────────────────────────────────
.ai-field {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.ai-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
}

.ai-label-row {
  display: flex;
  align-items: center;
  gap: $space-1;
  margin-bottom: $space-1;
}

.ai-required {
  color: $color-error;
}

// ── Tokens reference ──────────────────────────────────────────────────────────
.ai-tokens {
  background: $color-info-subtle;
  border-radius: $radius-md;
  padding: $space-3;

  &__title {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-info;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: $space-2;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.ai-token {
  display: flex;
  align-items: baseline;
  gap: $space-2;
  font-size: $font-size-xs;

  &__key {
    font-family: monospace;
    font-weight: $font-weight-semibold;
    color: $color-primary;
    flex-shrink: 0;
    background: rgba($color-primary, 0.08);
    padding: 1px 5px;
    border-radius: $radius-sm;
  }

  &__desc {
    color: $color-text-secondary;
  }
}

// ── Slider ────────────────────────────────────────────────────────────────────
.ai-slider-wrap {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.ai-slider {
  flex: 1;

  &__label {
    font-size: $font-size-xs;
    color: $color-text-muted;
    min-width: 14px;
    text-align: center;
  }
}
</style>
