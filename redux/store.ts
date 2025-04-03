import { configureStore } from "@reduxjs/toolkit"
import weatherReducer from "./features/weatherSlice"
import cryptoReducer from "./features/cryptoSlice"
import newsReducer from "./features/newsSlice"
import userPreferencesReducer from "./features/userPreferencesSlice"
import websocketReducer from "./features/websocketSlice"
import notificationsReducer from "./features/notificationsSlice"

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer,
    userPreferences: userPreferencesReducer,
    websocket: websocketReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch