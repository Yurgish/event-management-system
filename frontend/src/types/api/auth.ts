import type { components } from '@/types/generated/api-schema';

export type RegisterRequest = components['schemas']['RegisterDto'];
export type LoginRequest = components['schemas']['LoginDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];
export type LogoutResponse = components['schemas']['LogoutResponseDto'];
