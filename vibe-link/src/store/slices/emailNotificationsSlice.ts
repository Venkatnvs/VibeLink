import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { 
  getEmailNotificationsApi, 
  getEmailNotificationApi,
  markNotificationReadApi, 
  markAllNotificationsReadApi,
  sendTestNotificationApi,
  createNotificationApi
} from '@/apis/notifications'
import type { EmailNotification } from '@/apis/types'

export interface EmailNotificationsState {
  notifications: EmailNotification[]
  currentNotification: EmailNotification | null
  isLoading: boolean
  error: string | null
  unreadCount: number
}

const initialState: EmailNotificationsState = {
  notifications: [],
  currentNotification: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
}

// Async thunks
export const fetchEmailNotifications = createAsyncThunk(
  'emailNotifications/fetchEmailNotifications',
  async (params: { status?: string; type?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getEmailNotificationsApi(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch email notifications')
    }
  }
)

export const fetchEmailNotification = createAsyncThunk(
  'emailNotifications/fetchEmailNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await getEmailNotificationApi(notificationId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch email notification')
    }
  }
)

export const markEmailNotificationAsRead = createAsyncThunk(
  'emailNotifications/markEmailNotificationAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await markNotificationReadApi(notificationId)
      return { notificationId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark notification as read')
    }
  }
)

export const markAllEmailNotificationsAsRead = createAsyncThunk(
  'emailNotifications/markAllEmailNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await markAllNotificationsReadApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark all notifications as read')
    }
  }
)

export const sendTestEmailNotification = createAsyncThunk(
  'emailNotifications/sendTestEmailNotification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sendTestNotificationApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to send test notification')
    }
  }
)

export const createEmailNotification = createAsyncThunk(
  'emailNotifications/createEmailNotification',
  async (data: {
    notification_type: string;
    subject: string;
    message: string;
    from_user?: number;
    related_object_id?: number;
    related_object_type?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await createNotificationApi(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create notification')
    }
  }
)

const emailNotificationsSlice = createSlice({
  name: 'emailNotifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentNotification: (state, action: PayloadAction<EmailNotification | null>) => {
      state.currentNotification = action.payload
    },
    addNotification: (state, action: PayloadAction<EmailNotification>) => {
      state.notifications.unshift(action.payload)
      if (action.payload.status === 'pending' || action.payload.status === 'sent') {
        state.unreadCount += 1
      }
    },
    updateNotification: (state, action: PayloadAction<EmailNotification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        state.notifications[index] = action.payload
      }
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(n => 
        n.status === 'pending' || n.status === 'sent'
      ).length
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch email notifications
      .addCase(fetchEmailNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEmailNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = Array.isArray(action.payload.results) ? action.payload.results : []
        state.unreadCount = state.notifications.filter(n => 
          n.status === 'pending' || n.status === 'sent'
        ).length
      })
      .addCase(fetchEmailNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch single email notification
      .addCase(fetchEmailNotification.fulfilled, (state, action) => {
        state.currentNotification = action.payload
      })
      
      // Mark email notification as read
      .addCase(markEmailNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload
        const notification = state.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.status = 'delivered'
          notification.delivered_at = new Date().toISOString()
        }
        state.unreadCount = state.notifications.filter(n => 
          n.status === 'pending' || n.status === 'sent'
        ).length
      })
      
      // Mark all email notifications as read
      .addCase(markAllEmailNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (notification.status === 'pending' || notification.status === 'sent') {
            notification.status = 'delivered'
            notification.delivered_at = new Date().toISOString()
          }
        })
        state.unreadCount = 0
      })
      
      // Send test email notification
      .addCase(sendTestEmailNotification.fulfilled, (state, action) => {
        // Test notification sent successfully
        state.error = null
      })
      
      // Create email notification
      .addCase(createEmailNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload)
        if (action.payload.status === 'pending' || action.payload.status === 'sent') {
          state.unreadCount += 1
        }
      })
  },
})

export const { 
  clearError, 
  setCurrentNotification, 
  addNotification, 
  updateNotification, 
  updateUnreadCount 
} = emailNotificationsSlice.actions
export default emailNotificationsSlice.reducer
