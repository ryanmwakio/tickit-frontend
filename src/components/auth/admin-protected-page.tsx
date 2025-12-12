"use client";

import { ProtectedRoute } from "./protected-route";

interface AdminProtectedPageProps {
  children: React.ReactNode;
}

export function AdminProtectedPage({ children }: AdminProtectedPageProps) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}

