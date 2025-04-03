import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
interface WeatherCity {
  name: string
  temperature: number
  humidity: number
  conditions: string
  windSpeed: number
}

interface WeatherHistoryEntry {
  date: string
  temperature: number
  humidity: number
  conditions: string
}

interface WeatherState {
  data: WeatherCity[]
  currentCity: WeatherCity | null
  cityHistory: WeatherHistoryEntry[]
  loading: boolean
  error: string | null
}

// Initial state
const initialState: WeatherState = {
  data: [],
  currentCity: null,
  cityHistory: [],
  loading: true,
  error: null,
}

// Async thunk to fetch weather data for multiple cities
export const fetchWeatherData = createAsyncThunk("weather/fetchWeatherData", async () => {
  try {
    const response = await fetch('/api/weather?action=all')
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch weather data')
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Weather API error:", error)
    throw error
  }
})

// Async thunk to fetch current weather and historical data for a specific city
export const fetchCityWeatherHistory = createAsyncThunk(
  "weather/fetchCityWeatherHistory", 
  async (city: string) => {
    try {
      const response = await fetch(`/api/weather?action=city&city=${encodeURIComponent(city)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch weather for ${city}`)
      }
      
      const data = await response.json()
      return { 
        currentCity: data.currentCity, 
        history: data.history 
      }
    } catch (error) {
      console.error("Weather history API error:", error)
      throw error
    }
  }
)

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearWeatherError: (state) => {
      state.error = null
    },
    clearCurrentCity: (state) => {
      state.currentCity = null
      state.cityHistory = []
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWeatherData states
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWeatherData.fulfilled, (state, action: PayloadAction<WeatherCity[]>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch weather data"
      })
      
      // fetchCityWeatherHistory states
      .addCase(fetchCityWeatherHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCityWeatherHistory.fulfilled, (state, action) => {
        state.loading = false
        state.currentCity = action.payload.currentCity
        state.cityHistory = action.payload.history
      })
      .addCase(fetchCityWeatherHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch city weather history"
      })
  },
})

// Export actions and reducer
export const { clearWeatherError, clearCurrentCity } = weatherSlice.actions
export default weatherSlice.reducer