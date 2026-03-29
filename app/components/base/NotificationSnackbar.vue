<template>
  <v-snackbar
    v-model="modelValue"
    :color="color"
    :timeout="timeout"
    location="top right"
    class="notification-snackbar"
  >
    <slot />
  </v-snackbar>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: Boolean,
  type: {
    type: String,
    default: 'info',
  },
  timeout: {
    type: Number,
    default: 4000,
  },
})

const colorMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
}
const color = colorMap[props.type] || 'info'
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.notification-snackbar {
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}
</style>
