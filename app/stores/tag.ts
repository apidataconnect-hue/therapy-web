import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type CreateTagPayload,
  type UpdateTagPayload,
} from '~/services/tagService'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  const activeTags = computed(() => tags.value.filter(t => t.isActive))

  async function fetchTags(force = false) {
    if (initialized.value && !force) return
    loading.value = true
    try {
      tags.value = await getTags(false) // fetch all, including inactive
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  async function addTag(payload: CreateTagPayload): Promise<Tag> {
    const tag = await createTag(payload)
    tags.value.push(tag)
    return tag
  }

  async function editTag(id: string, payload: UpdateTagPayload): Promise<Tag> {
    const updated = await updateTag(id, payload)
    const idx = tags.value.findIndex(t => t.id === id)
    if (idx !== -1) tags.value[idx] = updated
    return updated
  }

  async function removeTag(id: string): Promise<void> {
    await deleteTag(id)
    tags.value = tags.value.filter(t => t.id !== id)
  }

  return { tags, activeTags, loading, initialized, fetchTags, addTag, editTag, removeTag }
})
