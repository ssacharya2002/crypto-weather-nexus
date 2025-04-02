import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
interface CryptoCurrency {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_24h: number
  price_change_percentage_24h: number
  circulating_supply: number
  total_supply: number | null
  ath: number
  ath_date: string
  price_change_percentage_7d_in_currency?: number
}

interface CryptoState {
  data: CryptoCurrency[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
  retryCount: number
}

// Constants
const API_URL = "https://api.coingecko.com/api/v3"
const RATE_LIMIT_DELAY = 500
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// Initial state
const initialState: CryptoState = {
  data: [],
  loading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0
}

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return "An unknown error occurred"
}

// Helper function to validate crypto data
const validateCryptoData = (data: unknown): data is CryptoCurrency[] => {
  if (!Array.isArray(data)) return false
  return data.every(item => 
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.symbol === 'string' &&
    typeof item.image === 'string' &&
    typeof item.current_price === 'number' &&
    typeof item.market_cap === 'number' &&
    typeof item.market_cap_rank === 'number' &&
    typeof item.total_volume === 'number' &&
    typeof item.price_change_24h === 'number' &&
    typeof item.price_change_percentage_24h === 'number' &&
    typeof item.circulating_supply === 'number' &&
    (item.total_supply === null || typeof item.total_supply === 'number') &&
    typeof item.ath === 'number' &&
    typeof item.ath_date === 'string'
  )
}

// Async thunks
export const fetchCryptoData = createAsyncThunk(
  "crypto/fetchCryptoData",
  async (_, { rejectWithValue }) => {
    try {
      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY))

      const response = await fetch(
        `${API_URL}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("API rate limit reached. Please try again later.")
        }
        throw new Error(`Failed to fetch cryptocurrency data: ${response.status}`)
      }

      const data = await response.json()
      
      // Validate the response data
      if (!validateCryptoData(data)) {
        throw new Error("Invalid cryptocurrency data received")
      }

      return data
    } catch (error) {
      console.error("Crypto API error:", error)
      return rejectWithValue(handleApiError(error))
    }
  }
)

// Slice
const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updateCryptoPrice: (state, action: PayloadAction<{ id: string; price: number }>) => {
      const { id, price } = action.payload
      const crypto = state.data.find((c) => c.id === id)
      if (crypto) {
        const oldPrice = crypto.current_price
        crypto.current_price = price
        crypto.price_change_24h = price - oldPrice
        crypto.price_change_percentage_24h = ((price - oldPrice) / oldPrice) * 100
      }
    },
    clearError: (state) => {
      state.error = null
      state.retryCount = 0
    },
    incrementRetryCount: (state) => {
      state.retryCount += 1
    },
    resetRetryCount: (state) => {
      state.retryCount = 0
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCryptoData.fulfilled, (state, action: PayloadAction<CryptoCurrency[]>) => {
        state.loading = false
        state.data = action.payload
        state.lastUpdated = Date.now()
        state.retryCount = 0
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || "Failed to fetch cryptocurrency data"
        state.retryCount += 1
      })
  },
})

export const { 
  updateCryptoPrice, 
  clearError,
  incrementRetryCount,
  resetRetryCount
} = cryptoSlice.actions

export default cryptoSlice.reducer
