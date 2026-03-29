<template>
  <v-chip
    :color="color"
    class="calendar-event-chip"
    :variant="variant"
    size="small"
    :disabled="readonly"
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
  readonly: Boolean,
})

const statusColors = {
  upcoming: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'warning',
  readonly: 'grey-lighten-2',
}

const color = statusColors[props.status] || 'default'
const variant = props.readonly ? 'outlined' : 'elevated'
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.calendar-event-chip {
  font-size: $font-size-caption;
  font-weight: $font-weight-medium;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  border-radius: $radius-sm;
}
</style>
