import { defineStore } from 'pinia'

export const CAL_EVENT_SCHEDULED = '#5B2A86'
export const CAL_EVENT_COMPLETED = '#2E8B57'
export const CAL_EVENT_CANCELLED = '#9E9E9E'

export interface Palette {
  id: string
  primary: string
  secondary: string
}

export const PALETTES: Palette[] = [
  { id: 'purple-clinical', primary: '#5B2A86', secondary: '#9AC6C5' },
]

export function applyPaletteToTheme(palette: Palette, vuetifyTheme: any) {
  vuetifyTheme.themes.value.light.colors.primary = palette.primary
  vuetifyTheme.themes.value.light.colors.secondary = palette.secondary
}

export const useThemeStore = defineStore('appTheme', {
  actions: { setPalette(_id: string) {} },
})
