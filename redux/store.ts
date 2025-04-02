import { configureStore } from "@reduxjs/toolkit"
import weatherReducer from "./features/weatherSlice"
import userPreferencesReducer from "./features/userPreferencesSlice"

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    userPreferences: userPreferencesReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch