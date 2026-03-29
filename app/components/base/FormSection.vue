<template>
  <section class="form-section">
    <slot />
  </section>
</template>

<script setup lang="ts">
// Wrapper visual para secciones de formularios
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.form-section {
  background: $color-surface;
  border-radius: $radius-md;
  border: 1px solid $color-border;
  padding: $space-5 $space-6;
  margin-bottom: $space-5;
}
</style>
