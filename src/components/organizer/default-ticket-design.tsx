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
} from "lucide-react";

interface DefaultTicketProps {
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  ticketType?: string;
  price?: string;
  ticketNumber?: string;
  qrCode?: string;
  organizerLogo?: string;
  organizerName?: string;
}

export function DefaultTicketDesign({
  eventTitle = "Event Name",
  eventDate = "January 15, 2024",
  eventTime = "7:00 PM",
  venue = "Event Venue",
  ticketType = "General Admission",
  price = "KES 2,000",
  ticketNumber = "TIX-2024-001234",
  qrCode,
  organizerLogo,
  organizerName = "Event Organizer",
}: DefaultTicketProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Ticket Container with enhanced shadows and gradients */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 pointer-events-none" />

        {/* Premium Header with sophisticated gradient */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-7 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {organizerLogo ? (
                <img
                  src={organizerLogo}
                  alt={organizerName}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-lg font-bold tracking-tight">
                    {organizerName}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">
                Admit One
              </p>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative p-7 space-y-6">
          {/* Event Title with better typography */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
              {eventTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </div>

          {/* Event Details with enhanced spacing and icons */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-900">
                  {eventDate}
                </p>
                <p className="text-sm text-slate-500 font-medium">Event Date</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-900">
                  {eventTime}
                </p>
                <p className="text-sm text-slate-500 font-medium">Start Time</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-900">{venue}</p>
                <p className="text-sm text-slate-500 font-medium">
                  Venue Location
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Ticket Details Section */}
          <div className="border-t border-slate-200/70 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {ticketType}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Ticket Type
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-emerald-600">
                      {price}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Price Paid
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-px">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-sm ${
                              Math.random() > 0.5
                                ? "bg-slate-800"
                                : "bg-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Scan for Entry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="relative border-t border-dashed border-slate-300/70 bg-gradient-to-r from-slate-50/80 to-slate-50/60 px-7 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3 text-slate-500" />
              <p className="text-xs font-mono font-bold text-slate-700 tracking-wider">
                {ticketNumber}
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Valid for event date only
            </div>
          </div>
        </div>

        {/* Subtle watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-6 right-6 transform rotate-12 opacity-[0.02]">
            <span className="text-8xl font-black text-slate-900 tracking-tighter">
              TICKIT
            </span>
          </div>
        </div>

        {/* Modern corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6">
          <div className="absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 border-blue-400/40 rounded-tl-xl" />
        </div>
        <div className="absolute top-0 right-0 w-6 h-6">
          <div className="absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 border-purple-400/40 rounded-tr-xl" />
        </div>
        <div className="absolute bottom-0 left-0 w-6 h-6">
          <div className="absolute bottom-3 left-3 w-3 h-3 border-l-2 border-b-2 border-green-400/40 rounded-bl-xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6">
          <div className="absolute bottom-3 right-3 w-3 h-3 border-r-2 border-b-2 border-amber-400/40 rounded-br-xl" />
        </div>

        {/* Premium quality indicator */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg" />
      </div>
    </div>
  );
}

export function DefaultTicketPreview({
  eventData,
}: {
  eventData?: {
    title?: string;
    startDate?: string;
    startTime?: string;
    location?: string;
    price?: string;
  };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Premium Ticket Preview
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Professional design featuring modern styling, enhanced typography, and
          premium visual elements
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-8 rounded-2xl border border-slate-200/50">
        <DefaultTicketDesign
          eventTitle={eventData?.title}
          eventDate={
            eventData?.startDate
              ? new Date(eventData.startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : undefined
          }
          eventTime={eventData?.startTime}
          venue={eventData?.location}
          price={eventData?.price}
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mt-0.5">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">
              Premium Default Design
            </h4>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              This sophisticated design features modern gradients, enhanced
              typography, premium visual hierarchy, and professional styling.
              All essential ticket information is beautifully presented with
              improved readability and visual appeal.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Modern Gradients
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Enhanced Typography
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Premium Styling
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              💡 Enable "Custom Ticket Design" feature to access advanced
              customization options, multiple templates, and full design
              control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
