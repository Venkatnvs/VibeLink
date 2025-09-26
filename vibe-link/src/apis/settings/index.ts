import AXIOS_INSTANCE from "../axios";

export interface UserSettings {
  likes_notifications: boolean;
  shares_notifications: boolean;
  matches_notifications: boolean;
  messages_notifications: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  show_location: boolean;
  allow_messages: 'everyone' | 'friends' | 'none';
  show_online_status: boolean;
  location_radius: number;
  min_age: number;
  max_age: number;
  show_distance: boolean;
  theme: 'light' | 'dark' | 'system';
  font_size: 'small' | 'medium' | 'large';
}

// Get user settings
export const getUserSettingsApi = () =>
  AXIOS_INSTANCE.get<UserSettings>('/api/settings/');

// Update user settings
export const updateUserSettingsApi = (settings: Partial<UserSettings>) =>
  AXIOS_INSTANCE.patch<UserSettings>('/api/settings/', settings);
