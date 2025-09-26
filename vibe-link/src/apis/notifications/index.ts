import AXIOS_INSTANCE from "../axios";
import type { EmailNotification } from "../types";

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Get email notifications
export const getEmailNotificationsApi = (params?: {
  status?: string;
  type?: string;
  page?: number;
}) =>
  AXIOS_INSTANCE.get<PaginatedResponse<EmailNotification>>('/api/notifications/list/', { params });

// Get single notification
export const getEmailNotificationApi = (notificationId: number) =>
  AXIOS_INSTANCE.get<EmailNotification>(`/api/notifications/${notificationId}/`);

// Mark notification as read
export const markNotificationReadApi = (notificationId: number) =>
  AXIOS_INSTANCE.post<{ status: string; message: string }>(`/api/notifications/${notificationId}/read/`);

// Mark all notifications as read
export const markAllNotificationsReadApi = () =>
  AXIOS_INSTANCE.post<{ status: string; message: string }>('/api/notifications/read-all/');

// Send test notification
export const sendTestNotificationApi = () =>
  AXIOS_INSTANCE.post<{ status: string; message: string; notification_id: number }>('/api/notifications/send-test/');

// Create notification
export const createNotificationApi = (data: {
  notification_type: string;
  subject: string;
  message: string;
  from_user?: number;
  related_object_id?: number;
  related_object_type?: string;
}) =>
  AXIOS_INSTANCE.post<EmailNotification>('/api/notifications/create/', data);
