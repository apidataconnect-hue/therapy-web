<template>
  <div class="calendar-wrap" @mousemove="updateTooltipPos">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      class="patient-calendar"
    />

    <Teleport to="body">
      <div v-if="tooltip.visible" class="cal-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        <p class="cal-tooltip__name">{{ tooltip.title }}</p>
        <hr class="cal-tooltip__sep" />
        <div class="cal-tooltip__row">
          <span class="cal-tooltip__label">Hora</span>
          <span class="cal-tooltip__val">{{ tooltip.time }}</span>
        </div>
        <div class="cal-tooltip__row">
          <span class="cal-tooltip__label">Tipo</span>
          <span class="cal-tooltip__val">{{ tooltip.type }}</span>
        </div>
        <div class="cal-tooltip__row">
          <span class="cal-tooltip__label">Estado</span>
          <span class="cal-tooltip__val" :class="`cal-tooltip__status--${tooltip.rawStatus}`">{{ tooltip.status }}</span>
        </div>
        <div v-if="tooltip.therapist" class="cal-tooltip__row">
          <span class="cal-tooltip__label">Terapeuta</span>
          <span class="cal-tooltip__val">{{ tooltip.therapist }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const props = defineProps({
  events: { type: Array, required: true },
})

const calendarRef = ref()

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipState {
  visible: boolean; x: number; y: number
  title: string; time: string; type: string
  status: string; rawStatus: string; therapist: string
}
const tooltip = ref<TooltipState>({
  visible: false, x: 0, y: 0,
  title: '', time: '', type: '', status: '', rawStatus: '', therapist: '',
})
let tooltipTimer: ReturnType<typeof setTimeout> | null = null

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show:   'No asistió',
}

const TYPE_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  in_person:  'Presencial',
  online:     'Online',
  phone:      'Teléfono',
  home_visit: 'Domicilio',
}

const TYPE_ICONS: Record<string, string> = {
  presencial: 'M12 2C10.3 2 9 3.3 9 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 14c-4.4 0-8 1.8-8 4v1h16v-1c0-2.2-3.6-4-8-4z',
  in_person:  'M12 2C10.3 2 9 3.3 9 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 14c-4.4 0-8 1.8-8 4v1h16v-1c0-2.2-3.6-4-8-4z',
  online:     'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  phone:      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
  home_visit: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
}

function ftm(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function updateTooltipPos(e: MouseEvent) {
  if (!tooltip.value.visible) return
  const tipW = 260
  tooltip.value.x = e.clientX + 16 + tipW > window.innerWidth ? e.clientX - tipW - 6 : e.clientX + 16
  tooltip.value.y = e.clientY - 10
}

// ── Event renderer ────────────────────────────────────────────────────────────
function renderEventContent(arg: any) {
  const apptType  = arg.event.extendedProps?.appointmentType
  const status    = arg.event.extendedProps?.status
  const timeText  = arg.timeText
  const title     = arg.event.title
  const svgPath   = TYPE_ICONS[apptType]
  const typeLabel = TYPE_LABELS[apptType] ?? apptType
  const cancelled = status === 'cancelled'

  const typeBadge = svgPath
    ? h('span', { class: 'fc-event-inner__type' }, [
        h('svg', {
          viewBox: '0 0 24 24',
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'currentColor',
          width: '10',
          height: '10',
        }, [h('path', { d: svgPath })]),
        h('span', typeLabel),
      ])
    : null

  const cancelledBadge = cancelled
    ? h('span', { class: 'fc-event-inner__cancelled' }, 'Cancelada')
    : null

  return h('div', { class: ['fc-event-inner', cancelled ? 'fc-event-inner--cancelled' : ''] }, [
    h('div', { class: 'fc-event-inner__header' }, [
      h('span', { class: 'fc-event-inner__time' }, timeText),
    ]),
    h('span', { class: 'fc-event-inner__title' }, title),
    cancelledBadge ?? (typeBadge ? h('div', { class: 'fc-event-inner__meta' }, [typeBadge]) : null),
  ])
}

// ── Calendar options ──────────────────────────────────────────────────────────
const calendarOptions = ref({
  plugins: [dayGridPlugin],
  locale: 'es',
  timeZone: 'local',
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: '',
  },
  buttonText: {
    today: 'Hoy',
  },
  firstDay: 1,
  weekends: true,
  events: props.events,
  editable: false,
  selectable: false,
  eventContent: renderEventContent,
  eventClassNames: (arg: any) => {
    const end = arg.event.end ?? arg.event.start
    const status = arg.event.extendedProps?.status
    const isPast = end && end < new Date()
    const isCancelled = status === 'cancelled'
    return isPast || isCancelled ? ['fc-event--past'] : []
  },
  eventMouseEnter: (info: any) => {
    if (tooltipTimer) clearTimeout(tooltipTimer)
    const ev = info.event
    const p  = ev.extendedProps
    const je = info.jsEvent as MouseEvent
    tooltipTimer = setTimeout(() => {
      const tipW = 260
      const x = je.clientX + 16 + tipW > window.innerWidth ? je.clientX - tipW - 6 : je.clientX + 16
      tooltip.value = {
        visible: true,
        x,
        y: je.clientY - 10,
        title: ev.title,
        time: `${ftm(ev.start)} – ${ftm(ev.end)}`,
        type: TYPE_LABELS[p.appointmentType] ?? p.appointmentType ?? '—',
        status: STATUS_LABELS[p.status] ?? p.status ?? '—',
        rawStatus: p.status ?? '',
        therapist: p.therapistName ?? '',
      }
    }, 280)
  },
  eventMouseLeave: () => {
    if (tooltipTimer) clearTimeout(tooltipTimer)
    tooltip.value.visible = false
  },
})

watch(() => props.events, (newEvents) => {
  const api = calendarRef.value?.getApi()
  if (!api) { calendarOptions.value.events = newEvents; return }
  api.removeAllEvents()
  for (const ev of newEvents) api.addEvent(ev as any)
})
</script>

<style scoped>
.calendar-wrap {
  height: 100%;
}
.patient-calendar {
  height: calc(100vh - 260px);
  min-height: 480px;
}
</style>

<style>
/* ── Patient calendar event cards ── */
.fc-event--past {
  opacity: 0.45 !important;
}

.fc-event-inner--cancelled .fc-event-inner__title {
  text-decoration: line-through;
  opacity: 0.8;
}

.fc-event-inner__cancelled {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.64rem;
  font-weight: 600;
  opacity: 0.9;
  line-height: 1;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  padding: 1px 5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.fc-event-inner {
  display: flex;
  flex-direction: column;
  padding: 3px 6px 4px;
  overflow: hidden;
  height: 100%;
  gap: 1px;
}

.fc-event-inner__header {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.fc-event-inner__time {
  font-size: 0.67rem;
  opacity: 0.82;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.01em;
}

.fc-event-inner__title {
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  flex-shrink: 0;
}

.fc-event-inner__meta {
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.fc-event-inner__type {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.64rem;
  font-weight: 500;
  opacity: 0.82;
  line-height: 1;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 3px;
  padding: 1px 4px 1px 3px;
}

/* ── Tooltip ── */
.cal-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 14px;
  min-width: 200px;
  max-width: 260px;
  font-size: 13px;
  color: #1c1c2e;
  line-height: 1.4;
}

.cal-tooltip__name {
  font-weight: 600;
  font-size: 13.5px;
  color: #1c1c2e;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-tooltip__sep {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  margin: 8px 0;
}

.cal-tooltip__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  line-height: 1.65;
}

.cal-tooltip__label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  flex-shrink: 0;
}

.cal-tooltip__val {
  font-size: 12.5px;
  color: #374151;
  text-align: right;
}

.cal-tooltip__status--scheduled  { color: #3b82f6; font-weight: 500; }
.cal-tooltip__status--confirmed  { color: #22c55e; font-weight: 500; }
.cal-tooltip__status--completed  { color: #9ca3af; font-weight: 500; }
.cal-tooltip__status--cancelled  { color: #ef4444; font-weight: 500; }
.cal-tooltip__status--no_show    { color: #d97706; font-weight: 500; }
</style>
