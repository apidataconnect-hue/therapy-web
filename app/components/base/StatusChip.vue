<template>
  <v-chip
    :color="color"
    class="status-chip"
    :variant="variant"
    size="small"
    :disabled="disabled"
  >
    <slot />
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  disabled: Boolean,
})

const statusColors = {
  upcoming: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'warning',
  readonly: 'grey-lighten-2',
}

const color = statusColors[props.status] || 'default'
const variant = props.disabled ? 'outlined' : 'elevated'
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.status-chip {
  font-size: $font-size-caption;
  font-weight: $font-weight-medium;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  border-radius: $radius-sm;
}
</style>
