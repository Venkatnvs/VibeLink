import AXIOS_INSTANCE from "../axios";
import type {
  LoginCredentials,
  UserProfile,
  AuthTokens
} from "../types";

// Register user with all profile fields
export const registerApi = (formData: FormData) =>
  AXIOS_INSTANCE.post<{ data: any }>('/api/auth/register/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Login user
export const loginApi = (credentials: LoginCredentials) =>
  AXIOS_INSTANCE.post<any>('/api/auth/login/', credentials);

// Refresh token
export const refreshTokenApi = (refreshToken: string) =>
  AXIOS_INSTANCE.post<{ data: AuthTokens }>('/api/auth/token/refresh/', { refresh: refreshToken });

// Get user profile
export const fetchUserApi = () =>
  AXIOS_INSTANCE.get<UserProfile>('/api/auth/user/');

// Update user profile
export const updateUserApi = (formData: FormData) =>
  AXIOS_INSTANCE.patch<UserProfile>('/api/auth/user/update/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Send OTP
export const sendOtpApi = (email: string) =>
  AXIOS_INSTANCE.post<{ data: any }>('/api/auth/send-otp/', { email: email });

// Verify OTP
export const verifyOtpApi = (email: string, otp: string) =>
  AXIOS_INSTANCE.post<{ data: any }>('/api/auth/verify-otp/', { email: email, otp: otp });
