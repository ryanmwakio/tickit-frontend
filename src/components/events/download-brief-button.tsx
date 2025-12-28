"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface DownloadBriefButtonProps {
  eventId: string;
  eventTitle: string;
  className?: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export function DownloadBriefButton({
  eventId,
  eventTitle,
  className = "",
  variant = "secondary",
  fullWidth = false,
}: DownloadBriefButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/brief`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download event brief");
      }

      // Get the filename from the response headers or create a default one
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `${eventTitle.toLowerCase().replace(/\s+/g, "-")}-brief.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading event brief:", error);
      // You could add a toast notification here
      alert("Failed to download event brief. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/20 hover:-translate-y-0.5",
    secondary:
      "border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300",
  };

  const widthStyles = fullWidth ? "w-full" : "w-full sm:w-auto";

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
    >
      <Download className="size-4" />
      {isDownloading ? "Downloading..." : "Download brief"}
    </button>
  );
}
