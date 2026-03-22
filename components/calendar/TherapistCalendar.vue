<template>
  <FullCalendar
    ref="calendarRef"
    :options="calendarOptions"
    style="height: 80vh;"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const props = defineProps({
  events: { type: Array, required: true },
  editable: { type: Boolean, default: true },
  initialView: { type: String, default: 'timeGridWeek' },
})

const emit = defineEmits(['eventClick', 'dateClick', 'eventDrop', 'eventResize'])
const calendarRef = ref()

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: props.initialView,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek',
  },
  events: props.events,
  editable: props.editable,
  selectable: true,
  eventClick: (info: any) => emit('eventClick', info),
  dateClick: (info: any) => emit('dateClick', info),
  eventDrop: (info: any) => emit('eventDrop', info),
  eventResize: (info: any) => emit('eventResize', info),
})

watch(() => props.events, (newEvents) => {
  calendarOptions.value.events = newEvents
})
</script>
