import { configureStore } from "@reduxjs/toolkit"
import weatherReducer from "./features/weatherSlice"
import cryptoReducer from "./features/cryptoSlice"
import userPreferencesReducer from "./features/userPreferencesSlice"
import websocketReducer from "./features/websocketSlice"

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    userPreferences: userPreferencesReducer,
      websocket: websocketReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch