<template>
  <FullCalendar
    :options="calendarOptions"
    style="height: 80vh;"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const props = defineProps({
  events: { type: Array, required: true },
  initialView: { type: String, default: 'dayGridMonth' },
})

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: props.initialView,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth',
  },
  events: props.events,
  editable: false,
  selectable: false,
  eventClick: null,
  dateClick: null,
})

watch(() => props.events, (newEvents) => {
  calendarOptions.value.events = newEvents
})
</script>
