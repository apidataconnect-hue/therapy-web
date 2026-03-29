import { defineStore } from 'pinia'

export interface Notification {
  message: string
  color?: string
  timeout?: number
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notification: null as Notification | null,
    show: false,
  }),
  actions: {
    notify(notification: Notification) {
      this.notification = notification
      this.show = true
    },
    close() {
      this.show = false
    },
  },
})
