import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserSettingsApi, updateUserSettingsApi } from '@/apis/settings'

export interface SettingsState {
  notifications: {
    likes: boolean
    shares: boolean
    messages: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showLocation: boolean
    allowMessages: 'everyone' | 'friends' | 'none'
  }
  matchmaking: {
    locationRadius: number
    ageRange: { min: number; max: number }
    showDistance: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: 'small' | 'medium' | 'large'
  }
  isLoading: boolean
  error: string | null
}

const initialState: SettingsState = {
  notifications: {
    likes: true,
    shares: true,
    messages: true
  },
  privacy: {
    profileVisibility: 'public',
    showLocation: true,
    allowMessages: 'friends'
  },
  matchmaking: {
    locationRadius: 50,
    ageRange: { min: 18, max: 65 },
    showDistance: true
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium'
  },
  isLoading: false,
  error: null
}

// Load settings from API
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserSettingsApi()
      const apiSettings = response.data
      
      // Convert API settings to our state format
      const convertedSettings = {
        notifications: {
          likes: apiSettings.likes_notifications,
          shares: apiSettings.shares_notifications,
          messages: apiSettings.messages_notifications
        },
        privacy: {
          profileVisibility: apiSettings.profile_visibility,
          showLocation: apiSettings.show_location,
          allowMessages: apiSettings.allow_messages
        },
        matchmaking: {
          locationRadius: apiSettings.location_radius,
          ageRange: { min: apiSettings.min_age, max: apiSettings.max_age },
          showDistance: apiSettings.show_distance
        },
        appearance: {
          theme: apiSettings.theme,
          fontSize: apiSettings.font_size
        }
      }
      
      // Apply theme and font size to DOM immediately
      if (convertedSettings.appearance.theme) {
        applyThemeToDOM(convertedSettings.appearance.theme)
      }
      if (convertedSettings.appearance.fontSize) {
        applyFontSizeToDOM(convertedSettings.appearance.fontSize)
      }
      
      return convertedSettings
    } catch (error: any) {
      // Fallback to localStorage if API fails
      try {
        const savedSettings = localStorage.getItem('vibeLink-settings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          const mergedSettings = { ...initialState, ...parsed }
          
          // Apply theme and font size to DOM immediately
          if (mergedSettings.appearance.theme) {
            applyThemeToDOM(mergedSettings.appearance.theme)
          }
          if (mergedSettings.appearance.fontSize) {
            applyFontSizeToDOM(mergedSettings.appearance.fontSize)
          }
          
          return mergedSettings
        }
      } catch (localError) {
        // Ignore localStorage errors
      }
      return rejectWithValue('Failed to load settings')
    }
  }
)

// Helper function to apply theme to DOM
const applyThemeToDOM = (theme: 'light' | 'dark' | 'system') => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else if (theme === 'light') {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  } else {
    // System theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }
}

// Helper function to apply font size to DOM
const applyFontSizeToDOM = (fontSize: 'small' | 'medium' | 'large') => {
  const root = document.documentElement
  root.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
}

// Save settings to API
export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: SettingsState, { rejectWithValue }) => {
    try {
      // Convert our state format to API format
      const apiSettings = {
        likes_notifications: settings.notifications.likes,
        shares_notifications: settings.notifications.shares,
        messages_notifications: settings.notifications.messages,
        profile_visibility: settings.privacy.profileVisibility,
        show_location: settings.privacy.showLocation,
        allow_messages: settings.privacy.allowMessages,
        location_radius: settings.matchmaking.locationRadius,
        min_age: settings.matchmaking.ageRange.min,
        max_age: settings.matchmaking.ageRange.max,
        show_distance: settings.matchmaking.showDistance,
        theme: settings.appearance.theme,
        font_size: settings.appearance.fontSize
      }
      
      const response = await updateUserSettingsApi(apiSettings)
      const apiSettingsResponse = response.data
      
      // Convert API response back to our state format
      const convertedSettings = {
        notifications: {
          likes: apiSettingsResponse.likes_notifications,
          shares: apiSettingsResponse.shares_notifications,
          messages: apiSettingsResponse.messages_notifications
        },
        privacy: {
          profileVisibility: apiSettingsResponse.profile_visibility,
          showLocation: apiSettingsResponse.show_location,
          allowMessages: apiSettingsResponse.allow_messages
        },
        matchmaking: {
          locationRadius: apiSettingsResponse.location_radius,
          ageRange: { min: apiSettingsResponse.min_age, max: apiSettingsResponse.max_age },
          showDistance: apiSettingsResponse.show_distance
        },
        appearance: {
          theme: apiSettingsResponse.theme,
          fontSize: apiSettingsResponse.font_size
        }
      }
      
      // Also save to localStorage as backup
      try {
        const { isLoading, error, ...settingsToSave } = settings
        localStorage.setItem('vibeLink-settings', JSON.stringify(settingsToSave))
      } catch (localError) {
        // Ignore localStorage errors
      }
      
      return convertedSettings
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to save settings')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSetting: (state, action: { payload: { key: string; value: boolean } }) => {
      const { key, value } = action.payload
      state.notifications[key as keyof typeof state.notifications] = value
    },
    updatePrivacySetting: (state, action: { payload: { key: string; value: string | boolean } }) => {
      const { key, value } = action.payload
      ;(state.privacy as any)[key] = value
    },
    updateMatchmakingSetting: (state, action: { payload: { key: string; value: number | boolean | { min: number; max: number } } }) => {
      const { key, value } = action.payload
      ;(state.matchmaking as any)[key] = value
    },
    updateAppearanceSetting: (state, action: { payload: { key: string; value: string } }) => {
      const { key, value } = action.payload
      ;(state.appearance as any)[key] = value
    },
    applyTheme: (state, action: { payload: 'light' | 'dark' | 'system' }) => {
      const theme = action.payload
      state.appearance.theme = theme
      applyThemeToDOM(theme)
    },
    applyFontSize: (state, action: { payload: 'small' | 'medium' | 'large' }) => {
      const fontSize = action.payload
      state.appearance.fontSize = fontSize
      applyFontSizeToDOM(fontSize)
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false
        // Merge loaded settings with current state
        if (action.payload) {
          state.notifications = action.payload.notifications || state.notifications
          state.privacy = action.payload.privacy || state.privacy
          state.matchmaking = action.payload.matchmaking || state.matchmaking
          state.appearance = action.payload.appearance || state.appearance
        }
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(saveSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(saveSettings.fulfilled, (state) => {
        state.isLoading = false
        // Settings are already in state, no need to merge
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  updateNotificationSetting,
  updatePrivacySetting,
  updateMatchmakingSetting,
  updateAppearanceSetting,
  applyTheme,
  applyFontSize,
  clearError
} = settingsSlice.actions

export default settingsSlice.reducer
