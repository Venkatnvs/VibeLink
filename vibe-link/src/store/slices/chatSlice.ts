import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { 
  getConversationsApi, 
  getConversationApi, 
  getMessagesApi, 
  sendMessageApi, 
  startConversationApi, 
  markMessagesReadApi 
} from '@/apis/chat'
import type { Conversation, Message } from '@/apis/types'

export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getConversationsApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch conversations')
    }
  }
)

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await getConversationApi(conversationId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch conversation')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await getMessagesApi(conversationId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }: { conversationId: number; content: string }, { rejectWithValue }) => {
    try {
      const response = await sendMessageApi(conversationId, content)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to send message')
    }
  }
)

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await startConversationApi(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start conversation')
    }
  }
)

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      await markMessagesReadApi(conversationId)
      return conversationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark messages as read')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    addOptimisticMessage: (state, action: PayloadAction<{ content: string; conversationId: number }>) => {
      const now = new Date()
      const tempMessage = {
        id: -Date.now(), // Use negative timestamp as temp ID
        content: action.payload.content,
        sender: {
          id: 0, // Will be replaced when real message comes
          username: 'You',
          full_name: 'You',
          profile_photo: undefined
        },
        is_read: true,
        created_at: now.toISOString(),
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      state.messages.push(tempMessage)
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.conversations[index] = action.payload
      } else {
        state.conversations.unshift(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false
        state.conversations = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch conversation
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        // Preserve optimistic messages when fetching from server
        const optimisticMessages = state.messages.filter(m => m.id < 0 && m.sender.username === 'You')
        const serverMessages = Array.isArray(action.payload.results) ? action.payload.results : []
        state.messages = [...serverMessages, ...optimisticMessages]
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Remove optimistic message and add real one
        state.messages = state.messages.filter(m => !(m.id < 0 && m.sender.username === 'You'))
        state.messages.push(action.payload)
        
        // Update the conversation's last message
        const conversation = state.conversations.find(c => c.id === state.currentConversation?.id)
        if (conversation) {
          conversation.last_message = {
            content: action.payload.content,
            sender: action.payload.sender.username,
            timestamp: action.payload.created_at
          }
          conversation.updated_at = action.payload.created_at
          // Move conversation to top
          state.conversations = state.conversations.filter(c => c.id !== conversation.id)
          state.conversations.unshift(conversation)
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        // Remove optimistic message on error
        state.messages = state.messages.filter(m => !(m.id < 0 && m.sender.username === 'You'))
        state.error = action.payload as string
      })
      
      // Start conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        const conversation = action.payload
        const existingIndex = state.conversations.findIndex(c => c.id === conversation.id)
        if (existingIndex !== -1) {
          state.conversations[existingIndex] = conversation
        } else {
          state.conversations.unshift(conversation)
        }
        state.currentConversation = conversation
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload
        // Mark all messages in current conversation as read
        state.messages.forEach(message => {
          message.is_read = true
        })
        
        // Update conversation unread count
        const conversation = state.conversations.find(c => c.id === conversationId)
        if (conversation) {
          conversation.unread_count = 0
        }
      })
  },
})

export const { clearError, setCurrentConversation, addMessage, addOptimisticMessage, updateConversation } = chatSlice.actions
export default chatSlice.reducer
