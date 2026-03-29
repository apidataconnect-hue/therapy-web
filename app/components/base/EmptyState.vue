<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon" />
    </div>
    <div class="empty-state__text">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente para estados vacíos reutilizable
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.empty-state {
  background: $state-empty-bg;
  border: 1px dashed $color-border;
  border-radius: $radius-md;
  padding: $space-6 $space-6;
  text-align: center;
  color: $color-text-secondary;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;

  &__icon {
    font-size: 2.5rem;
    color: $color-info;
    margin-bottom: $space-2;
  }

  &__text {
    font-size: $font-size-body;
    color: $color-text-secondary;
  }
}
</style>
