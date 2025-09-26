import AXIOS_INSTANCE from "../axios";
import type { AIRecommendation, DiscoverUser, Notification } from "../types";

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Discover users
export const discoverUsersApi = (params?: {
  search?: string;
  radius?: number;
  min_age?: number;
  max_age?: number;
}) =>
  AXIOS_INSTANCE.get<PaginatedResponse<DiscoverUser>>('/api/social/discover/', { params });

// Toggle follow/unfollow
export const toggleFollowApi = (userId: number) =>
  AXIOS_INSTANCE.post<{ is_following: boolean; followers_count: number }>(`/api/social/follow/${userId}/`);

// Get user followers
export const getFollowersApi = (userId: number) =>
  AXIOS_INSTANCE.get<PaginatedResponse<DiscoverUser>>(`/api/social/followers/${userId}/`);

// Get user following
export const getFollowingApi = (userId: number) =>
  AXIOS_INSTANCE.get<PaginatedResponse<DiscoverUser>>(`/api/social/following/${userId}/`);

// Get notifications
export const getNotificationsApi = () =>
  AXIOS_INSTANCE.get<PaginatedResponse<Notification>>('/api/social/notifications/');

// Mark notification as read
export const markNotificationReadApi = (notificationId: number) =>
  AXIOS_INSTANCE.post<{ status: string }>(`/api/social/notifications/${notificationId}/read/`);

// Mark all notifications as read
export const markAllNotificationsReadApi = () =>
  AXIOS_INSTANCE.post<{ status: string }>('/api/social/notifications/read-all/');

// Delete notification
export const deleteNotificationApi = (notificationId: number) =>
  AXIOS_INSTANCE.delete<{ status: string }>(`/api/social/notifications/${notificationId}/delete/`);

// Delete all notifications
export const deleteAllNotificationsApi = () =>
  AXIOS_INSTANCE.delete<{ status: string }>('/api/social/notifications/delete-all/');

// Get top matches
export const getTopMatchesApi = () =>
  AXIOS_INSTANCE.get<DiscoverUser[]>('/api/social/top-matches/');

// Get AI recommendations with pagination
export const getAIRecommendationsApi = (page: number = 1, per_page: number = 8) =>
  AXIOS_INSTANCE.get<{
    recommendations: AIRecommendation[];
    pagination: {
      page: number;
      per_page: number;
      total_matches: number;
      next_page_available: boolean;
      total_pages: number;
    };
  }>('/api/social/ai-recommendations/', { 
    params: { page, per_page } 
  });

// Get user profile by ID
export const getUserProfileApi = (userId: number) =>
  AXIOS_INSTANCE.get<DiscoverUser>(`/api/social/user/${userId}/`);