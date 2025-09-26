import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { 
  registerApi, 
  loginApi, 
  sendOtpApi, 
  verifyOtpApi, 
  fetchUserApi 
} from '@/apis/auth'
import type { UserProfile, AuthTokens, LoginResponse } from '@/apis/types'

export interface User extends UserProfile {}

export interface AuthState {
  user: User | null
  tokens: {
    access: string | null
    refresh: string | null
  }
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpSent: boolean
  otpVerified: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  isInitialized: false,
}

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: FormData, { rejectWithValue }) => {
    try {
      const response = await registerApi(userData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed')
    }
  }
)

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await sendOtpApi(email)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || 'Failed to send OTP')
    }
  }
)

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await verifyOtpApi(otpData.email, otpData.otp)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || 'OTP verification failed')
    }
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any
      const token = state.auth.tokens.access
      if (!token) {
        throw new Error('No access token')
      }
      const response = await fetchUserApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to get user profile')
    }
  }
)

// Initialize auth state from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, getState }) => {
    const state = getState() as any
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken && refreshToken) {
      // Set tokens in state
      dispatch(setTokens({ access: accessToken, refresh: refreshToken }))
      
      // Try to get user profile
      try {
        await dispatch(getUserProfile()).unwrap()
      } catch (error) {
        // If getting profile fails, clear tokens
        dispatch(logout())
      }
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.tokens = { access: null, refresh: null }
      state.isAuthenticated = false
      state.otpSent = false
      state.otpVerified = false
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.tokens = action.payload
      state.isAuthenticated = true
      // Store tokens in localStorage
      localStorage.setItem('accessToken', action.payload.access)
      localStorage.setItem('refreshToken', action.payload.refresh)
    },
    clearOTPState: (state) => {
      state.otpSent = false
      state.otpVerified = false
    },
    clearOTPSent: (state) => {
      state.otpSent = false
    },
    clearAllOTP: (state) => {
      state.otpSent = false
      state.otpVerified = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isLoading = false
        state.isInitialized = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
        state.isInitialized = true
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        // Clear any previous OTP state
        state.otpSent = false
        state.otpVerified = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        // Store the email from the response for OTP verification
        const payload = action.payload as any
        if (payload && payload.email) {
          // You can store the email in state if needed for OTP verification
          // For now, we'll rely on the navigation state
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Clear OTP state on error
        state.otpSent = false
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle the response structure properly
        const payload = action.payload as any
        console.log('Login response payload:', payload)
        
        if (payload && typeof payload === 'object') {
          if (payload.user && payload.tokens) {
            // Login response with user and tokens
            state.user = payload.user as User
            state.tokens = {
              access: payload.tokens.access || null,
              refresh: payload.tokens.refresh || null
            }
            state.isAuthenticated = true
            state.otpVerified = true
            // Store tokens in localStorage
            if (payload.tokens.access) {
              localStorage.setItem('accessToken', payload.tokens.access)
            }
            if (payload.tokens.refresh) {
              localStorage.setItem('refreshToken', payload.tokens.refresh)
            }
          } else if (payload.access && payload.refresh) {
            // Direct tokens response
            state.tokens = {
              access: payload.access,
              refresh: payload.refresh
            }
            state.isAuthenticated = true
            localStorage.setItem('accessToken', payload.access)
            localStorage.setItem('refreshToken', payload.refresh)
          } else if (payload.tokens && (payload.email || payload.id)) {
            // Backend response structure: user data + tokens object
            state.user = {
              id: payload.id,
              email: payload.email,
              username: payload.username,
              firstName: payload.first_name,
              lastName: payload.last_name,
              fullName: payload.full_name,
              age: payload.age,
              profilePhoto: payload.profile_photo,
              bio: payload.bio,
              city: payload.city,
              state: payload.state,
              latitude: payload.latitude,
              longitude: payload.longitude,
              hashtags: payload.hashtags,
              isActive: payload.is_active,
              isOtpVerified: payload.is_otp_verified,
              isCompleted: payload.is_completed,
              dateJoined: payload.date_joined,
              lastLogin: payload.last_login
            } as User
            state.tokens = {
              access: payload.tokens.access || null,
              refresh: payload.tokens.refresh || null
            }
            state.isAuthenticated = true
            state.otpVerified = payload.is_otp_verified || true
            // Store tokens in localStorage
            if (payload.tokens.access) {
              localStorage.setItem('accessToken', payload.tokens.access)
            }
            if (payload.tokens.refresh) {
              localStorage.setItem('refreshToken', payload.tokens.refresh)
            }
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.isLoading = false
        state.otpSent = true
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false
        state.otpVerified = true
        // Clear OTP sent state to prevent continuous redirects
        state.otpSent = false
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any
        if (payload) {
          state.user = payload as User
          state.isAuthenticated = true
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, logout, setTokens, clearOTPState, clearOTPSent, clearAllOTP } = authSlice.actions
export default authSlice.reducer
