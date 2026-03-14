import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
          variant === "default" && "border-transparent bg-slate-900 text-white hover:bg-slate-800",
          variant === "secondary" && "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
          variant === "outline" && "border-slate-200 bg-white text-slate-900 hover:bg-slate-100",
          variant === "destructive" && "border-transparent bg-red-600 text-white hover:bg-red-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };