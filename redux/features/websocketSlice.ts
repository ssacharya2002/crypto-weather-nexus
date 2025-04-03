import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { AppDispatch } from "../store"
import { updateCryptoPrice } from "./cryptoSlice"
import { addNotification } from "./notificationsSlice"

// Types
interface WebSocketState {
  connected: boolean
  error: string | null
  assets: string[]
  reconnectAttempts: number
  lastReconnectTime: number | null
}

// Constants
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 5000 // 5 seconds
const API_KEY = process.env.NEXT_PUBLIC_COINCAP_API_KEY

// WebSocket instance reference
let wsInstance: WebSocket | null = null
let reconnectTimeout: NodeJS.Timeout | null = null
let weatherAlertInterval: NodeJS.Timeout | null = null

// Initial state
const initialState: WebSocketState = {
  connected: false,
  error: null,
  assets: ["bitcoin", "ethereum", "solana"],
  reconnectAttempts: 0,
  lastReconnectTime: null
}

const createWebSocketUrl = (assets: string[]) => {
  return `wss://ws.coincap.io/prices?assets=${assets.join(',')}`
}

// Helper function to handle WebSocket cleanup
const cleanupWebSocket = () => {
  if (wsInstance) {
    wsInstance.close()
    wsInstance = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (weatherAlertInterval) {
    clearInterval(weatherAlertInterval)
    weatherAlertInterval = null
  }
}

export const addAsset = createAsyncThunk<void, string, { dispatch: AppDispatch, state: { websocket: WebSocketState } }>(
  "websocket/addAsset",
  async (asset, { dispatch, getState }) => {
    const { assets } = getState().websocket
    
    if (!assets.includes(asset.toLowerCase())) {
      dispatch(setAssets([...assets, asset.toLowerCase()]))
      
      // Reconnect with updated assets if already connected
      if (wsInstance?.readyState === WebSocket.OPEN) {
        cleanupWebSocket()
        dispatch(setupWebSocket())
      }
    }
  }
)

export const setupWebSocket = createAsyncThunk<void, void, { dispatch: AppDispatch, state: { websocket: WebSocketState } }>(
  "websocket/setupWebSocket",
  async (_, { dispatch, getState }) => {
    try {
      const { assets, reconnectAttempts } = getState().websocket
      
      // Clean up existing connection
      cleanupWebSocket()
      
      // Check if we've exceeded max reconnection attempts
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        dispatch(setError("Maximum reconnection attempts reached. Please refresh the page."))
        return
      }
      
      console.log("Setting up WebSocket connection...")
      
      // Create new WebSocket connection
      wsInstance = new WebSocket(createWebSocketUrl(assets))
      
      wsInstance.onopen = () => {
        console.log("WebSocket connection established")
        if (API_KEY) {
          wsInstance?.send(JSON.stringify({ apiKey: API_KEY }))
        }
        dispatch(setConnected(true))
        dispatch(resetReconnectAttempts())

        // Start weather alerts when connection is established
        //simulated weather alerts 
        weatherAlertInterval = setInterval(() => {
          if (Math.random() > 0.7) {
            // 30% chance of weather alert
            const cities = ["New York", "London", "Tokyo"]
            const city = cities[Math.floor(Math.random() * cities.length)]
            const alerts = [
              "Heavy rain expected",
              "High winds warning",
              "Extreme heat alert",
              "Thunderstorm warning",
              "Flash flood warning",
            ]
            const alert = alerts[Math.floor(Math.random() * alerts.length)]

            dispatch(
              addNotification({
                type: "weather_alert",
                title: `Weather Alert: ${city}`,
                message: `${alert} in ${city}. Take necessary precautions.`,
              })
            )
          }
        }, 1500)
      }
      
      wsInstance.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Process price updates
          Object.entries(data).forEach(([cryptoId, price]) => {
            const newPrice = parseFloat(price as string)
            if (!isNaN(newPrice)) {
              dispatch(updateCryptoPrice({ id: cryptoId, price: newPrice }))
              //simulated price alerts 
              if (Math.random() > 0.85) { // Reduce frequency of notifications
                const percentChange = (Math.random() * 5) - 2.5; // Random change between -2.5% and +2.5%
                const direction = percentChange > 0 ? "up" : "down";
                const changePercent = Math.abs(percentChange);
                
                if (changePercent > 1) {
                  dispatch(
                    addNotification({
                      type: "price_alert",
                      title: `${cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)} price ${direction}!`,
                      message: `${cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)} price has moved ${direction} by ${changePercent.toFixed(2)}% to $${newPrice.toFixed(2)}`,
                    })
                  );
                }
              }
            }
          })

          
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
          dispatch(setError("Error processing price update"))
        }
      }
      
      wsInstance.onerror = (error) => {
        console.error("WebSocket error:", error)
        dispatch(setError("WebSocket connection error"))
        dispatch(incrementReconnectAttempts())
      }
      
      wsInstance.onclose = (event) => {
        console.log("WebSocket connection closed", event)
        dispatch(setConnected(false))
        
        // Auto-reconnect after delay if not a clean close
        if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeout = setTimeout(() => {
            dispatch(setupWebSocket())
          }, RECONNECT_DELAY)
        }
      }
    } catch (error) {
      console.error("WebSocket setup error:", error)
      dispatch(setError("Failed to set up WebSocket connection"))
      dispatch(incrementReconnectAttempts())
    }
  }
)

export const closeWebSocket = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  "websocket/closeWebSocket",
  async (_, { dispatch }) => {
    cleanupWebSocket()
    dispatch(setConnected(false))
    dispatch(resetReconnectAttempts())
  }
)

// Slice
const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setError: (state, action) => {
      state.connected = false
      state.error = action.payload
    },
    setAssets: (state, action) => {
      state.assets = action.payload
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1
      state.lastReconnectTime = Date.now()
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0
      state.lastReconnectTime = null
    }
  },
})

export const { 
  setConnected, 
  setError, 
  setAssets,
  incrementReconnectAttempts,
  resetReconnectAttempts
} = websocketSlice.actions

export default websocketSlice.reducer