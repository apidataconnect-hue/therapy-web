import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    auth: ComponentProps<typeof import("/Users/miguel/dev/projects/web/therapy-web/app/layouts/auth.vue").default>
    default: ComponentProps<typeof import("/Users/miguel/dev/projects/web/therapy-web/app/layouts/default.vue").default>
    landing: ComponentProps<typeof import("/Users/miguel/dev/projects/web/therapy-web/app/layouts/landing.vue").default>
    patient: ComponentProps<typeof import("/Users/miguel/dev/projects/web/therapy-web/app/layouts/patient.vue").default>
  }
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false> | {
      [K in LayoutKey]: {
        name?: MaybeRef<K | false> | ComputedRef<K | false>
        props?: NuxtLayouts[K]
      }
    }[LayoutKey]
  }
}