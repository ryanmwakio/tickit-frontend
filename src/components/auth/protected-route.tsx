"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole, hasAnyRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Store the current path as redirect parameter
        const currentPath = pathname || window.location.pathname;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        // For unauthorized access, try to go back or redirect to home
        if (typeof window !== "undefined") {
          const referrer = document.referrer;
          // Check if we have a referrer from the same origin and it's not the current page
          if (referrer && new URL(referrer).origin === window.location.origin && referrer !== window.location.href) {
            // Try to go back
            router.back();
          } else {
            // Redirect to home
            router.push("/");
          }
        } else {
          router.push("/");
        }
        return;
      }

      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        // For unauthorized access, try to go back or redirect to home
        if (typeof window !== "undefined") {
          const referrer = document.referrer;
          // Check if we have a referrer from the same origin and it's not the current page
          if (referrer && new URL(referrer).origin === window.location.origin && referrer !== window.location.href) {
            // Try to go back
            router.back();
          } else {
            // Redirect to home
            router.push("/");
          }
        } else {
          router.push("/");
        }
        return;
      }
    }
  }, [isAuthenticated, loading, requiredRole, requiredRoles, hasRole, hasAnyRole, router, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

