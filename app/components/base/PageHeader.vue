<template>
  <header class="page-header">
    <div class="page-header__content">
      <slot name="icon" />
      <div>
        <h1 class="page-header__title">
          <slot name="title" />
        </h1>
        <p v-if="$slots.subtitle" class="page-header__subtitle">
          <slot name="subtitle" />
        </p>
      </div>
      <div class="page-header__actions">
        <slot name="actions" />
      </div>
    </div>
    <slot name="tabs" />
  </header>
</template>

<script setup lang="ts">
// No props, solo slots para máxima flexibilidad
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.page-header {
  background: $color-surface;
  border-bottom: 1px solid $color-divider;
  padding: $space-5 $space-6 $space-4 $space-6;
  margin-bottom: $space-5;
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__content {
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__title {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    color: $color-text-main;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-h5;
    color: $color-text-secondary;
    margin: 0;
    margin-top: $space-1;
  }

  &__actions {
    margin-left: auto;
    display: flex;
    gap: $space-2;
  }
}
</style>
