<template>
  <div>
    <h2>Detalle de sesión</h2>
    <!-- TODO: mostrar información de la sesión y permitir editar -->
  </div>
</template>

<script setup lang="ts">
// Página de detalle y edición de sesión (placeholder)

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'THERAPIST',
})
</script>
