<template>
  <v-dialog v-model="modelValue" persistent :max-width="maxWidth">
    <v-card class="base-dialog__card">
      <slot />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: Boolean,
  maxWidth: {
    type: [String, Number],
    default: 480,
  },
})
</script>

<style scoped lang="scss">
@use '@/app/assets/styles/tokens' as *;

.base-dialog__card {
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $space-6 $space-6 $space-5 $space-6;
  background: $color-surface;
}
</style>
