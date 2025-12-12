"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AuthFormCheckbox } from "@/components/auth/auth-form-checkbox";
import { AuthButton } from "@/components/auth/auth-button";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { UserPlus, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [usePhone, setUsePhone] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!usePhone && !formData.email) {
      newErrors.email = "Email is required";
    }
    if (usePhone && !formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signup({
        ...(usePhone ? { phoneNumber: formData.phoneNumber } : { email: formData.email }),
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        termsAccepted: formData.termsAccepted,
      });

      // If phone verification is required, redirect to verification page
      // Note: This would need to be handled differently if signup returns phoneVerification
      // For now, redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setErrors({
        submit: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <UserPlus className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-600">
            Join Tixhub and start creating amazing events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5">
            <button
              type="button"
              onClick={() => setUsePhone(false)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                !usePhone
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="size-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setUsePhone(true)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                usePhone
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone className="size-4" />
              Phone
            </button>
          </div>

          {usePhone ? (
            <AuthFormInput
              id="phoneNumber"
              label="Phone number"
              type="tel"
              placeholder="+254712345678"
              value={formData.phoneNumber}
              onChange={handleChange("phoneNumber")}
              error={errors.phoneNumber}
              required
              autoComplete="tel"
              helperText="Kenyan phone number (E.164 format)"
            />
          ) : (
            <AuthFormInput
              id="email"
              label="Email address"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              required
              autoComplete="email"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <AuthFormInput
              id="firstName"
              label="First name"
              type="text"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              error={errors.firstName}
              required
              autoComplete="given-name"
            />
            <AuthFormInput
              id="lastName"
              label="Last name"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              error={errors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          <AuthFormInput
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            autoComplete="new-password"
            helperText="Minimum 8 characters"
          />

          <AuthFormInput
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <AuthFormCheckbox
            id="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange("termsAccepted")}
            error={errors.termsAccepted}
            label={
              <>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-slate-900 underline hover:text-slate-700"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-slate-900 underline hover:text-slate-700"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </>
            }
          />

          {errors.submit && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-700 flex items-start gap-3">
              <svg className="size-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          <AuthButton loading={loading} type="submit" className="w-full">
            Create account
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
            redirectTo="/"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
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
