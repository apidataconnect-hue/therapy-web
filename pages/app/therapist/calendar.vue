<template>
  <div>
    <h2>Agenda del terapeuta</h2>
    <TherapistCalendar
      :events="events"
      :editable="true"
      initial-view="timeGridWeek"
      @eventClick="onEventClick"
      @dateClick="onDateClick"
      @eventDrop="onEventDrop"
      @eventResize="onEventResize"
    />
    <!-- Modal para crear/editar cita (placeholder) -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>{{ modalTitle }}</v-card-title>
        <v-card-text>
          <!-- Formulario de cita/sesión -->
          <v-form @submit.prevent="onSave">
            <v-text-field v-model="form.title" label="Título" required />
            <v-text-field v-model="form.start" label="Inicio" type="datetime-local" required />
            <v-text-field v-model="form.end" label="Fin" type="datetime-local" required />
            <v-textarea v-model="form.notes" label="Notas" />
            <v-btn type="submit" color="primary">Guardar</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TherapistCalendar from '~/components/calendar/TherapistCalendar.vue'

const events = ref([
  // Ejemplo de eventos
  { id: 1, title: 'Sesión con Juan', start: '2026-03-23T10:00:00', end: '2026-03-23T11:00:00', notes: 'Primera sesión' },
  { id: 2, title: 'Sesión con Ana', start: '2026-03-24T12:00:00', end: '2026-03-24T13:00:00', notes: '' },
])

const showModal = ref(false)
const modalTitle = ref('')
const form = ref({ id: null, title: '', start: '', end: '', notes: '' })

function onEventClick(info: any) {
  const event = info.event
  form.value = {
    id: event.id,
    title: event.title,
    start: event.startStr,
    end: event.endStr,
    notes: event.extendedProps.notes || '',
  }
  modalTitle.value = 'Editar cita/sesión'
  showModal.value = true
}

function onDateClick(info: any) {
  form.value = { id: null, title: '', start: info.dateStr, end: info.dateStr, notes: '' }
  modalTitle.value = 'Crear nueva cita/sesión'
  showModal.value = true
}

function onEventDrop(info: any) {
  // Aquí se actualizaría la cita en backend
  // info.event contiene los nuevos datos
}

function onEventResize(info: any) {
  // Aquí se actualizaría la cita en backend
}

function onSave() {
  // Guardar cita (crear o editar)
  showModal.value = false
}
</script>
