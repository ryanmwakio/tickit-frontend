"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    twoFactorCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const user = await login(formData.identifier, formData.password, formData.twoFactorCode || undefined);

      if (user) {
        // Redirect: respect ?redirect= param, or send admins to /admin, others to /
        const explicitRedirect = searchParams.get("redirect");
        const isAdmin = user.roles?.includes("ADMIN") || user.activeRole === "ADMIN";
        const redirectTo = explicitRedirect ?? (isAdmin ? "/admin" : "/");
        router.push(redirectTo);
        router.refresh();
      }
    } catch (error: any) {
      if (error.requiresTwoFactor) {
        setShowTwoFactor(true);
        setErrors({ twoFactorCode: error.message || "Please enter your 2FA code" });
      } else {
        setErrors({
          submit: error.message || "Invalid email/phone or password",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="w-full">
      {/* Mobile: Add padding for fixed header */}
      <div className="lg:hidden h-16" />
      
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-slate-900/5 lg:bg-white lg:shadow-xl">
        <div className="mb-8">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-300/50 mb-6">
            <LogIn className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600">
            Sign in to continue to your Tickit account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthFormInput
            id="identifier"
            label="Email or phone number"
            type="text"
            placeholder="user@example.com or +254712345678"
            value={formData.identifier}
            onChange={handleChange("identifier")}
            error={errors.identifier}
            required
            autoComplete="username"
          />

          <div>
            <AuthFormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange("password")}
              error={errors.password}
              required
              autoComplete="current-password"
            />
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {showTwoFactor && (
            <AuthFormInput
              id="twoFactorCode"
              label="Two-factor authentication code"
              type="text"
              placeholder="000000"
              value={formData.twoFactorCode}
              onChange={handleChange("twoFactorCode")}
              error={errors.twoFactorCode}
              required
              autoComplete="one-time-code"
              maxLength={6}
            />
          )}

          {errors.submit && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 flex items-start gap-3">
              <svg className="size-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          <AuthButton loading={loading} type="submit" className="w-full">
            Sign in
          </AuthButton>
        </form>

        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-500">Or continue with</span>
            </div>
          </div>

          <SocialLoginButtons
            onError={(error) => setErrors({ submit: error })}
            redirectTo={searchParams.get("redirect") || "/"}
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full">
        <div className="lg:hidden h-16" />
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-slate-900/5 lg:bg-white lg:shadow-xl animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-3/4 mb-6" />
          <div className="h-4 bg-slate-100 rounded w-full mb-4" />
          <div className="h-12 bg-slate-100 rounded w-full mb-4" />
          <div className="h-12 bg-slate-100 rounded w-full" />
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
