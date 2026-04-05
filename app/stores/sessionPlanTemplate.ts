import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type SessionPlanTemplate,
  type CreateTemplatePayload,
  type UpdateTemplatePayload,
} from '~/services/sessionPlanTemplateService'

export const useSessionPlanTemplateStore = defineStore('sessionPlanTemplate', () => {
  const templates = ref<SessionPlanTemplate[]>([])
  const loading   = ref(false)
  const saving    = ref(false)
  const deleting  = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      templates.value = await getTemplates()
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateTemplatePayload): Promise<SessionPlanTemplate> {
    saving.value = true
    try {
      const tpl = await createTemplate(payload)
      templates.value.push(tpl)
      return tpl
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: UpdateTemplatePayload): Promise<SessionPlanTemplate> {
    saving.value = true
    try {
      const updated = await updateTemplate(id, payload)
      const idx = templates.value.findIndex(t => t.id === id)
      if (idx !== -1) templates.value[idx] = updated
      return updated
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    deleting.value = true
    try {
      await deleteTemplate(id)
      templates.value = templates.value.filter(t => t.id !== id)
    } finally {
      deleting.value = false
    }
  }

  async function setDefault(id: string): Promise<void> {
    // Optimistic update
    const prev = templates.value.map(t => ({ ...t }))
    templates.value = templates.value.map(t => ({ ...t, isDefault: t.id === id }))
    try {
      await updateTemplate(id, { isDefault: true })
      // Refresh to get accurate server state (other templates' isDefault may have changed)
      await fetchAll()
    } catch (e) {
      templates.value = prev
      throw e
    }
  }

  return { templates, loading, saving, deleting, fetchAll, create, update, remove, setDefault }
})
