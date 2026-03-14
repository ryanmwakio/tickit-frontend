"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { handleGoogleLogin, handleFacebookLogin } from "@/lib/social-auth";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

// Facebook SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface SocialLoginButtonsProps {
  onError?: (error: string) => void;
  redirectTo?: string;
}

export function SocialLoginButtons({ onError, redirectTo = "/" }: SocialLoginButtonsProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  // Initialize Facebook SDK
  useEffect(() => {
    if (!facebookAppId) return;

    // Load Facebook SDK script
    if (document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    (function(d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    })(document, 'script', 'facebook-jssdk');
  }, [facebookAppId]);

  const handleGoogleSuccess = async (response: any) => {
    if (!response.credential) {
      onError?.("Google login failed: No credential received");
      return;
    }

    setLoading("google");
    try {
      const result = await handleGoogleLogin(response.credential);
      
      // Store tokens
      apiClient.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      
      // Refresh user data
      await refreshUser();
      
      // Redirect
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      onError?.(error.message || "Google login failed");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleError = () => {
    onError?.("Google login was cancelled or failed");
  };

  const handleFacebookClick = () => {
    if (!window.FB) {
      onError?.("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    setLoading("facebook");
    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            const result = await handleFacebookLogin(response.authResponse.accessToken);
            
            // Store tokens
            apiClient.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
            
            // Refresh user data
            await refreshUser();
            
            // Redirect
            router.push(redirectTo);
            router.refresh();
          } catch (error: any) {
            onError?.(error.message || "Facebook login failed");
          } finally {
            setLoading(null);
          }
        } else {
          onError?.("Facebook login was cancelled");
          setLoading(null);
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  const hasAnyProvider = !!googleClientId || !!facebookAppId;

  return (
    <div className="space-y-3">
      {hasAnyProvider ? (
        <div className={`grid gap-3 ${googleClientId && facebookAppId ? "grid-cols-2" : "grid-cols-1"}`}>
          {googleClientId && (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          )}

          {facebookAppId && (
        <button
          type="button"
          onClick={handleFacebookClick}
          disabled={loading === "facebook" || !window.FB}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {loading === "facebook" ? "Signing in..." : "Sign in with Facebook"}
        </button>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in .env.local to enable Sign in with Google.
        </p>
      )}
    </div>
  );
}

