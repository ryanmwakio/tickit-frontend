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
 * Handle Google OAuth login
 */
export async function handleGoogleLogin(
  credential: string
): Promise<SocialLoginResponse> {
  try {
    const response = await apiClient.post<SocialLoginResponse>('/auth/social', {
      provider: 'google',
      accessToken: '', // Google uses idToken instead
      idToken: credential,
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

