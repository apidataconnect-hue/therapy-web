import { ref, type Ref } from 'vue'
import {
  generateSessionPlan,
  deleteSessionPlan,
  type SessionPlan,
} from '~/services/sessionPlanService'
import { getTemplates, type SessionPlanTemplate } from '~/services/sessionPlanTemplateService'

export function useSessionPlan(appointmentHash: Ref<string>) {
  const plan               = ref<SessionPlan | null>(null)
  const isLoading          = ref(false)
  const isDeleting         = ref(false)
  const error              = ref<string | null>(null)
  const templates          = ref<SessionPlanTemplate[]>([])
  const templatesLoaded    = ref(false)
  const selectedTemplateId = ref<string | null>(null)

  // ── Load available templates once ──────────────────────────────────────────
  async function loadTemplates() {
    if (templatesLoaded.value) return
    try {
      templates.value = await getTemplates()
      templatesLoaded.value = true
      const defaultTpl = templates.value.find(t => t.isDefault)
      if (defaultTpl) selectedTemplateId.value = defaultTpl.id
    } catch {
      // non-fatal — generation will use backend default
    }
  }

  // ── Init from note data (avoids extra GET /api/session-plan/{hash}) ─────────
  function initFromNote(content: string | null | undefined, planId: string | null | undefined) {
    if (content && planId) {
      plan.value = {
        id:           planId,
        appointmentId: appointmentHash.value,
        templateId:   null,
        templateName: null,
        content,
      }
    } else {
      plan.value = null
    }
  }

  // ── Generate (first time) ─────────────────────────────────────────────────
  async function generatePlan(templateId?: string | null) {
    error.value = null
    isLoading.value = true
    try {
      plan.value = await generateSessionPlan(appointmentHash.value, {
        templateId: templateId ?? selectedTemplateId.value ?? undefined,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.message
      error.value = Array.isArray(msg) ? msg[0] : (msg ?? 'Error al generar el plan')
    } finally {
      isLoading.value = false
    }
  }

  // ── Regenerate ────────────────────────────────────────────────────────────
  async function regeneratePlan(templateIdOverride?: string | null) {
    error.value = null
    isLoading.value = true
    try {
      plan.value = await generateSessionPlan(appointmentHash.value, {
        templateId: templateIdOverride ?? plan.value?.templateId ?? selectedTemplateId.value ?? undefined,
        regenerate: true,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.message
      error.value = Array.isArray(msg) ? msg[0] : (msg ?? 'Error al regenerar el plan')
    } finally {
      isLoading.value = false
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function deletePlan() {
    error.value = null
    isDeleting.value = true
    try {
      await deleteSessionPlan(appointmentHash.value)
      plan.value = null
    } catch (e: any) {
      const msg = e?.response?.data?.message
      error.value = Array.isArray(msg) ? msg[0] : (msg ?? 'Error al eliminar el plan')
    } finally {
      isDeleting.value = false
    }
  }

  return {
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
  }
}
