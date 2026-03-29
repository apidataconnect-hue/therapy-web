import { defineStore } from 'pinia'

export interface ColorPalette {
  id: string
  name: string
  nav: string
  calEventScheduled: string
  calEventCompleted: string
  calEventCancelled: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    'primary-subtle': string
    'secondary-subtle': string
  }
}

export const PALETTES: ColorPalette[] = [
  {
    id: 'purple-clinical',
    name: 'Púrpura Clínico',
    nav: '#360568',
    calEventScheduled: '#5B2A86',
    calEventCompleted: '#2E8B57',
    calEventCancelled: '#9E9E9E',
    colors: {
      primary: '#5B2A86',
      secondary: '#9AC6C5',
      background: '#F7F5FA',
      surface: '#FFFFFF',
      'primary-subtle': '#F2EBF9',
      'secondary-subtle': '#E4F5F4',
    },
  },
  {
    id: 'sapphire-blue',
    name: 'Azul Zafiro',
    nav: '#0D2654',
    calEventScheduled: '#1E4080',
    calEventCompleted: '#1A6B4A',
    calEventCancelled: '#8E9BB0',
    colors: {
      primary: '#1E4080',
      secondary: '#5BA4CF',
      background: '#F0F5FF',
      surface: '#FFFFFF',
      'primary-subtle': '#E6EEFF',
      'secondary-subtle': '#DBF0FF',
    },
  },
  {
    id: 'emerald-health',
    name: 'Verde Esmeralda',
    nav: '#0D4028',
    calEventScheduled: '#1A6B4A',
    calEventCompleted: '#0D4028',
    calEventCancelled: '#9DB0A0',
    colors: {
      primary: '#1A6B4A',
      secondary: '#52B788',
      background: '#F0FBF4',
      surface: '#FFFFFF',
      'primary-subtle': '#E0F5E9',
      'secondary-subtle': '#D5F0E2',
    },
  },
  {
    id: 'teal-oceanic',
    name: 'Teal Oceánico',
    nav: '#054650',
    calEventScheduled: '#0D6E7A',
    calEventCompleted: '#1A6B4A',
    calEventCancelled: '#8EA8A9',
    colors: {
      primary: '#0D6E7A',
      secondary: '#48CAE4',
      background: '#F0FBFD',
      surface: '#FFFFFF',
      'primary-subtle': '#E0F5F8',
      'secondary-subtle': '#D0F3FA',
    },
  },
  {
    id: 'indigo-serene',
    name: 'Índigo Sereno',
    nav: '#1E1C70',
    calEventScheduled: '#3B3896',
    calEventCompleted: '#2E6B57',
    calEventCancelled: '#9B9BB5',
    colors: {
      primary: '#3B3896',
      secondary: '#818CF8',
      background: '#F5F5FF',
      surface: '#FFFFFF',
      'primary-subtle': '#EAEAFF',
      'secondary-subtle': '#ECEEFF',
    },
  },
  {
    id: 'burgundy-classic',
    name: 'Burdeos Clásico',
    nav: '#4A0E20',
    calEventScheduled: '#7B1F3A',
    calEventCompleted: '#2E6B4A',
    calEventCancelled: '#A89298',
    colors: {
      primary: '#7B1F3A',
      secondary: '#DF8FA1',
      background: '#FEF6F8',
      surface: '#FFFFFF',
      'primary-subtle': '#FCEEF2',
      'secondary-subtle': '#FDEAEF',
    },
  },
  {
    id: 'slate-modern',
    name: 'Pizarra Moderna',
    nav: '#18253F',
    calEventScheduled: '#2C3E6B',
    calEventCompleted: '#2E6B57',
    calEventCancelled: '#8898A8',
    colors: {
      primary: '#2C3E6B',
      secondary: '#7E98C8',
      background: '#F4F6FA',
      surface: '#FFFFFF',
      'primary-subtle': '#EAF0FA',
      'secondary-subtle': '#EBF0F9',
    },
  },
  {
    id: 'olive-natural',
    name: 'Oliva Natural',
    nav: '#2C3618',
    calEventScheduled: '#4A5B2D',
    calEventCompleted: '#2E6B4A',
    calEventCancelled: '#9AA08E',
    colors: {
      primary: '#4A5B2D',
      secondary: '#9DBF6C',
      background: '#F8FAF2',
      surface: '#FFFFFF',
      'primary-subtle': '#EFF3E5',
      'secondary-subtle': '#EDF5DF',
    },
  },
  {
    id: 'midnight-blue',
    name: 'Azul Medianoche',
    nav: '#0D1A45',
    calEventScheduled: '#1B2C6B',
    calEventCompleted: '#1A6B4A',
    calEventCancelled: '#8892A8',
    colors: {
      primary: '#1B2C6B',
      secondary: '#5FA3C7',
      background: '#F2F5FF',
      surface: '#FFFFFF',
      'primary-subtle': '#E5EAFF',
      'secondary-subtle': '#E4F1FA',
    },
  },
  {
    id: 'warm-earth',
    name: 'Tierra Cálida',
    nav: '#3B1E0A',
    calEventScheduled: '#5C3317',
    calEventCompleted: '#4A6B2D',
    calEventCancelled: '#A89880',
    colors: {
      primary: '#5C3317',
      secondary: '#D4956A',
      background: '#FDF5EE',
      surface: '#FFFFFF',
      'primary-subtle': '#FBF0E8',
      'secondary-subtle': '#FAE8DB',
    },
  },
]

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function applyPaletteToTheme(palette: ColorPalette, themeInstance: any) {
  Object.assign(themeInstance.themes.value.light.colors, palette.colors)
  if (typeof document !== 'undefined') {
    const s = document.documentElement.style
    s.setProperty('--app-nav-bg', palette.nav)
    s.setProperty('--cal-event-scheduled', palette.calEventScheduled)
    s.setProperty('--cal-event-completed', palette.calEventCompleted)
    s.setProperty('--cal-event-cancelled', palette.calEventCancelled)
    s.setProperty('--cal-event-completed-bg', hexToRgba(palette.calEventCompleted, 0.08))
    s.setProperty('--cal-event-cancelled-bg', hexToRgba(palette.calEventCancelled, 0.08))
  }
}

export const useThemeStore = defineStore('appTheme', {
  state: () => ({
    paletteId: (typeof localStorage !== 'undefined'
      ? localStorage.getItem('tw-palette-id') ?? 'purple-clinical'
      : 'purple-clinical') as string,
  }),
  getters: {
    currentPalette(state): ColorPalette {
      return PALETTES.find(p => p.id === state.paletteId) ?? PALETTES[0]!
    },
  },
  actions: {
    setPalette(id: string) {
      this.paletteId = id
      if (typeof localStorage !== 'undefined') localStorage.setItem('tw-palette-id', id)
    },
  },
})
