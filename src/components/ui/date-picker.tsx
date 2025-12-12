"use client";

import * as React from "react";
import { Calendar, CalendarClock } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  className,
  error,
  required,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isSelectingRef = React.useRef(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isSelectingRef.current = true;
    onChange(e.target.value);
    // Keep popover open - don't close immediately
    // Reset flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={label} className={error ? "text-red-600" : ""}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover.Root 
        open={isOpen} 
        onOpenChange={(open) => {
          // Don't close if we're in the middle of selecting a date
          if (!open && isSelectingRef.current) {
            return;
          }
          setIsOpen(open);
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <span className={cn(!value && "text-slate-500")}>
              {value
                ? new Date(value).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : placeholder}
            </span>
            <Calendar className="size-4 text-slate-500" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-slate-200 bg-white p-3 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            align="start"
            onInteractOutside={(e) => {
              // Prevent closing when clicking on date input
              if (e.target instanceof HTMLInputElement && e.target.type === 'date') {
                e.preventDefault();
              }
            }}
          >
            <input
              type="date"
              value={value || ""}
              onChange={handleDateChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  placeholder = "Select date and time",
  className,
  error,
  required,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(false);
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return placeholder;
    try {
      const date = new Date(val);
      return date.toLocaleString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return val;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={label} className={error ? "text-red-600" : ""}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <span className={cn(!value && "text-slate-500")}>
              {formatDisplayValue(value)}
            </span>
            <CalendarClock className="size-4 text-slate-500" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-slate-200 bg-white p-3 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            align="start"
          >
            <input
              type="datetime-local"
              value={value || ""}
              onChange={handleDateTimeChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              onClick={(e) => e.stopPropagation()}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

