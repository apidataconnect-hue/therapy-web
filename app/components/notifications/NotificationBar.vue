<template>
  <v-snackbar v-model="show" :color="color" :timeout="timeout" top right>
    {{ message }}
    <template #actions>
      <v-btn icon @click="show = false"><v-icon>mdi-close</v-icon></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineExpose } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  message: String,
  color: {
    type: String,
    default: 'info',
  },
  timeout: {
    type: Number,
    default: 4000,
  },
})

const show = ref(props.modelValue)
watch(() => props.modelValue, v => show.value = v)

defineExpose({ show })
</script>
