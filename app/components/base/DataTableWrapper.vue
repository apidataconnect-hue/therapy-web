<template>
  <div class="data-table-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Wrapper para tablas, aplica fondo, borde y padding consistente
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.data-table-wrapper {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-xs;
  padding: $space-5 $space-6;
  margin-bottom: $space-5;
  overflow-x: auto;
}
</style>
