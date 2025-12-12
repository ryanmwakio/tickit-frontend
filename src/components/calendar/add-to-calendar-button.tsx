"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Download, ExternalLink } from "lucide-react";
import type { EventContent } from "@/data/events";
import {
  generateICSContent,
  generateGoogleCalendarURL,
  generateOutlookCalendarURL,
  downloadICSFile,
} from "@/lib/calendar-export";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AddToCalendarButtonProps = {
  event: EventContent;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCalendarButton({
  event,
  variant = "outline",
  size = "md",
  className = "",
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadICS = () => {
    const icsContent = generateICSContent(event);
    const filename = `${event.slug}-event.ics`;
    downloadICSFile(icsContent, filename);
    setIsOpen(false);
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarURL(event);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarURL(event);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const handleICSFile = () => {
    // For iOS/Samsung/other calendars - they can import .ics files
    handleDownloadICS();
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        >
          <Calendar className={iconSizes[size]} />
          <span>Add to Calendar</span>
          <ChevronDown className={iconSizes[size]} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <ExternalLink className="mr-2 size-4" />
          <span>Google Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
          <ExternalLink className="mr-2 size-4" />
          <span>Outlook Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleICSFile} className="cursor-pointer">
          <Download className="mr-2 size-4" />
          <span>iOS / Samsung Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Download className="mr-2 size-4" />
          <span>Download .ics File</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

