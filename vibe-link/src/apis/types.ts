// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  errors?: Record<string, any>
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  age: string
  profilePhoto: File
  city: string
  state: string
  latitude: string
  longitude: string
  bio: string
  hashtags: string[]
}

export interface OtpData {
  email: string
  otp: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  age?: number
  profile_photo?: string
  bio?: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  hashtags: string[]
  is_active: boolean
  is_otp_verified: boolean
  is_completed: boolean
  date_joined: string
  last_login?: string
  followers_count: number
  following_count: number
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  user: UserProfile
  tokens: AuthTokens
}

// Post Types
export interface Post {
  id: number
  user: PostUser
  content: string
  image?: string
  hashtags: string[]
  likes_count: number
  shares_count: number
  created_at: string
  updated_at: string
  is_liked: boolean
  is_shared: boolean
  timestamp: string
}

export interface PostUser {
  id: number
  username: string
  full_name: string
  profile_photo?: string
  is_following?: boolean
}

export interface CreatePostData {
  content: string
  image?: File
  hashtags: string[]
}

// Chat Types
export interface Conversation {
  id: number
  participants: PostUser[]
  last_message?: {
    content: string
    sender: string
    timestamp: string
  }
  unread_count: number
  other_participant?: PostUser
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  sender: PostUser
  content: string
  is_read: boolean
  created_at: string
  timestamp: string
}

// Social Types
export interface DiscoverUser {
  id: number
  username: string
  full_name: string
  profile_photo?: string
  bio?: string
  age?: number
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  hashtags: string[]
  is_following: boolean
  match_percentage: number
  distance: number
  followers_count: number
  following_count: number
  posts_count: number
  date_joined?: string
  created_at?: string
  // Privacy
  profile_visibility?: 'public' | 'private'
  is_private?: boolean
  can_view_private?: boolean
  // Relationship
  follows_you?: boolean
  is_mutual_follow?: boolean
}

export interface AIRecommendation extends DiscoverUser {
  compatibility_reasons: string[]
  conversation_starters: string[]
  shared_interests: string[]
}

export interface Notification {
  id: number
  from_user: string
  notification_type: 'like' | 'share' | 'follow' | 'message' | 'match'
  content: string
  is_read: boolean
  created_at: string
  timestamp: string
}

// Email Notification Types
export interface EmailNotification {
  id: number
  notification_type: 'like' | 'share' | 'follow' | 'message' | 'comment' | 'match' | 'welcome' | 'system'
  subject: string
  message: string
  from_user_name?: string
  related_object_id?: number
  related_object_type?: string
  status: 'pending' | 'sent' | 'failed' | 'delivered'
  sent_at?: string
  delivered_at?: string
  created_at: string
  timestamp: string
}