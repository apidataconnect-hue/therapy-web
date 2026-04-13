import { defineStore } from 'pinia'

export const CAL_EVENT_SCHEDULED = '#7C4BA6'
export const CAL_EVENT_COMPLETED = '#3DA870'
export const CAL_EVENT_CANCELLED = '#BDBDBD'

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
