import api from './api';
import type { LoginResponse, User, ApiResponse } from '@/types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  return response.data.data;
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', { name, email, password });
  return response.data.data;
}

export async function googleLogin(googleToken: string): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/google', { token: googleToken });
  return response.data.data;
}

export async function refreshToken(token: string): Promise<{ token: string; refreshToken: string }> {
  const response = await api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken: token });
  return response.data.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  return response.data.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword });
  return response.data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/change-password', { currentPassword, newPassword });
  return response.data.data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
  return response.data.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/auth/profile');
  return response.data.data;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.put<ApiResponse<User>>('/auth/profile', data);
  return response.data.data;
}
