<template>
  <v-card class="stats-card" elevation="0">
    <div class="stats-card__content">
      <div class="stats-card__icon">
        <slot name="icon" />
      </div>
      <div>
        <div class="stats-card__value">
          <slot name="value" />
        </div>
        <div class="stats-card__label">
          <slot name="label" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
// Card para KPIs o stats, con icono y valor
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.stats-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-xs;
  padding: $space-4 $space-5;
  display: flex;
  align-items: center;
  min-width: 180px;

  &__content {
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__icon {
    font-size: 2rem;
    color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: $color-hover;
    border-radius: $radius-md;
  }

  &__value {
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $color-text-main;
  }

  &__label {
    font-size: $font-size-caption;
    color: $color-text-secondary;
    margin-top: $space-1;
  }
  
}
</style>
