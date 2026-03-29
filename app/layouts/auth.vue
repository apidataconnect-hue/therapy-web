<template>
  <v-app>
    <v-main class="auth-main">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { PALETTES, applyPaletteToTheme } from '~/stores/theme'

const vuetifyTheme = useTheme()
const defaultPalette = PALETTES.find(p => p.id === 'purple-clinical')!
onMounted(() => {
  applyPaletteToTheme(defaultPalette, vuetifyTheme)
})
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.auth-main {
  background: $color-background;
  min-height: 100vh;
}
</style>
