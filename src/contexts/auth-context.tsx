"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

export type UserRole =
  | "ATTENDEE"
  | "ORGANISER"
  | "PROMOTER"
  | "STAFF"
  | "ADMIN";

export interface User {
  id: string;
  email?: string | null;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  roles: string[]; // Array of role names from backend
  activeRole: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  preferredLanguage?: string | null;
  notificationPreferences?: Record<string, unknown> | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    identifier: string,
    password: string,
    twoFactorCode?: string,
  ) => Promise<User | null>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  setActiveRole: (role: UserRole) => Promise<void>;
}

interface SignupData {
  email?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await apiClient.get<User>("/users/me");
      setUser(userData);
      // Initialize WebSocket if authenticated
      if (typeof window !== "undefined") {
        const { getSocket } = await import("@/lib/websocket");
        getSocket();
      }
    } catch (error: any) {
      // 401 is expected when not logged in, don't log it as an error
      if (error?.statusCode !== 401) {
        console.error("Auth check failed:", error);
      }
      setUser(null);
      apiClient.clearTokens();
      // Disconnect WebSocket on logout
      if (typeof window !== "undefined") {
        const { disconnectSocket } = await import("@/lib/websocket");
        disconnectSocket();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    identifier: string,
    password: string,
    twoFactorCode?: string,
  ): Promise<User | null> => {
    try {
      const response = await apiClient.post<{
        tokens: { accessToken: string; refreshToken: string };
        user?: User;
        requiresTwoFactor?: boolean;
      }>("/auth/login", {
        identifier,
        password,
        ...(twoFactorCode && { twoFactorCode }),
      });

      if (response.requiresTwoFactor) {
        throw {
          message: "Two-factor authentication required",
          requiresTwoFactor: true,
        };
      }

      if (response.tokens) {
        apiClient.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken,
        );
        // Initialize WebSocket connection after login
        if (typeof window !== "undefined") {
          const { getSocket } = await import("@/lib/websocket");
          getSocket();
        }
      }

      // Fetch full user from /users/me so roles/activeRole are correct, then set state and return for redirect
      const freshUser = await apiClient.get<User>("/users/me");
      setUser(freshUser);
      return freshUser;
    } catch (error: any) {
      // Improve error message for network errors
      if (error.statusCode === 0 || error.error === "NETWORK_ERROR") {
        throw {
          ...error,
          message:
            error.message ||
            "Cannot connect to server. Please ensure the backend is running on http://localhost:5000",
        };
      }
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await apiClient.post<{
        tokens: { accessToken: string; refreshToken: string };
        user?: User;
      }>("/auth/signup", data);

      if (response.tokens) {
        apiClient.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken,
        );
        // Initialize WebSocket connection after signup
        if (typeof window !== "undefined") {
          const { getSocket } = await import("@/lib/websocket");
          getSocket();
        }
      }

      if (response.user) {
        setUser(response.user);
      } else {
        await refreshUser();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearTokens();
    setUser(null);
    // Clear session monitoring state on explicit logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("tickit_session_state");
      import("@/lib/websocket").then(({ disconnectSocket }) => {
        disconnectSocket();
      });
    }
    router.push("/auth/login");
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<User>("/users/me");
      setUser(userData);
    } catch {
      setUser(null);
      apiClient.clearTokens();
    }
  };

  const setActiveRole = async (role: UserRole) => {
    try {
      await apiClient.patch("/users/me/role", { role });
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role) || user.activeRole === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.some(
      (role) => user.roles.includes(role) || user.activeRole === role,
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
        hasRole,
        hasAnyRole,
        setActiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
