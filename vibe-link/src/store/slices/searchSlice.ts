import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { searchApi } from '@/apis/search'

export interface SearchResult {
  id: number
  type: 'user' | 'post' | 'hashtag'
  title: string
  subtitle?: string
  image?: string
  data: any
}

interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  isOpen: boolean
}

const initialState: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  error: null,
  isOpen: false
}

// Async thunk for searching
export const searchContent = createAsyncThunk(
  'search/searchContent',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        return []
      }
      const response = await searchApi.search(query)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    clearResults: (state) => {
      state.results = []
      state.query = ''
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchContent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        console.log('Search fulfilled:', action.payload)
        console.log('Search results count:', action.payload?.length)
        state.isLoading = false
        state.results = action.payload
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setQuery, setOpen, clearResults, clearError } = searchSlice.actions
export default searchSlice.reducer
