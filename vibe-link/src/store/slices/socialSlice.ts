import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { 
  discoverUsersApi, 
  toggleFollowApi, 
  getFollowersApi, 
  getFollowingApi, 
  getNotificationsApi, 
  markNotificationReadApi, 
  markAllNotificationsReadApi,
  deleteNotificationApi,
  deleteAllNotificationsApi,
  getTopMatchesApi,
  getAIRecommendationsApi,
  getUserProfileApi
} from '@/apis/social'
import type { DiscoverUser, Notification, AIRecommendation } from '@/apis/types'

export interface SocialState {
  discoverUsers: DiscoverUser[]
  topMatches: DiscoverUser[]
  aiRecommendations: AIRecommendation[]
  followers: DiscoverUser[]
  following: DiscoverUser[]
  notifications: Notification[]
  notificationsUnreadCount?: number
  followLoadingIds: number[]
  currentUserProfile: DiscoverUser | null
  aiPagination: {
    page: number
    per_page: number
    total_matches: number
    next_page_available: boolean
    total_pages: number
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: SocialState = {
  discoverUsers: [],
  topMatches: [],
  aiRecommendations: [],
  followers: [],
  following: [],
  notifications: [],
  notificationsUnreadCount: 0,
  followLoadingIds: [],
  currentUserProfile: null,
  aiPagination: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const discoverUsers = createAsyncThunk(
  'social/discoverUsers',
  async (params: { search?: string; radius?: number; min_age?: number; max_age?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await discoverUsersApi(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to discover users')
    }
  }
)

export const fetchTopMatches = createAsyncThunk(
  'social/fetchTopMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTopMatchesApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch top matches')
    }
  }
)

export const fetchAIRecommendations = createAsyncThunk(
  'social/fetchAIRecommendations',
  async (params: { page?: number; per_page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getAIRecommendationsApi(params.page, params.per_page)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch AI recommendations')
    }
  }
)

export const toggleFollow = createAsyncThunk(
  'social/toggleFollow',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await toggleFollowApi(userId)
      return { userId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to toggle follow')
    }
  }
)

export const fetchFollowers = createAsyncThunk(
  'social/fetchFollowers',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getFollowersApi(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch followers')
    }
  }
)

export const fetchFollowing = createAsyncThunk(
  'social/fetchFollowing',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getFollowingApi(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch following')
    }
  }
)

export const fetchNotifications = createAsyncThunk(
  'social/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotificationsApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'social/markNotificationAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await markNotificationReadApi(notificationId)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'social/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsReadApi()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark all notifications as read')
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'social/deleteNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(notificationId)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete notification')
    }
  }
)

export const deleteAllNotifications = createAsyncThunk(
  'social/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await deleteAllNotificationsApi()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete all notifications')
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'social/fetchUserProfile',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getUserProfileApi(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile')
    }
  }
)

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Discover users
      .addCase(discoverUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(discoverUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.discoverUsers = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(discoverUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch top matches
      .addCase(fetchTopMatches.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTopMatches.fulfilled, (state, action) => {
        state.isLoading = false
        state.topMatches = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchTopMatches.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch AI recommendations
      .addCase(fetchAIRecommendations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAIRecommendations.fulfilled, (state, action) => {
        state.isLoading = false
        // Filter out followed users defensively before storing
        const filtered = (action.payload.recommendations || []).filter((u: any) => !u.is_following)
        state.aiRecommendations = filtered
        state.aiPagination = action.payload.pagination
      })
      .addCase(fetchAIRecommendations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Toggle follow
      .addCase(toggleFollow.pending, (state, action) => {
        const userId = action.meta.arg as number
        if (!state.followLoadingIds.includes(userId)) {
          state.followLoadingIds.push(userId)
        }
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { userId, is_following } = action.payload
        // clear loading id
        state.followLoadingIds = state.followLoadingIds.filter(id => id !== userId)

        const user = state.discoverUsers.find(u => u.id === userId)
        if (user) {
          user.is_following = is_following
        }
        const topMatch = state.topMatches.find(u => u.id === userId)
        if (topMatch) {
          topMatch.is_following = is_following
        }
        const aiRecommendation = state.aiRecommendations.find(u => u.id === userId)
        if (aiRecommendation) {
          aiRecommendation.is_following = is_following
        }

        // if followed, remove from lists so they no longer show
        if (is_following) {
          state.discoverUsers = state.discoverUsers.filter(u => u.id !== userId)
          state.topMatches = state.topMatches.filter(u => u.id !== userId)
          state.aiRecommendations = state.aiRecommendations.filter(u => u.id !== userId)
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        const userId = action.meta.arg as number
        state.followLoadingIds = state.followLoadingIds.filter(id => id !== userId)
        state.error = action.payload as string
      })
      
      // Fetch followers
      .addCase(fetchFollowers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isLoading = false
        state.followers = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch following
      .addCase(fetchFollowing.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isLoading = false
        state.following = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = Array.isArray(action.payload.results) ? action.payload.results : []
        state.notificationsUnreadCount = state.notifications.filter(n => !n.is_read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload
        const notification = state.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
        }
        state.notificationsUnreadCount = state.notifications.filter(n => !n.is_read).length
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.is_read = true
        })
        state.notificationsUnreadCount = 0
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload
        state.notifications = state.notifications.filter(n => n.id !== notificationId)
        state.notificationsUnreadCount = state.notifications.filter(n => !n.is_read).length
      })

      // Delete all notifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = []
        state.notificationsUnreadCount = 0
      })
      
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUserProfile = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, addNotification } = socialSlice.actions
export default socialSlice.reducer
