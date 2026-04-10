<template>
  <div class="cfg-page">
    <div class="cfg-page__header">
      <div class="cfg-page__title-wrap">
        <v-icon icon="mdi-cog-outline" color="primary" size="22" class="mr-2" />
        <h2 class="cfg-page__title">Configuración</h2>
      </div>
      <p class="cfg-page__subtitle">Opciones de configuración</p>
    </div>
    <div class="cfg-empty">
      <v-icon icon="mdi-cog-outline" size="48" color="disabled" />
      <p class="mt-3">No hay opciones de configuración disponibles por el momento.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], role: 'THERAPIST' })
</script>

<style scoped lang="scss">
@use '~/assets/styles/tokens' as *;

.cfg-page {
  padding: $space-5;
  max-width: 900px;

  &__header { margin-bottom: $space-5; }
  &__title-wrap { display: flex; align-items: center; margin-bottom: $space-1; }
  &__title { font-size: $font-size-2xl; font-weight: $font-weight-bold; color: $color-text-main; margin: 0; }
  &__subtitle { font-size: $font-size-base; color: $color-text-muted; margin: 0; }
}

.cfg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-8 0;
  color: $color-text-muted;
  font-size: $font-size-base;
}
</style>
