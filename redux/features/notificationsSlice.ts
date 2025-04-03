import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Types
export interface Notification {
  id: string
  type: "price_alert" | "weather_alert"
  title: string
  message: string
  timestamp: number
  read: boolean
}

interface NotificationsState {
  notifications: Notification[]
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
}

// Slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, "id" | "timestamp" | "read">>) => {
      const { type, title, message } = action.payload
      state.notifications.unshift({
        id: Date.now().toString(),
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      })

      // Keep only the last 20 notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true
      })
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const { addNotification, markAllAsRead, clearNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer

