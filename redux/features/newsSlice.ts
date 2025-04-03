import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types
interface NewsSource {
  id: string | null
  name: string
}

interface NewsArticle {
  source: NewsSource
  author: string | null
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

interface NewsState {
  data: NewsArticle[]
  loading: boolean
  error: string | null
}

// Initial state
const initialState: NewsState = {
  data: [],
  loading: false,
  error: null,
}

// Async thunk to fetch news data
export const fetchNewsData = createAsyncThunk("news/fetchNewsData", async () => {
  try {
    const response = await fetch('/api/news')

    if (!response.ok) {
      throw new Error("Failed to fetch news data")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("News API error:", error)
    throw error
  }
})

// Slice
const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNewsData.fulfilled, (state, action: PayloadAction<NewsArticle[]>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch news data"
      })
  },
})

export default newsSlice.reducer