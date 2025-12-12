"use client";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export function AuthButton({
  children,
  loading = false,
  variant = "primary",
  fullWidth = true,
  disabled,
  className,
  ...props
}: AuthButtonProps) {
  const baseClasses = "rounded-xl px-6 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-slate-900 text-white shadow-lg shadow-slate-300/80 hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98] transition-transform",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-900",
    outline: "border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-900",
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className || ""}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

