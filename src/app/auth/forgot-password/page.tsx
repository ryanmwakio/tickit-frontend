"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthButton } from "@/components/auth/auth-button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full">
        {/* Mobile: Add padding for fixed header */}
        <div className="lg:hidden h-16" />
        
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-slate-900/5 lg:bg-white lg:shadow-xl text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Check your email
          </h1>
          <p className="text-slate-600 mb-2">
            We&apos;ve sent a password reset link to
          </p>
          <p className="text-slate-900 font-semibold mb-6">{email}</p>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            If you don&apos;t see the email, check your spam folder or try again.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-300/80"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Add padding for fixed header */}
      <div className="lg:hidden h-16" />
      
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-8 lg:p-10 shadow-2xl shadow-slate-900/5 lg:bg-white lg:shadow-xl">
        <div className="mb-8">
          <Link
            href="/auth/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
          <div>
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-300/50 mb-6">
              <Mail className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Forgot password?
            </h1>
            <p className="text-slate-600">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthFormInput
            id="email"
            label="Email address"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
            required
            autoComplete="email"
            helperText="Enter the email address associated with your account"
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 flex items-start gap-3">
              <svg className="size-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <AuthButton loading={loading} type="submit" className="w-full">
            Send reset link
          </AuthButton>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
