

<template>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center">
    <h1>Bienvenido a Therapy Web</h1>
    <p>Plataforma para gestión de terapias, pacientes y sesiones.</p>
    <NuxtLink to="/login">
      <button style="margin:16px 0;padding:10px 24px;font-size:1rem;">Iniciar sesión</button>
    </NuxtLink>
    <div style="margin-top:24px;">
      <NuxtLink to="/app/therapist/sessions">
        <button style="margin-right:12px;padding:10px 24px;">Soy Terapeuta</button>
      </NuxtLink>
      <NuxtLink to="/app/patients">
        <button style="padding:10px 24px;">Soy Paciente</button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
</script>
