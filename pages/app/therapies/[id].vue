<template>
  <div>
    <h2>Detalle de terapia</h2>
    <!-- TODO: mostrar información de la terapia -->
  </div>
</template>

<script setup lang="ts">
// Página de detalle de terapia (placeholder)

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'PATIENT',
})
</script>
