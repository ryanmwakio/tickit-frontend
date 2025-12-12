# Social Login Setup Guide

This guide explains how to set up Google and Facebook OAuth for the TixHub application.

## Backend Setup

The backend already has social login endpoints implemented at `/api/v1/auth/social`. No additional backend configuration is needed.

## Frontend Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - Your production domain
8. Copy the Client ID

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product
4. Go to Settings → Basic
5. Add authorized domains:
   - `localhost`
   - Your production domain
6. Go to Facebook Login → Settings
7. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - Your production domain
8. Copy the App ID

### 3. Environment Variables

Add to `tixhub-frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here
```

### 4. Testing

1. Start the frontend: `npm run dev`
2. Go to `/auth/login` or `/auth/signup`
3. Click "Sign in with Google" or "Sign in with Facebook"
4. Complete the OAuth flow
5. You should be logged in and redirected

## How It Works

### Google Login Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authorizes the application
4. Google returns an ID token
5. Frontend sends ID token to backend `/auth/social`
6. Backend verifies token with Google
7. Backend creates/finds user and returns JWT tokens
8. Frontend stores tokens and redirects user

### Facebook Login Flow

1. User clicks "Sign in with Facebook"
2. Facebook OAuth popup opens
3. User authorizes the application
4. Facebook returns an access token
5. Frontend sends access token to backend `/auth/social`
6. Backend verifies token with Facebook Graph API
7. Backend creates/finds user and returns JWT tokens
8. Frontend stores tokens and redirects user

## Troubleshooting

### Google Login Issues

- **"Invalid client"**: Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is correct
- **"Redirect URI mismatch"**: Ensure redirect URI in Google Console matches your app URL
- **"Popup blocked"**: Allow popups for your domain

### Facebook Login Issues

- **"Invalid App ID"**: Check that `NEXT_PUBLIC_FACEBOOK_APP_ID` is correct
- **"Redirect URI mismatch"**: Ensure redirect URI in Facebook App settings matches your app URL
- **"App not in development mode"**: Add test users in Facebook App settings

### General Issues

- **Buttons not showing**: Check that environment variables are set and app is restarted
- **Login fails**: Check browser console and backend logs for errors
- **User not created**: Check backend logs for social login service errors

## Security Notes

- Never commit OAuth credentials to version control
- Use different OAuth apps for development and production
- Regularly rotate OAuth credentials
- Monitor OAuth usage in provider dashboards
- Implement rate limiting on social login endpoints

