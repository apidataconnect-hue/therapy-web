<template>
  <div class="calendar-wrap" @mousemove="updateTooltipPos">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      class="therapist-calendar"
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
        <div v-if="tooltip.location" class="cal-tooltip__row">
          <span class="cal-tooltip__label">Lugar</span>
          <span class="cal-tooltip__val">{{ tooltip.location }}</span>
        </div>
        <template v-if="tooltip.notes || tooltip.cancelReason">
          <hr class="cal-tooltip__sep" />
          <p v-if="tooltip.notes" class="cal-tooltip__notes">{{ tooltip.notes }}</p>
          <div v-if="tooltip.cancelReason" class="cal-tooltip__row">
            <span class="cal-tooltip__label">Motivo</span>
            <span class="cal-tooltip__val cal-tooltip__cancel">{{ tooltip.cancelReason }}</span>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const props = defineProps({
  events: { type: Array, required: true },
  editable: { type: Boolean, default: true },
  initialView: { type: String, default: 'timeGridWeek' },
})

const emit = defineEmits(['eventClick', 'dateClick', 'eventDrop', 'eventResize', 'patientNavigate'])
const calendarRef = ref()

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipState {
  visible: boolean; x: number; y: number
  title: string; time: string; type: string
  status: string; rawStatus: string
  location: string; notes: string; cancelReason: string
}
const tooltip = ref<TooltipState>({
  visible: false, x: 0, y: 0,
  title: '', time: '', type: '', status: '', rawStatus: '',
  location: '', notes: '', cancelReason: '',
})
let tooltipTimer: ReturnType<typeof setTimeout> | null = null

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show:   'No asistió',
}

function ftm(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function updateTooltipPos(e: MouseEvent) {
  if (!tooltip.value.visible) return
  const tipW = 270
  tooltip.value.x = e.clientX + 16 + tipW > window.innerWidth ? e.clientX - tipW - 6 : e.clientX + 16
  tooltip.value.y = e.clientY - 10
}
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  in_person:  'M12 2C10.3 2 9 3.3 9 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 14c-4.4 0-8 1.8-8 4v1h16v-1c0-2.2-3.6-4-8-4zm0-2c-2.9 0-6 .9-7.6 2H4c0-2 3.6-3.3 8-3.3s8 1.3 8 3.3h-.4C18 14.9 14.9 14 12 14z',
  online:     'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  phone:      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
  home_visit: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
}
const TYPE_LABELS: Record<string, string> = {
  in_person:  'Presencial',
  online:     'Online',
  phone:      'Teléfono',
  home_visit: 'Domicilio',
}

function renderEventContent(arg: any) {
  const apptId     = arg.event.id
  const apptType   = arg.event.extendedProps?.appointmentType
  const status     = arg.event.extendedProps?.status
  const timeText   = arg.timeText
  const title      = arg.event.title
  const svgPath    = TYPE_ICONS[apptType]
  const typeLabel  = TYPE_LABELS[apptType] ?? apptType
  const cancelled  = status === 'cancelled'

  // Profile link — top-right corner
  const profileLink = h('a', {
    class: 'fc-event-inner__link',
    title: 'Ver paciente',
    onClick: (e: MouseEvent) => {
      e.stopPropagation()
      emit('patientNavigate', apptId)
    },
  }, '\u2197')

  // Type badge: icon + label
  const typeBadge = svgPath
    ? h('span', { class: 'fc-event-inner__type' }, [
        h('svg', {
          viewBox: '0 0 24 24',
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'currentColor',
          width: '10',
          height: '10',
        }, [
          h('path', { d: svgPath }),
        ]),
        h('span', typeLabel),
      ])
    : null

  // Status badge — shown for all statuses
  const statusBadge = status
    ? h('span', { class: `fc-event-inner__status fc-event-inner__status--${status}` }, STATUS_LABELS[status] ?? status)
    : null

  return h('div', { class: ['fc-event-inner', cancelled ? 'fc-event-inner--cancelled' : ''] }, [
    // Row 1: time + profile link
    h('div', { class: 'fc-event-inner__header' }, [
      h('span', { class: 'fc-event-inner__time' }, timeText),
      profileLink,
    ]),
    // Row 2: patient name
    h('span', { class: 'fc-event-inner__title' }, title),
    // Row 3: type badge
    typeBadge ? h('div', { class: 'fc-event-inner__meta' }, [typeBadge]) : null,
    // Row 4: status badge (bottom)
    statusBadge ? h('div', { class: 'fc-event-inner__status-row' }, [statusBadge]) : null,
  ])
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: 'es',
  timeZone: 'local',
  initialView: props.initialView,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
  },
  slotDuration: '00:30:00',
  slotMinTime: '07:00:00',
  slotMaxTime: '22:00:00',
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as any,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as any,
  nowIndicator: true,
  allDaySlot: false,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '08:00',
    endTime: '20:00',
  },
  weekends: true,
  firstDay: 1,
  events: props.events,
  editable: props.editable,
  selectable: true,
  eventContent: renderEventContent,
  eventClassNames: (arg: any) => {
    const end = arg.event.end ?? arg.event.start
    const status = arg.event.extendedProps?.status
    const isPast = end && end < new Date()
    const isCancelled = status === 'cancelled'
    return isPast || isCancelled ? ['fc-event--past'] : []
  },
  eventClick: (info: any) => { tooltip.value.visible = false; emit('eventClick', info) },
  dateClick: (info: any) => emit('dateClick', info),
  eventDrop: (info: any) => emit('eventDrop', info),
  eventResize: (info: any) => emit('eventResize', info),
  eventMouseEnter: (info: any) => {
    if (tooltipTimer) clearTimeout(tooltipTimer)
    const ev = info.event
    const p  = ev.extendedProps
    const je = info.jsEvent as MouseEvent
    tooltipTimer = setTimeout(() => {
      const tipW = 270
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
        location: p.locationText ?? '',
        notes: p.notes ?? '',
        cancelReason: p.cancelReason ?? '',
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
.therapist-calendar {
  height: calc(100vh - 220px);
  min-height: 500px;
}
</style>

<style>
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

.fc-event-inner__status {
  display: inline-flex;
  align-items: center;
  font-size: 0.64rem;
  font-weight: 600;
  line-height: 1;
  border-radius: 3px;
  padding: 1px 5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.22);
  margin-left: 3px;
}

.fc-event-inner__status--scheduled  { background: rgba(255, 255, 255, 0.20); }
.fc-event-inner__status--confirmed  { background: rgba(59,  130, 246, 0.30); }
.fc-event-inner__status--completed  { background: rgba(46,  139, 87,  0.30); }
.fc-event-inner__status--cancelled  { background: rgba(255, 255, 255, 0.18); opacity: 0.85; }
.fc-event-inner__status--no_show    { background: rgba(199, 123, 44,  0.35); }

.fc-event-inner {
  display: flex;
  flex-direction: column;
  padding: 3px 6px 4px;
  overflow: hidden;
  height: 100%;
  gap: 1px;
}

/* ── Row 1: time + profile link ── */
.fc-event-inner__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-shrink: 0;
}

.fc-event-inner__time {
  font-size: 0.6rem;
  opacity: 0.82;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.fc-event-inner__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 10px;
  color: inherit;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.18);
  text-decoration: none;
  line-height: 1;
  transition: opacity 150ms ease, background 150ms ease;
  cursor: pointer;
}

.fc-event-inner__link:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.35);
}

/* ── Row 2: patient name ── */
.fc-event-inner__title {
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  flex-shrink: 0;
}

/* ── Row 3: type badge ── */
.fc-event-inner__meta {
  display: flex;
  align-items: center;
  margin-top: 1px;
}

/* ── Row 4: status badge ── */
.fc-event-inner__status-row {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 2px;
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

/* ── Event hover tooltip ─────────────────────────────────────────────────── */
.cal-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px 14px;
  min-width: 210px;
  max-width: 270px;
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

.cal-tooltip__status--scheduled { color: var(--cal-event-scheduled); font-weight: 500; }
.cal-tooltip__status--confirmed  { color: var(--cal-event-scheduled); font-weight: 500; }
.cal-tooltip__status--completed  { color: var(--cal-event-completed); font-weight: 500; }
.cal-tooltip__status--cancelled  { color: var(--cal-event-cancelled); font-weight: 500; }
.cal-tooltip__status--no_show    { color: #d97706; font-weight: 500; }

.cal-tooltip__notes {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cal-tooltip__cancel {
  color: #C0392B;
}
</style>
