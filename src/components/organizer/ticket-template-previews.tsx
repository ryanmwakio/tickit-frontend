"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Hash,
  Tag,
  CreditCard,
  Star,
  Music,
  Trophy,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface TicketTemplatePreviewProps {
  templateId: string;
  eventData?: {
    title?: string;
    startDate?: string;
    startTime?: string;
    location?: string;
    price?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
}

const TemplatePreview: React.FC<{
  templateId: string;
  eventData?: any;
  className?: string;
}> = ({ templateId, eventData, className = "" }) => {
  const defaultData = {
    eventTitle: eventData?.title || "Amazing Event",
    eventDate: eventData?.startDate
      ? new Date(eventData.startDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "January 15, 2024",
    eventTime: eventData?.startTime || "7:00 PM",
    venue: eventData?.location || "Event Venue",
    price: eventData?.price || "KES 2,500",
    ticketNumber: "TIX-2024-001234",
  };

  const renderQRCode = () => (
    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center">
      <div className="grid grid-cols-6 gap-px">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-sm ${
              Math.random() > 0.5 ? "bg-current opacity-80" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );

  switch (templateId) {
    case "professional":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-600 px-4 py-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tracking-wider">
                  ADMIT ONE
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-blue-500 rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-slate-800">
                    {defaultData.eventDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-purple-600" />
                  <span className="font-semibold text-slate-800">
                    {defaultData.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-slate-800">
                    {defaultData.venue}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">General Admission</p>
                </div>
                {renderQRCode()}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2">
                <p className="text-xs text-slate-500 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2 w-1 h-1 bg-blue-500 rounded-full" />
          </div>
        </div>
      );

    case "modern-gradient":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-pink-500 rounded-2xl shadow-xl overflow-hidden text-white">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm px-4 py-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tracking-wider">
                  EVENT TICKET
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-white/60 rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-white/90" />
                  <span className="font-semibold">{defaultData.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white/90" />
                  <span className="font-semibold">{defaultData.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-white/90" />
                  <span className="font-semibold">{defaultData.venue}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-white" />
                    <span className="text-sm font-bold">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-white/80">Standard Pass</p>
                </div>
                {renderQRCode()}
              </div>

              <div className="border-t border-dashed border-white/30 pt-2">
                <p className="text-xs text-white/70 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full" />
          </div>
        </div>
      );

    case "luxury-dark":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-xl border-2 border-yellow-500/30 overflow-hidden text-white">
            {/* Header */}
            <div className="bg-black px-4 py-3 border-b border-yellow-500/20">
              <div className="text-center">
                <p className="text-yellow-400 text-sm font-bold tracking-wider">
                  EXCLUSIVE ACCESS
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight text-white">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-yellow-400 rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-yellow-400" />
                  <span className="font-semibold text-gray-200">
                    {defaultData.eventDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span className="font-semibold text-gray-200">
                    {defaultData.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-yellow-400" />
                  <span className="font-semibold text-gray-200">
                    {defaultData.venue}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">VIP Experience</p>
                </div>
                {renderQRCode()}
              </div>

              <div className="border-t border-dashed border-yellow-500/30 pt-2">
                <p className="text-xs text-gray-400 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />
          </div>
        </div>
      );

    case "festival-vibrant":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl shadow-xl border-2 border-white overflow-hidden text-white">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm px-4 py-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tracking-wider">
                  🎵 MUSIC FESTIVAL 🎵
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-white rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.venue}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-white" />
                    <span className="text-sm font-bold">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-white/90">Festival Pass</p>
                </div>
                <div className="text-right">{renderQRCode()}</div>
              </div>

              <div className="border-t border-dashed border-white/50 pt-2">
                <p className="text-xs text-white/80 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2">
              <Music className="w-4 h-4 text-white/60" />
            </div>
          </div>
        </div>
      );

    case "conference-clean":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tracking-wider">
                  CONFERENCE PASS
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-blue-800 leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-blue-600 rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-slate-700">
                    {defaultData.eventDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-slate-700">
                    {defaultData.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-slate-700">
                    {defaultData.venue}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span className="text-sm font-bold text-blue-600">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Full Access</p>
                </div>
                {renderQRCode()}
              </div>

              <div className="border-t border-dashed border-blue-200 pt-2">
                <p className="text-xs text-slate-500 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2 w-1 h-1 bg-blue-600 rounded-full" />
          </div>
        </div>
      );

    case "sports-dynamic":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 rounded-2xl shadow-xl overflow-hidden text-white">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm px-4 py-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tracking-wider">
                  ⚽ MATCH TICKET ⚽
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="w-8 h-0.5 bg-white rounded-full mt-1" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="font-semibold">{defaultData.venue}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-white" />
                    <span className="text-sm font-bold">
                      {defaultData.price}
                    </span>
                  </div>
                  <p className="text-xs text-white/90">Section A | Row 12</p>
                </div>
                {renderQRCode()}
              </div>

              <div className="border-t border-dashed border-white/40 pt-2">
                <p className="text-xs text-white/80 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-2 right-2">
              <Trophy className="w-4 h-4 text-white/60" />
            </div>
          </div>
        </div>
      );

    case "minimal-modern":
      return (
        <div className={`w-64 h-80 relative ${className}`}>
          <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Content */}
            <div className="p-6 space-y-6 h-full flex flex-col">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {defaultData.eventTitle}
                </h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="font-semibold">{defaultData.eventDate}</p>
                  <p>{defaultData.eventTime}</p>
                  <p>{defaultData.venue}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-px">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-sm ${
                          Math.random() > 0.5 ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    General Admission
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {defaultData.price}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {defaultData.ticketNumber}
                </p>
              </div>
            </div>

            <div className="absolute top-4 right-4 w-1 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      );

    default:
      return (
        <div className={`w-64 h-80 bg-gray-200 rounded-2xl ${className}`} />
      );
  }
};

export const TicketTemplatePreview: React.FC<TicketTemplatePreviewProps> = ({
  templateId,
  eventData,
  isSelected = false,
  onSelect,
}) => {
  const templates = {
    professional: {
      name: "Professional",
      description: "Clean corporate design with subtle gradients",
      icon: Briefcase,
      color: "blue",
    },
    "modern-gradient": {
      name: "Modern Gradient",
      description: "Contemporary design with vibrant gradients",
      icon: Sparkles,
      color: "purple",
    },
    "luxury-dark": {
      name: "Luxury Dark",
      description: "Premium black design with gold accents",
      icon: Star,
      color: "yellow",
    },
    "festival-vibrant": {
      name: "Festival Vibrant",
      description: "Colorful design for music festivals",
      icon: Music,
      color: "pink",
    },
    "conference-clean": {
      name: "Conference Clean",
      description: "Professional design for business events",
      icon: Users,
      color: "blue",
    },
    "sports-dynamic": {
      name: "Sports Dynamic",
      description: "Energetic design for sports events",
      icon: Trophy,
      color: "green",
    },
    "minimal-modern": {
      name: "Minimal Modern",
      description: "Ultra-clean design with focus on typography",
      icon: Tag,
      color: "gray",
    },
  };

  const template = templates[templateId as keyof typeof templates];
  if (!template) return null;

  const Icon = template.icon;

  return (
    <div className="group cursor-pointer" onClick={onSelect}>
      <div
        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
        }`}
      >
        {/* Template Preview */}
        <div className="flex justify-center mb-4">
          <TemplatePreview
            templateId={templateId}
            eventData={eventData}
            className="transform group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Template Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                template.color === "blue"
                  ? "bg-blue-100"
                  : template.color === "purple"
                    ? "bg-purple-100"
                    : template.color === "yellow"
                      ? "bg-yellow-100"
                      : template.color === "pink"
                        ? "bg-pink-100"
                        : template.color === "green"
                          ? "bg-green-100"
                          : template.color === "gray"
                            ? "bg-gray-100"
                            : "bg-blue-100"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  template.color === "blue"
                    ? "text-blue-600"
                    : template.color === "purple"
                      ? "text-purple-600"
                      : template.color === "yellow"
                        ? "text-yellow-600"
                        : template.color === "pink"
                          ? "text-pink-600"
                          : template.color === "green"
                            ? "text-green-600"
                            : template.color === "gray"
                              ? "text-gray-600"
                              : "text-blue-600"
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{template.name}</h3>
              <p className="text-sm text-slate-600">{template.description}</p>
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export const TicketTemplateGrid: React.FC<{
  selectedTemplate?: string;
  onTemplateSelect?: (templateId: string) => void;
  eventData?: any;
}> = ({ selectedTemplate, onTemplateSelect, eventData }) => {
  const templateIds = [
    "professional",
    "modern-gradient",
    "luxury-dark",
    "festival-vibrant",
    "conference-clean",
    "sports-dynamic",
    "minimal-modern",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Choose Your Ticket Design
        </h3>
        <p className="text-slate-600">
          Select a professional template that matches your event's style and
          audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templateIds.map((templateId) => (
          <TicketTemplatePreview
            key={templateId}
            templateId={templateId}
            eventData={eventData}
            isSelected={selectedTemplate === templateId}
            onSelect={() => onTemplateSelect?.(templateId)}
          />
        ))}
      </div>
    </div>
  );
};
