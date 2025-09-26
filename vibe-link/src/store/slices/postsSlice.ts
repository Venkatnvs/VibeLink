import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  getPostsApi, 
  getFollowerPostsApi,
  getUserPostsApi, 
  createPostApi, 
  toggleLikeApi, 
  toggleShareApi, 
  deletePostApi 
} from '@/apis/posts'
import type { Post, CreatePostData } from '@/apis/types'
import { toggleFollow } from './socialSlice'

export interface PostsState {
  posts: Post[]
  followerPosts: Post[]
  userPosts: Post[]
  isLoading: boolean
  error: string | null
}

const initialState: PostsState = {
  posts: [],
  followerPosts: [],
  userPosts: [],
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPostsApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch posts')
    }
  }
)

export const fetchFollowerPosts = createAsyncThunk(
  'posts/fetchFollowerPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFollowerPostsApi()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch follower posts')
    }
  }
)

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getUserPostsApi(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user posts')
    }
  }
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const response = await createPostApi(postData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create post')
    }
  }
)

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await toggleLikeApi(postId)
      return { postId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to toggle like')
    }
  }
)

export const toggleShare = createAsyncThunk(
  'posts/toggleShare',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await toggleShareApi(postId)
      return { postId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to toggle share')
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: number, { rejectWithValue }) => {
    try {
      await deletePostApi(postId)
      return postId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete post')
    }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch follower posts
      .addCase(fetchFollowerPosts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFollowerPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.followerPosts = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchFollowerPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.userPosts = Array.isArray(action.payload.results) ? action.payload.results : []
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false
        // Only add the post if it has a valid user object
        if (action.payload && action.payload.user) {
          state.posts.unshift(action.payload)
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, is_liked, likes_count } = action.payload
        const post = state.posts.find(p => p.id === postId)
        if (post) {
          post.is_liked = is_liked
          post.likes_count = likes_count
        }
        const userPost = state.userPosts.find(p => p.id === postId)
        if (userPost) {
          userPost.is_liked = is_liked
          userPost.likes_count = likes_count
        }
        const followerPost = state.followerPosts.find(p => p.id === postId)
        if (followerPost) {
          followerPost.is_liked = is_liked
          followerPost.likes_count = likes_count
        }
      })
      
      // Toggle share
      .addCase(toggleShare.fulfilled, (state, action) => {
        const { postId, is_shared, shares_count } = action.payload
        const post = state.posts.find(p => p.id === postId)
        if (post) {
          post.is_shared = is_shared
          post.shares_count = shares_count
        }
        const userPost = state.userPosts.find(p => p.id === postId)
        if (userPost) {
          userPost.is_shared = is_shared
          userPost.shares_count = shares_count
        }
        const followerPost = state.followerPosts.find(p => p.id === postId)
        if (followerPost) {
          followerPost.is_shared = is_shared
          followerPost.shares_count = shares_count
        }
      })
      
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload
        state.posts = state.posts.filter(p => p.id !== postId)
        state.userPosts = state.userPosts.filter(p => p.id !== postId)
        state.followerPosts = state.followerPosts.filter(p => p.id !== postId)
      })
      
      // Update follow status in posts when follow action is successful
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { userId, is_following } = action.payload
        
        // Update follow status in all posts
        const updateFollowStatus = (posts: Post[]) => {
          posts.forEach(post => {
            if (post.user && post.user.id === userId) {
              post.user.is_following = is_following
            }
          })
        }
        
        updateFollowStatus(state.posts)
        updateFollowStatus(state.userPosts)
        updateFollowStatus(state.followerPosts)
      })
  },
})

export const { clearError } = postsSlice.actions
export default postsSlice.reducer
