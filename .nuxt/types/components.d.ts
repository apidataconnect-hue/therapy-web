
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  HelloWorld: typeof import("../../app/components/HelloWorld.vue")['default']
  BaseActionBar: typeof import("../../app/components/base/ActionBar.vue")['default']
  BaseDialog: typeof import("../../app/components/base/BaseDialog.vue")['default']
  BaseCalendarEventChip: typeof import("../../app/components/base/CalendarEventChip.vue")['default']
  BaseDataTableWrapper: typeof import("../../app/components/base/DataTableWrapper.vue")['default']
  BaseEmptyState: typeof import("../../app/components/base/EmptyState.vue")['default']
  BaseFormSection: typeof import("../../app/components/base/FormSection.vue")['default']
  BaseNotificationSnackbar: typeof import("../../app/components/base/NotificationSnackbar.vue")['default']
  BasePageHeader: typeof import("../../app/components/base/PageHeader.vue")['default']
  BaseSectionCard: typeof import("../../app/components/base/SectionCard.vue")['default']
  BaseStatsCard: typeof import("../../app/components/base/StatsCard.vue")['default']
  BaseStatusChip: typeof import("../../app/components/base/StatusChip.vue")['default']
  BaseTagManager: typeof import("../../app/components/base/TagManager.vue")['default']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  CalendarPatientCalendar: typeof import("../../app/components/calendar/PatientCalendar.vue")['default']
  CalendarTherapistCalendar: typeof import("../../app/components/calendar/TherapistCalendar.vue")['default']
  NotificationsNotificationBar: typeof import("../../app/components/notifications/NotificationBar.vue")['default']
  SessionPlanSection: typeof import("../../app/components/session/SessionPlanSection.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyHelloWorld: LazyComponent<typeof import("../../app/components/HelloWorld.vue")['default']>
  LazyBaseActionBar: LazyComponent<typeof import("../../app/components/base/ActionBar.vue")['default']>
  LazyBaseDialog: LazyComponent<typeof import("../../app/components/base/BaseDialog.vue")['default']>
  LazyBaseCalendarEventChip: LazyComponent<typeof import("../../app/components/base/CalendarEventChip.vue")['default']>
  LazyBaseDataTableWrapper: LazyComponent<typeof import("../../app/components/base/DataTableWrapper.vue")['default']>
  LazyBaseEmptyState: LazyComponent<typeof import("../../app/components/base/EmptyState.vue")['default']>
  LazyBaseFormSection: LazyComponent<typeof import("../../app/components/base/FormSection.vue")['default']>
  LazyBaseNotificationSnackbar: LazyComponent<typeof import("../../app/components/base/NotificationSnackbar.vue")['default']>
  LazyBasePageHeader: LazyComponent<typeof import("../../app/components/base/PageHeader.vue")['default']>
  LazyBaseSectionCard: LazyComponent<typeof import("../../app/components/base/SectionCard.vue")['default']>
  LazyBaseStatsCard: LazyComponent<typeof import("../../app/components/base/StatsCard.vue")['default']>
  LazyBaseStatusChip: LazyComponent<typeof import("../../app/components/base/StatusChip.vue")['default']>
  LazyBaseTagManager: LazyComponent<typeof import("../../app/components/base/TagManager.vue")['default']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyCalendarPatientCalendar: LazyComponent<typeof import("../../app/components/calendar/PatientCalendar.vue")['default']>
  LazyCalendarTherapistCalendar: LazyComponent<typeof import("../../app/components/calendar/TherapistCalendar.vue")['default']>
  LazyNotificationsNotificationBar: LazyComponent<typeof import("../../app/components/notifications/NotificationBar.vue")['default']>
  LazySessionPlanSection: LazyComponent<typeof import("../../app/components/session/SessionPlanSection.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
