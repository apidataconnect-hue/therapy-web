<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="tm-card">
      <!-- Title bar -->
      <div class="tm-card__header">
        <v-icon icon="mdi-tag-multiple-outline" size="18" color="primary" class="mr-2" />
        <span class="tm-card__title">Gestionar etiquetas</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:modelValue', false)" />
      </div>
      <v-divider />

      <!-- Body -->
      <v-card-text class="pa-0 tm-card__body">
        <div v-if="tagStore.loading" class="tm-state">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>

        <div v-else-if="tagStore.tags.length === 0 && !showNewForm" class="tm-state">
          <v-icon icon="mdi-tag-off-outline" size="40" color="disabled" />
          <p class="text-medium-emphasis text-sm mt-2">Aún no tienes etiquetas</p>
        </div>

        <div v-else class="tm-list">
          <div
            v-for="tag in tagStore.tags"
            :key="tag.id"
            class="tm-row"
            :class="{ 'tm-row--inactive': !tag.isActive }"
          >
            <!-- Edit mode -->
            <template v-if="editingId === tag.id">
              <div class="tm-edit-form">
                <div class="tm-swatch-row">
                  <button
                    v-for="c in PRESET_COLORS"
                    :key="c"
                    type="button"
                    class="tm-swatch"
                    :class="{ 'tm-swatch--sel': editColor === c }"
                    :style="{ background: c }"
                    @click="editColor = c"
                  />
                </div>
                <div class="tm-edit-row">
                  <v-text-field
                    v-model="editName"
                    variant="outlined"
                    density="compact"
                    autofocus
                    placeholder="Nombre"
                    class="tm-name-input"
                    :error-messages="editError"
                    @keyup.enter="saveEdit(tag.id)"
                    @keyup.escape="cancelEdit"
                    @input="editError = ''"
                  />
                  <v-btn
                    icon="mdi-check"
                    variant="flat"
                    color="primary"
                    size="small"
                    :loading="saving"
                    :disabled="!editName.trim()"
                    @click="saveEdit(tag.id)"
                  />
                  <v-btn icon="mdi-close" variant="text" size="small" @click="cancelEdit" />
                </div>
              </div>
            </template>

            <!-- View mode -->
            <template v-else>
              <span class="tm-dot" :style="{ background: tag.color ?? '#9E9E9E' }" />
              <span class="tm-name">{{ tag.name }}</span>
              <v-chip v-if="!tag.isActive" size="x-small" class="ml-1" variant="tonal">inactiva</v-chip>
              <v-spacer />
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="x-small"
                title="Editar"
                @click="startEdit(tag)"
              />
              <v-btn
                :icon="tag.isActive ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                variant="text"
                size="x-small"
                :title="tag.isActive ? 'Desactivar' : 'Activar'"
                :loading="togglingId === tag.id"
                @click="toggleActive(tag)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                size="x-small"
                color="error"
                title="Eliminar"
                @click="confirmDeleteTag(tag)"
              />
            </template>
          </div>

          <!-- New tag form (inline at bottom of list) -->
          <div v-if="showNewForm" class="tm-row tm-new-form">
            <div class="tm-edit-form">
              <div class="tm-swatch-row">
                <button
                  v-for="c in PRESET_COLORS"
                  :key="c"
                  type="button"
                  class="tm-swatch"
                  :class="{ 'tm-swatch--sel': newColor === c }"
                  :style="{ background: c }"
                  @click="newColor = c"
                />
              </div>
              <div class="tm-edit-row">
                <v-text-field
                  v-model="newName"
                  variant="outlined"
                  density="compact"
                  autofocus
                  placeholder="Nombre de etiqueta"
                  class="tm-name-input"
                  :error-messages="addError"
                  @keyup.enter="addTag"
                  @keyup.escape="showNewForm = false; newName = ''; addError = ''"
                  @input="addError = ''"
                />
                <v-btn
                  icon="mdi-check"
                  variant="flat"
                  color="primary"
                  size="small"
                  :loading="adding"
                  :disabled="!newName.trim()"
                  @click="addTag"
                />
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  @click="showNewForm = false; newName = ''"
                />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-3">
        <v-btn
          prepend-icon="mdi-plus"
          variant="tonal"
          color="primary"
          size="small"
          :disabled="showNewForm || !!editingId"
          @click="showNewForm = true"
        >
          Nueva etiqueta
        </v-btn>
        <v-spacer />
        <v-btn variant="text" size="small" @click="$emit('update:modelValue', false)">Cerrar</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Delete confirmation (nested dialog) -->
    <v-dialog v-model="deleteDialog" max-width="360">
      <v-card>
        <v-card-title class="text-body-1 font-weight-bold pt-5 px-5">¿Eliminar etiqueta?</v-card-title>
        <v-card-text class="px-5 pb-2 text-medium-emphasis">
          Se eliminará <strong>{{ deletingTag?.name }}</strong> y se desvinculará de todos los procesos.<br />Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="executeDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTagStore } from '~/stores/tag'
import type { Tag } from '~/services/tagService'

defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const tagStore = useTagStore()

onMounted(() => { tagStore.fetchTags() })

const PRESET_COLORS = [
  '#5B2A86', '#3b82f6', '#2E8B57', '#C0392B',
  '#C77B2C', '#1A7A8A', '#9E4D8A', '#607D8B',
  '#B0583A', '#7785AC', '#4A7C59', '#2C3E50',
]

// ── New tag ──────────────────────────────────────────────────────────────────
const showNewForm = ref(false)
const newName     = ref('')
const newColor    = ref(PRESET_COLORS[0])
const adding      = ref(false)
const addError    = ref('')

function extractNameError(e: unknown): string {
  const raw = (e as any)?.response?.data
  if (!raw) return ''
  // The axios interceptor may or may not have unwrapped the envelope already.
  // Try both: { name: [...] } and { data: { name: [...] } }
  const msg: string =
    raw?.name?.[0] ??
    raw?.data?.name?.[0] ??
    raw?.message ??
    ''
  if (!msg) return ''
  if (/already exists/i.test(msg)) return 'Ya existe una etiqueta con ese nombre'
  return msg
}

async function addTag() {
  if (!newName.value.trim()) return
  adding.value = true
  try {
    await tagStore.addTag({ name: newName.value.trim(), color: newColor.value })
    newName.value    = ''
    newColor.value   = PRESET_COLORS[0]
    showNewForm.value = false
    addError.value   = ''
  } catch (e) {
    addError.value = extractNameError(e)
  } finally {
    adding.value = false
  }
}

// ── Edit tag ─────────────────────────────────────────────────────────────────
const editingId = ref<string | null>(null)
const editName  = ref('')
const editColor = ref(PRESET_COLORS[0])
const saving    = ref(false)
const editError = ref('')

function startEdit(tag: Tag) {
  editingId.value = tag.id
  editName.value  = tag.name
  editColor.value = tag.color ?? PRESET_COLORS[0]
  editError.value = ''
}

function cancelEdit() {
  editingId.value = null
  editError.value = ''
}

async function saveEdit(id: string) {
  if (!editName.value.trim()) return
  saving.value = true
  try {
    await tagStore.editTag(id, { name: editName.value.trim(), color: editColor.value })
    editingId.value = null
    editError.value = ''
  } catch (e) {
    editError.value = extractNameError(e)
  } finally {
    saving.value = false
  }
}

// ── Toggle active ────────────────────────────────────────────────────────────
const togglingId = ref<string | null>(null)

async function toggleActive(tag: Tag) {
  togglingId.value = tag.id
  try {
    await tagStore.editTag(tag.id, { isActive: !tag.isActive })
  } catch (e) {
    console.error('[TagManager] toggleActive error', e)
  } finally {
    togglingId.value = null
  }
}

// ── Delete tag ───────────────────────────────────────────────────────────────
const deleteDialog = ref(false)
const deletingTag  = ref<Tag | null>(null)
const deleting     = ref(false)

function confirmDeleteTag(tag: Tag) {
  deletingTag.value  = tag
  deleteDialog.value = true
}

async function executeDelete() {
  if (!deletingTag.value) return
  deleting.value = true
  try {
    await tagStore.removeTag(deletingTag.value.id)
    deleteDialog.value = false
    deletingTag.value  = null
  } catch (e) {
    console.error('[TagManager] delete error', e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.tm-card {
  &__header {
    display: flex;
    align-items: center;
    padding: $space-3 $space-4;
  }

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }

  &__body {
    min-height: 80px;
    max-height: 420px;
    overflow-y: auto;
  }
}

.tm-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-6 $space-4;
}

.tm-list {
  padding: $space-2 0;
}

.tm-row {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  transition: background $transition-fast;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.04);
  }

  &--inactive {
    opacity: 0.6;
  }
}

.tm-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.tm-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-main;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Edit form ─────────────────────────────────────────────────────────────────
.tm-edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.tm-swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tm-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform $transition-fast, border-color $transition-fast;
  outline: none;

  &:hover {
    transform: scale(1.15);
  }

  &--sel {
    border-color: $color-text-main;
    transform: scale(1.2);
  }
}

.tm-edit-row {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.tm-name-input {
  flex: 1;
}

.tm-new-form {
  border-top: 1px dashed $color-border;
  padding-top: $space-3;
}
</style>
