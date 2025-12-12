"use client";

import { forwardRef } from "react";

interface AuthFormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const AuthFormCheckbox = forwardRef<
  HTMLInputElement,
  AuthFormCheckboxProps
>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          className={`mt-1 size-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer transition ${
            error ? "border-red-300" : ""
          } ${className || ""}`}
          {...props}
        />
        <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

AuthFormCheckbox.displayName = "AuthFormCheckbox";

