import { defineStore } from 'pinia'

export const CAL_EVENT_SCHEDULED = '#5B2A86'
export const CAL_EVENT_COMPLETED = '#2E8B57'
export const CAL_EVENT_CANCELLED = '#9E9E9E'

export const useThemeStore = defineStore('appTheme', {
  actions: { setPalette(_id: string) {} },
})
