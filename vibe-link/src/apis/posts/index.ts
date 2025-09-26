import AXIOS_INSTANCE from "../axios";
import type { Post, CreatePostData } from "../types";

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get all posts
export const getPostsApi = () =>
  AXIOS_INSTANCE.get<PaginatedResponse<Post>>('/api/posts/');

// Get posts from followers
export const getFollowerPostsApi = () =>
  AXIOS_INSTANCE.get<Post[]>('/api/posts/followers/');

// Get user posts
export const getUserPostsApi = (userId: number) =>
  AXIOS_INSTANCE.get<PaginatedResponse<Post>>(`/api/posts/user/${userId}/`);

// Create post
export const createPostApi = (postData: CreatePostData) => {
  const formData = new FormData();
  formData.append('content', postData.content);
  formData.append('hashtags', JSON.stringify(postData.hashtags));
  
  if (postData.image) {
    formData.append('image', postData.image);
  }

  return AXIOS_INSTANCE.post<Post>('/api/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Like/Unlike post
export const toggleLikeApi = (postId: number) =>
  AXIOS_INSTANCE.post<{ is_liked: boolean; likes_count: number }>(`/api/posts/${postId}/like/`);

// Share/Unshare post
export const toggleShareApi = (postId: number) =>
  AXIOS_INSTANCE.post<{ is_shared: boolean; shares_count: number }>(`/api/posts/${postId}/share/`);

// Delete post
export const deletePostApi = (postId: number) =>
  AXIOS_INSTANCE.delete<void>(`/api/posts/${postId}/`);
