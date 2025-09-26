import AXIOS_INSTANCE from "../axios";
import type { Conversation, Message } from "../types";

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get all conversations
export const getConversationsApi = () =>
  AXIOS_INSTANCE.get<PaginatedResponse<Conversation>>('/api/chat/conversations/');

// Get conversation details
export const getConversationApi = (conversationId: number) =>
  AXIOS_INSTANCE.get<Conversation>(`/api/chat/conversations/${conversationId}/`);

// Get messages for a conversation
export const getMessagesApi = (conversationId: number) =>
  AXIOS_INSTANCE.get<PaginatedResponse<Message>>(`/api/chat/conversations/${conversationId}/messages/`);

// Get messages by full pagination URL (for next/previous links)
export const getMessagesByUrlApi = (url: string) =>
  AXIOS_INSTANCE.get<PaginatedResponse<Message>>(url);

// Send a message
export const sendMessageApi = (conversationId: number, content: string) =>
  AXIOS_INSTANCE.post<Message>(`/api/chat/conversations/${conversationId}/messages/`, {
    content
  });

// Start a new conversation
export const startConversationApi = (userId: number) =>
  AXIOS_INSTANCE.post<Conversation>(`/api/chat/conversations/start/${userId}/`);

// Mark messages as read
export const markMessagesReadApi = (conversationId: number) =>
  AXIOS_INSTANCE.post<{ status: string }>(`/api/chat/conversations/${conversationId}/read/`);
