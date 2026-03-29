<template>
  <div>
    <h2>Detalle de terapia</h2>
    <!-- TODO: mostrar información de la terapia y permitir editar -->
  </div>
</template>

<script setup lang="ts">
// Página de detalle y edición de terapia (placeholder)

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
