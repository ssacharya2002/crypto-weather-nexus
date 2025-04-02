import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Types
interface UserPreferencesState {
  favoriteCities: string[]
  favoriteCryptos: string[]
}

// Initial state
const initialState: UserPreferencesState = {
  favoriteCities: [],
  favoriteCryptos: [],
}

const userPreferencesSlice = createSlice({
  name: "userPreferences",
  initialState,
  reducers: {
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      const city = action.payload
      const index = state.favoriteCities.indexOf(city)
      if (index === -1) {
        state.favoriteCities.push(city)
      } else {
        state.favoriteCities.splice(index, 1)
      }
    },
    toggleFavoriteCrypto: (state, action: PayloadAction<string>) => {
      const crypto = action.payload
      const index = state.favoriteCryptos.indexOf(crypto)
      if (index === -1) {
        state.favoriteCryptos.push(crypto)
      } else {
        state.favoriteCryptos.splice(index, 1)
      }
    },
  },
})

export const { toggleFavoriteCity, toggleFavoriteCrypto } = userPreferencesSlice.actions
export default userPreferencesSlice.reducer