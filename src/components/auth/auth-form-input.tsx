"use client";

import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AuthFormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({ label, error, helperText, type = "text", className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-2">
        <label
          htmlFor={props.id}
          className="block text-sm font-semibold text-slate-900"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            id={props.id}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-0 ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/50"
                : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"
            } ${className || ""}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

AuthFormInput.displayName = "AuthFormInput";

