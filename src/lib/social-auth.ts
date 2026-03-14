import { apiClient } from './api';
import { User } from '@/contexts/auth-context';

export interface SocialLoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshTokenExpiresIn: number;
  };
  user: User;
}

/**
 * Handle Google OAuth login (sends ID token to backend for verification).
 * Use the credential from Google Sign-In (e.g. @react-oauth/google).
 */
export async function handleGoogleLogin(
  idToken: string
): Promise<SocialLoginResponse> {
  try {
    const response = await apiClient.post<SocialLoginResponse>('/auth/google', {
      idToken,
    });

    return response;
  } catch (error: any) {
    throw {
      message: error.message || 'Google login failed',
      statusCode: error.statusCode || 500,
    };
  }
}

/**
 * Handle Facebook OAuth login
 */
export async function handleFacebookLogin(
  accessToken: string
): Promise<SocialLoginResponse> {
  try {
    const response = await apiClient.post<SocialLoginResponse>('/auth/social', {
      provider: 'facebook',
      accessToken,
    });

    return response;
  } catch (error: any) {
    throw {
      message: error.message || 'Facebook login failed',
      statusCode: error.statusCode || 500,
    };
  }
}

