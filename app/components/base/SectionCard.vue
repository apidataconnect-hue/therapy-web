<template>
  <v-card class="section-card" elevation="0">
    <slot />
  </v-card>
</template>

<script setup lang="ts">
// Componente base para secciones, usa v-card de Vuetify
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.section-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-xs;
  padding: $space-5 $space-6;
  margin-bottom: $space-5;
}
</style>
