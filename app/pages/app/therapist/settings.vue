<template>
  <div class="cfg-page">
    <!-- Header -->
    <div class="cfg-page__header">
      <div class="cfg-page__title-wrap">
        <v-icon icon="mdi-cog-outline" color="primary" size="22" class="mr-2" />
        <h2 class="cfg-page__title">Configuración</h2>
      </div>
      <p class="cfg-page__subtitle">Personaliza tu experiencia en TherapyWeb</p>
    </div>

    <!-- Apariencia -->
    <v-card class="cfg-section mb-5">
      <div class="cfg-section__header">
        <v-icon icon="mdi-palette-outline" size="20" color="primary" class="mr-2" />
        <span class="cfg-section__title">Apariencia</span>
      </div>
      <v-divider />
      <div class="cfg-section__body">
        <div class="cfg-option__label">Elige tu combinación de colores</div>
        <div class="cfg-option__hint">
          Cada combinación incluye colores armónicos para toda la interfaz. Los cambios se aplican al instante.
        </div>

        <div class="palette-grid mt-4">
          <button
            v-for="palette in palettes"
            :key="palette.id"
            class="palette-card"
            :class="{ 'palette-card--active': themeStore.paletteId === palette.id }"
            type="button"
            @click="select(palette)"
          >
            <!-- Color bands: sidebar / primary / secondary / background -->
            <div class="palette-card__bands">
              <span class="palette-card__band palette-card__band--nav" :style="{ background: palette.nav }" />
              <span class="palette-card__band" :style="{ background: palette.colors.primary }" />
              <span class="palette-card__band" :style="{ background: palette.colors.secondary }" />
              <span class="palette-card__band palette-card__band--bg" :style="{ background: palette.colors.background }" />
            </div>
            <!-- Dot row for extra detail -->
            <div class="palette-card__dots">
              <span class="palette-card__dot" :style="{ background: palette.colors.primary }" />
              <span class="palette-card__dot" :style="{ background: palette.colors.secondary }" />
              <span class="palette-card__dot" :style="{ background: palette.colors['primary-subtle'] }" />
              <span class="palette-card__dot" :style="{ background: palette.nav }" />
            </div>
            <div class="palette-card__footer">
              <span class="palette-card__name">{{ palette.name }}</span>
              <v-icon
                v-if="themeStore.paletteId === palette.id"
                icon="mdi-check-circle"
                size="15"
                color="primary"
              />
            </div>
          </button>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { PALETTES, useThemeStore, applyPaletteToTheme, type ColorPalette } from '~/stores/theme'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()
const palettes = PALETTES

function select(palette: ColorPalette) {
  themeStore.setPalette(palette.id)
  applyPaletteToTheme(palette, vuetifyTheme)
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.cfg-page {
  padding: $space-5;
  max-width: 900px;

  &__header {
    margin-bottom: $space-5;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: $space-1;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-base;
    color: $color-text-muted;
    margin: 0;
  }
}

.cfg-section {
  &__header {
    display: flex;
    align-items: center;
    padding: $space-4 $space-5;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
  }

  &__body {
    padding: $space-4 $space-5 $space-5;
  }
}

.cfg-option {
  &__label {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-main;
    margin-bottom: $space-1;
  }

  &__hint {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }
}

// ── Palette grid ──────────────────────────────────────────────────────────────
.palette-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $space-3;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.palette-card {
  all: unset;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 2px solid $color-border;
  border-radius: $radius-lg;
  background: $color-surface;
  transition: box-shadow $transition-fast, border-color $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $color-text-muted;
  }

  &--active {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)), $shadow-sm;

    .palette-card__bands {
      transform: translateY(4px);
      border-radius: 0;
    }
  }

  // ── Colour bands (top strip)
  &__bands {
    display: flex;
    flex-shrink: 0;
    height: 44px;
    border-radius: calc(#{$radius-lg} - 2px) calc(#{$radius-lg} - 2px) 0 0;
    overflow: hidden;
    transition: transform $transition-fast, border-radius $transition-fast;
  }

  &__band {
    flex: 1;

    &--nav { flex: 0.8; }  // slightly narrower — darker anchor colour
    &--bg  { flex: 0.6; }  // narrowest — lightest, acts as whitespace
  }

  // ── Dot row (secondary detail)
  &__dots {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: $space-2 $space-3 0;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  // ── Footer
  &__footer {
    padding: $space-2 $space-3 $space-3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-1;
  }

  &__name {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    line-height: 1.3;
  }
}
</style>
