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

const cities = ["New York", "London", "Tokyo"]

// Async thunk to fetch weather data for multiple cities
export const fetchWeatherData = createAsyncThunk("weather/fetchWeatherData", async () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!apiKey) throw new Error("OpenWeather API key not found")

  try {
    const responses = await Promise.all(
      cities.map((city) =>
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch weather for ${city}`)
          }
          return res.json()
        }),
      ),
    )

    // Transform the API response to data format
    return responses.map((data) => ({
      name: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      conditions: data.weather[0].main,
      windSpeed: data.wind.speed,
    }))
  } catch (error) {
    console.error("Weather API error:", error)
    throw error
  }
})

// Async thunk to fetch current weather and historical data for a specific city
export const fetchCityWeatherHistory = createAsyncThunk("weather/fetchCityWeatherHistory", async (city: string) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!apiKey) throw new Error("OpenWeather API key not found")

  try {
    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
    )

    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current weather for ${city}`)
    }

    const currentData = await currentResponse.json()
    const currentCity = {
      name: currentData.name,
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      conditions: currentData.weather[0].main,
      windSpeed: currentData.wind.speed,
    }

    // Get coordinates 
    const lat = currentData.coord.lat
    const lon = currentData.coord.lon

    try {
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`
      )
      
      if (!oneCallResponse.ok) {
        throw new Error(`Failed to fetch historical weather for ${city}`)
      }
      
      const oneCallData = await oneCallResponse.json()
      
      // Formatting data from the One Call API
      const history = oneCallData.daily.slice(0, 7).map((day: any) => ({
        date: new Date(day.dt * 1000).toLocaleDateString(),
        temperature: Math.round(day.temp.day),
        humidity: day.humidity,
        conditions: day.weather[0].main,
      }))

      return { currentCity, history }
    } catch (oneCallError) {
      console.error("One Call API error:", oneCallError)
      
      // OpenWeather One Call API requires a paid subscription plan, so using the free 5-day forecast API as an alternative
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      )
      
      if (!forecastResponse.ok) {
        throw new Error(`Failed to fetch forecast for ${city}`)
      }
      
      const forecastData = await forecastResponse.json()
      
      // Get one data point per day 
      const uniqueDays = new Map()
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString()
        if (!uniqueDays.has(date)) {
          uniqueDays.set(date, {
            date,
            temperature: Math.round(item.main.temp),
            humidity: item.main.humidity,
            conditions: item.weather[0].main,
          })
        }
      })
      
      const history = Array.from(uniqueDays.values())
      
      return { currentCity, history }
    }
  } catch (error) {
    console.error("Weather history API error:", error)
    throw error
  }
})


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