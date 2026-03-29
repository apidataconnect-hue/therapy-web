<template>
  <div class="action-bar">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Barra de acciones para agrupar botones principales/secundarios
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.action-bar {
  display: flex;
  gap: $space-2;
  justify-content: flex-end;
  margin-top: $space-4;
}
</style>
