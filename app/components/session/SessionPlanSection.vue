<template>
  <div class="sps">
    <!-- ── Section header ──────────────────────────────────────────────────── -->
    <div class="sps__header">
      <v-icon icon="mdi-creation-outline" size="18" color="primary" class="mr-2" />
      <span class="sps__title">Plan de sesión IA</span>
      <v-chip size="x-small" variant="tonal" color="info" class="ml-2">IA</v-chip>
    </div>

    <!-- ── Error banner ────────────────────────────────────────────────────── -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      closable
      class="mb-4"
      @click:close="error = null"
    >{{ error }}</v-alert>

    <!-- ── Generating skeleton ─────────────────────────────────────────────── -->
    <div v-if="isLoading" class="sps__generating">
      <v-icon icon="mdi-creation-outline" size="20" color="primary" class="mr-2 sps__spin" />
      <span class="sps__generating-text">Generando plan con IA…</span>
      <div class="sps__skeleton-lines mt-3">
        <v-skeleton-loader type="text" class="mb-2" />
        <v-skeleton-loader type="text" class="mb-2" width="88%" />
        <v-skeleton-loader type="text" class="mb-2" width="75%" />
        <v-skeleton-loader type="text" class="mb-2" width="92%" />
        <v-skeleton-loader type="text" width="60%" />
      </div>
    </div>

    <!-- ── State A: No plan ────────────────────────────────────────────────── -->
    <div v-else-if="!plan" class="sps__empty">
      <v-icon icon="mdi-creation-outline" size="40" color="disabled" />
      <p class="sps__empty-text">Esta sesión no tiene un plan generado aún.</p>

      <!-- Template selector (only when there are own/non-system templates) -->
      <v-select
        v-if="customTemplates.length > 0"
        v-model="selectedTemplateId"
        :items="templateItems"
        item-title="label"
        item-value="value"
        label="Plantilla"
        variant="outlined"
        density="compact"
        hide-details
        class="sps__template-select mb-3"
      />

      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-creation-outline"
        :loading="isLoading"
        @click="handleGenerate"
      >Generar plan</v-btn>
    </div>

    <!-- ── State B: Plan exists ────────────────────────────────────────────── -->
    <div v-else class="sps__content">
      <!-- Edit mode: textarea -->
      <template v-if="isEditing">
        <v-textarea
          v-model="editContent"
          variant="outlined"
          density="comfortable"
          rows="8"
          auto-grow
          hide-details
          class="sps__edit-area"
        />
        <div class="sps__edit-actions">
          <v-btn
            variant="text"
            size="small"
            :disabled="isSaving"
            @click="cancelEdit"
          >Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save-outline"
            :loading="isSaving"
            @click="saveEdit"
          >Guardar cambios</v-btn>
        </div>
      </template>

      <!-- View mode: rendered markdown -->
      <template v-else>
        <div
          class="sps__markdown"
          v-html="renderedContent"
        />

        <!-- Meta row -->
        <div v-if="plan.createdAt" class="sps__meta">
          <v-icon icon="mdi-creation-outline" size="13" class="mr-1" />
          <span v-if="plan.templateName">{{ plan.templateName }} · </span>
          <span>{{ formatDate(plan.createdAt) }}</span>
        </div>

        <!-- Action buttons -->
        <div class="sps__actions">
          <!-- Copy -->
          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
                :color="copied ? 'success' : undefined"
                variant="text"
                density="compact"
                size="small"
                @click="copyContent"
              />
            </template>
            {{ copied ? 'Copiado' : 'Copiar contenido' }}
          </v-tooltip>

          <!-- Edit -->
          <v-tooltip v-if="noteId" location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-pencil-outline"
                variant="text"
                density="compact"
                size="small"
                :disabled="isLoading || isDeleting"
                @click="startEdit"
              />
            </template>
            Editar plan
          </v-tooltip>

          <!-- Regenerate -->
          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-refresh"
                variant="text"
                density="compact"
                size="small"
                :disabled="isLoading || isDeleting"
                @click="confirmRegenDialog = true"
              />
            </template>
            Regenerar plan
          </v-tooltip>

          <!-- Delete -->
          <v-tooltip location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-delete-outline"
                variant="text"
                density="compact"
                size="small"
                color="error"
                :disabled="isLoading || isDeleting"
                :loading="isDeleting"
                @click="confirmDeleteDialog = true"
              />
            </template>
            Eliminar plan
          </v-tooltip>
        </div>
      </template>
    </div>

    <!-- ── Confirm regenerate dialog ────────────────────────────────────────── -->
    <v-dialog v-model="confirmRegenDialog" max-width="460">
      <v-card>
        <v-card-title class="pt-5 px-5">Regenerar el plan</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p class="text-body-2 mb-4">Se perderá el plan actual y se generará uno nuevo con IA.</p>
          <v-select
            v-if="templateItems.length > 0"
            v-model="selectedTemplateId"
            :items="templateItems"
            item-title="label"
            item-value="value"
            label="Plantilla"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmRegenDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="tonal" :loading="isLoading" @click="handleRegenerate">Regenerar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Confirm delete dialog ─────────────────────────────────────────────── -->
    <v-dialog v-model="confirmDeleteDialog" max-width="420">
      <v-card>
        <v-card-title class="pt-5 px-5">¿Eliminar el plan de sesión?</v-card-title>
        <v-card-text class="px-5">Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="confirmDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" :loading="isDeleting" @click="handleDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted } from 'vue'
import { useSessionPlan } from '~/composables/useSessionPlan'
import { updateSessionNote } from '~/services/sessionNoteService'

const props = defineProps<{
  appointmentId: string
  noteId: string | null
  initialPlan?: string | null
  initialPlanId?: string | null
}>()

const {
  plan,
  isLoading,
  isDeleting,
  error,
  templates,
  selectedTemplateId,
  initFromNote,
  loadTemplates,
  generatePlan,
  regeneratePlan,
  deletePlan,
} = useSessionPlan(toRef(props, 'appointmentId'))

onMounted(async () => {
  initFromNote(props.initialPlan, props.initialPlanId)
  await loadTemplates()
})

// ── Template selector ─────────────────────────────────────────────────────────
const customTemplates = computed(() => templates.value.filter(t => !t.isSystem))
const templateItems   = computed(() =>
  templates.value.map(t => ({
    value: t.id,
    label: t.isDefault ? `${t.name} (Por defecto)` : t.name,
  })),
)

// ── Confirm dialogs ───────────────────────────────────────────────────────────
const confirmRegenDialog   = ref(false)
const confirmDeleteDialog  = ref(false)

async function handleGenerate() {
  await generatePlan(selectedTemplateId.value)
}

async function handleRegenerate() {
  confirmRegenDialog.value = false
  await regeneratePlan(selectedTemplateId.value)
}

async function handleDelete() {
  confirmDeleteDialog.value = false
  await deletePlan()
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
const isEditing  = ref(false)
const editContent = ref('')
const isSaving    = ref(false)

function startEdit() {
  editContent.value = plan.value?.content ?? ''
  isEditing.value   = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!props.noteId || !plan.value) return
  isSaving.value = true
  try {
    await updateSessionNote(props.noteId, { plan: editContent.value.trim() || null })
    plan.value = { ...plan.value, content: editContent.value.trim() }
    isEditing.value = false
  } catch (e: any) {
    const msg = e?.response?.data?.message
    error.value = Array.isArray(msg) ? msg[0] : (msg ?? 'Error al guardar el plan')
  } finally {
    isSaving.value = false
  }
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────
const copied = ref(false)
async function copyContent() {
  if (!plan.value?.content) return
  try {
    await navigator.clipboard.writeText(plan.value.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard not available
  }
}

// ── Markdown renderer (no external dependency) ────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(raw: string): string {
  // Process block elements line-by-line, then inline elements
  const lines = raw.split('\n')
  let html = ''
  let inUl = false
  let inOl = false

  function closeList() {
    if (inUl) { html += '</ul>'; inUl = false }
    if (inOl) { html += '</ol>'; inOl = false }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    // Headings
    const h3 = line.match(/^### (.+)$/)
    const h2 = line.match(/^## (.+)$/)
    const h1 = line.match(/^# (.+)$/)
    const ulItem = line.match(/^[-*] (.+)$/)
    const olItem = line.match(/^\d+\. (.+)$/)
    const blank = line.trim() === ''

    if (h3) {
      closeList()
      html += `<h3>${inlineMarkdown(h3[1] ?? '')}</h3>`
    } else if (h2) {
      closeList()
      html += `<h2>${inlineMarkdown(h2[1] ?? '')}</h2>`
    } else if (h1) {
      closeList()
      html += `<h1>${inlineMarkdown(h1[1] ?? '')}</h1>`
    } else if (ulItem) {
      if (inOl) { html += '</ol>'; inOl = false }
      if (!inUl) { html += '<ul>'; inUl = true }
      html += `<li>${inlineMarkdown(ulItem[1] ?? '')}</li>`
    } else if (olItem) {
      if (inUl) { html += '</ul>'; inUl = false }
      if (!inOl) { html += '<ol>'; inOl = true }
      html += `<li>${inlineMarkdown(olItem[1] ?? '')}</li>`
    } else if (blank) {
      closeList()
      html += '<br>'
    } else {
      closeList()
      html += `<p>${inlineMarkdown(line)}</p>`
    }
  }
  closeList()
  return html
}

function inlineMarkdown(text: string): string {
  // escape first, then apply formatting
  let s = escapeHtml(text)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  s = s.replace(/_(.+?)_/g, '<em>$1</em>')
  s = s.replace(/`(.+?)`/g, '<code>$1</code>')
  return s
}

const renderedContent = computed(() => {
  if (!plan.value?.content) return ''
  return renderMarkdown(plan.value.content)
})

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    hour:  '2-digit',
    minute:'2-digit',
  })
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.sps {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  box-shadow: $shadow-xs;
  margin-top: $space-4;

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
}

// ── Generating state ──────────────────────────────────────────────────────────
.sps__generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-5 0;
  gap: $space-2;
  color: $color-text-muted;

  &-text {
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
}

.sps__skeleton-lines {
  width: 100%;
}

@keyframes sps-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.sps__spin {
  animation: sps-spin 1.4s linear infinite;
}

// ── Empty state ───────────────────────────────────────────────────────────────
.sps__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  padding: $space-5 0;
  text-align: center;
  background: $state-empty-bg;
  border: 1px dashed $color-border;
  border-radius: $radius-md;

  &-text {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin: 0;
  }
}

.sps__template-select {
  width: 100%;
  max-width: 340px;
}

// ── Plan content ──────────────────────────────────────────────────────────────
.sps__content {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.sps__markdown {
  font-size: $font-size-sm;
  line-height: $line-height-normal;
  color: $color-text-main;
  background: $color-background;
  border-radius: $radius-md;
  padding: $space-4 $space-5;
  border: 1px solid $color-border;

  :deep(h1) {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: $space-4 0 $space-2;
    line-height: $line-height-tight;
    &:first-child { margin-top: 0; }
  }

  :deep(h2) {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    margin: $space-4 0 $space-2;
    line-height: $line-height-tight;
    &:first-child { margin-top: 0; }
  }

  :deep(h3) {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-primary;
    margin: $space-3 0 $space-1;
    &:first-child { margin-top: 0; }
  }

  :deep(p) {
    margin: 0 0 $space-2;
    &:last-child { margin-bottom: 0; }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 $space-2;
    padding-left: $space-5;
    &:last-child { margin-bottom: 0; }
  }

  :deep(li) {
    margin-bottom: 2px;
  }

  :deep(strong) {
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }

  :deep(em) {
    font-style: italic;
    color: $color-text-secondary;
  }

  :deep(code) {
    font-family: ui-monospace, 'Cascadia Code', monospace;
    font-size: 0.85em;
    background: $color-primary-subtle;
    color: $color-primary;
    padding: 1px 5px;
    border-radius: $radius-sm;
  }

  :deep(br) {
    display: block;
    content: '';
    margin-top: $space-1;
  }
}

// ── Meta row ──────────────────────────────────────────────────────────────────
.sps__meta {
  display: flex;
  align-items: center;
  font-size: $font-size-xs;
  color: $color-text-muted;
}

// ── Action buttons ────────────────────────────────────────────────────────────
.sps__actions {
  display: flex;
  align-items: center;
  gap: $space-1;
  justify-content: flex-end;
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
.sps__edit-area {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: $font-size-sm;
}

.sps__edit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $space-2;
  padding-top: $space-2;
}
</style>
