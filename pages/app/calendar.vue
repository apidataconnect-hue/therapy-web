<template>
  <div>
    <h2>Mi agenda</h2>
    <PatientCalendar :events="events" initial-view="dayGridMonth" />
    <!-- Modal de detalle de cita (solo lectura) -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>Detalle de cita</v-card-title>
        <v-card-text>
          <div><strong>Título:</strong> {{ selectedEvent?.title }}</div>
          <div><strong>Inicio:</strong> {{ selectedEvent?.start }}</div>
          <div><strong>Fin:</strong> {{ selectedEvent?.end }}</div>
          <div><strong>Notas:</strong> {{ selectedEvent?.notes || '—' }}</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PatientCalendar from '~/components/calendar/PatientCalendar.vue'

const events = ref([
  { id: 1, title: 'Sesión con mi terapeuta', start: '2026-03-23T10:00:00', end: '2026-03-23T11:00:00', notes: 'Primera sesión' },
  { id: 2, title: 'Sesión de seguimiento', start: '2026-03-28T12:00:00', end: '2026-03-28T13:00:00', notes: '' },
])

const showModal = ref(false)
const selectedEvent = ref<any>(null)

// Para el futuro: conectar el click del evento a este modal
</script>
