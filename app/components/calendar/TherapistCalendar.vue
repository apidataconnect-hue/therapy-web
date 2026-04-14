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
  showWeekends: { type: Boolean, default: false },
})

const emit = defineEmits(['eventClick', 'dateClick', 'eventDrop', 'eventResize', 'patientNavigate', 'sessionNavigate', 'toggleWeekends'])
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

  // Profile link — next to patient name
  const profileLink = h('a', {
    class: 'fc-event-inner__link',
    title: 'Ver paciente',
    onClick: (e: MouseEvent) => {
      e.stopPropagation()
      emit('patientNavigate', apptId)
    },
  }, h('i', { class: 'mdi mdi-account-circle-outline fc-event-inner__link-icon' }))

  // Session note link — next to time
  const sessionLink = h('a', {
    class: 'fc-event-inner__link fc-event-inner__link--info',
    title: 'Ver nota de sesión',
    onClick: (e: MouseEvent) => {
      e.stopPropagation()
      emit('sessionNavigate', apptId)
    },
  }, h('i', { class: 'mdi mdi-arrow-top-right fc-event-inner__link-icon' }))

  // Type icon only (no text)
  const typeIconEl = svgPath
    ? h('svg', {
        viewBox: '0 0 24 24',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'currentColor',
        width: '10',
        height: '10',
        class: 'fc-event-inner__type-icon',
      }, [h('path', { d: svgPath })])
    : null

  // Status badge
  const statusBadge = status
    ? h('span', { class: `fc-event-inner__status fc-event-inner__status--${status}` }, STATUS_LABELS[status] ?? status)
    : null

  return h('div', { class: ['fc-event-inner', cancelled ? 'fc-event-inner--cancelled' : ''] }, [
    // Row 1: time + session note link
    h('div', { class: 'fc-event-inner__header' }, [
      h('span', { class: 'fc-event-inner__time' }, timeText),
      sessionLink,
    ]),
    // Row 2: patient name + profile link
    h('div', { class: 'fc-event-inner__title-row' }, [
      h('span', { class: 'fc-event-inner__title' }, title),
      profileLink,
    ]),
    // Row 3: appointment type
    typeLabel ? h('div', { class: 'fc-event-inner__type-row' }, [
      h('span', { class: 'fc-event-inner__type-label' }, typeLabel),
    ]) : null,
    // Row 4: status (footer)
    h('div', { class: 'fc-event-inner__footer' }, [
      statusBadge,
    ]),
  ])
}

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: 'es',
  timeZone: 'local',
  initialView: props.initialView,
  // Concurrent events in the timeGrid must NEVER visually overlap: each event
  // is placed in its own sub-column. FullCalendar's built-in overlap engine
  // detects collision clusters, assigns column indices, and computes left/width
  // percentages for each event automatically.
  slotEventOverlap: false,
  customButtons: {
    toggleWeekends: {
      text: props.showWeekends ? 'Ocultar finde' : 'Mostrar finde',
      click: () => emit('toggleWeekends'),
    },
  },
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'toggleWeekends dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
  },
  slotDuration: '00:15:00',
  slotLabelInterval: '00:30:00',
  slotMinTime: '07:00:00',
  slotMaxTime: '23:00:00',
  height: '100%',
  expandRows: false,
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as any,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as any,
  nowIndicator: true,
  allDaySlot: false,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '08:00',
    endTime: '20:00',
  },
  weekends: props.showWeekends,
  firstDay: 1,
  events: props.events,
  editable: props.editable,
  selectable: true,
  eventContent: renderEventContent,
  dayHeaderContent: (arg: any) => {
    const d       = arg.date
    const dayAbbr = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase()
    const dayNum  = String(d.getDate())
    return h('div', { class: ['cw-day-header', arg.isToday ? 'cw-day-header--today' : ''] }, [
      h('span', { class: 'cw-day-header__wday' }, dayAbbr),
      h('span', { class: 'cw-day-header__num' },  dayNum),
    ])
  },
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

watch(() => props.showWeekends, (val) => {
  const api = calendarRef.value?.getApi()
  if (api) {
    api.setOption('weekends', val)
    const el = calendarRef.value?.$el as HTMLElement | undefined
    const btn = el?.querySelector('.fc-toggleWeekends-button') as HTMLButtonElement | null
    if (btn) btn.textContent = val ? 'Ocultar finde' : 'Mostrar finde'
  }
})
</script>

<style scoped>
.calendar-wrap {
  height: 100%;
}
.therapist-calendar {
  height: 100%;
}
</style>

<style>
/* ══════════════════════════════════════════════════════════════════════════════
   TherapistCalendar — global event & tooltip styles
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Day header — Google Calendar inspired split layout ── */
.cw-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  text-decoration: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 140ms ease;
}

.cw-day-header:not(.cw-day-header--today):hover .cw-day-header__num {
  background: #F0EAF9;
}

.cw-day-header__wday {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #9588A8;
  line-height: 1;
}

.cw-day-header__num {
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1;
  color: #5A4E70;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  letter-spacing: -0.02em;
  transition: background 140ms ease, color 140ms ease;
}

.cw-day-header--today .cw-day-header__wday {
  color: #5B2A86;
  font-weight: 800;
}

.cw-day-header--today .cw-day-header__num {
  background: #5B2A86;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(91, 42, 134, 0.3);
}

.fc-timegrid-slot-minor {
  border-top-style: dashed !important;
}

/* Align time label text to the grid line */
.fc-timegrid-slot-label {
  vertical-align: top !important;
}

.fc-timegrid-slot-label-cushion {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  transform: translateY(-100%);
  display: inline-block;
}

.fc-toggleWeekends-button {
  margin-right: 12px !important;
}

/* Make event cards snap to grid lines */
.fc-timegrid-event {
  margin-bottom: 0 !important;
}
.fc-event-main {
  padding: 0 !important;
}

/* ── Event card base ── */
.fc-timegrid-event .fc-event-main,
.fc-timegrid-event {
  border: none !important;
  box-shadow: none !important;
}

.fc-timegrid-event {
  opacity: 0.95;
  border-radius: 8px !important;
}

.fc-event--past {
  opacity: 0.42 !important;
  filter: grayscale(28%) !important;
}

.fc-event-inner--cancelled .fc-event-inner__title {
  text-decoration: line-through;
  opacity: 0.7;
}

/* ── Event inner layout ── */
.fc-event-inner {
  display: flex;
  flex-direction: column;
  padding: 5px 8px 6px;
  overflow: hidden;
  height: 100%;
  gap: 1px;
  border-left: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 0 8px 8px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

/* ── Row 1: time + session link ── */
.fc-event-inner__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
}

.fc-event-inner__time {
  font-size: 0.675rem;
  opacity: 0.76;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.02em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ── Action links ── */
.fc-event-inner__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: inherit;
  opacity: 0;
  background: rgba(255, 255, 255, 0.15);
  text-decoration: none;
  line-height: 1;
  transition: opacity 180ms ease, background 180ms ease;
  cursor: pointer;
}

.fc-event-inner:hover .fc-event-inner__link {
  opacity: 0.75;
}

.fc-event-inner__link-icon {
  font-size: 16px;
  line-height: 1;
}

.fc-event-inner__link:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.35);
}

.fc-event-inner__link--info {
  font-style: normal;
}

/* ── Row 2: patient name + profile link ── */
.fc-event-inner__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
}

.fc-event-inner__title {
  font-size: 0.83rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.28;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.015em;
}

/* ── Row 3: appointment type label ── */
.fc-event-inner__type-row {
  flex-shrink: 0;
  overflow: hidden;
}

/* Hide non-essential rows when the card is too narrow to be useful.
   FullCalendar assigns inline width; we use container-relative sizes
   to collapse the type row in tight spaces. */
.fc-event-inner__type-label {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.80;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.4;
}

/* ── Row 4: footer — status ── */
.fc-event-inner__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: auto;
  padding-top: 3px;
}

.fc-event-inner__type-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

/* ── Status badges ── */
.fc-event-inner__status {
  display: inline-flex;
  align-items: center;
  font-size: 0.575rem;
  font-weight: 600;
  line-height: 1;
  border-radius: 100px;
  padding: 2px 7px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.18);
}

.fc-event-inner__status--scheduled  { background: rgba(255, 255, 255, 0.18); }
.fc-event-inner__status--confirmed  { background: rgba(59,  130, 246, 0.30); }
.fc-event-inner__status--completed  { background: rgba(46,  139, 87,  0.30); }
.fc-event-inner__status--cancelled  { background: rgba(255, 255, 255, 0.10); opacity: 0.60; }
.fc-event-inner__status--no_show    { background: rgba(199, 123, 44,  0.30); }

.fc-event-inner__cancelled {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6rem;
  font-weight: 600;
  opacity: 0.85;
  line-height: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 2px 5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Tooltip
   ══════════════════════════════════════════════════════════════════════════════ */

.cal-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10), 0 1px 6px rgba(0, 0, 0, 0.04);
  padding: 14px 16px;
  min-width: 220px;
  max-width: 280px;
  font-size: 13px;
  color: #1c1c2e;
  line-height: 1.45;
  backdrop-filter: blur(8px);
}

.cal-tooltip__name {
  font-weight: 700;
  font-size: 14px;
  color: #1c1c2e;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.cal-tooltip__sep {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin: 8px 0;
}

.cal-tooltip__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  line-height: 1.7;
}

.cal-tooltip__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  flex-shrink: 0;
}

.cal-tooltip__val {
  font-size: 12.5px;
  color: #374151;
  text-align: right;
  font-weight: 500;
}

.cal-tooltip__status--scheduled { color: #5B2A86; font-weight: 600; }
.cal-tooltip__status--confirmed  { color: #5B2A86; font-weight: 600; }
.cal-tooltip__status--completed  { color: #166534; font-weight: 600; }
.cal-tooltip__status--cancelled  { color: #9588A8; font-weight: 600; }
.cal-tooltip__status--no_show    { color: #d97706; font-weight: 600; }

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
