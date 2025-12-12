import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex w-full gap-6 px-6 pb-24 pt-6 sm:gap-8 sm:px-8 sm:pt-10 lg:gap-10 lg:px-14 lg:pb-16 lg:pt-10">
        <div className="hidden lg:block sticky top-0 h-[calc(100vh-2.5rem)] min-h-[600px] w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 w-full min-w-0 overflow-x-auto">
          <div className="mx-auto w-full max-w-7xl space-y-10">{children}</div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

