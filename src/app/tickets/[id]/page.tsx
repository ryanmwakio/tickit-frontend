import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  Ticket,
  Download,
  Share2,
  QrCode,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Your Ticket | Tickit",
  description: "View and manage your event ticket",
};

// Sample ticket data - in production, this would come from an API
type TicketData = {
  id: string;
  eventTitle: string;
  eventImage: string;
  ticketNumber: string;
  ticketType: string;
  price: string;
  purchaseDate: string;
  eventDate: string;
  eventTime: string;
  location: string;
  address: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  qrCode: string;
  status: "active" | "used" | "cancelled";
  seatInfo?: {
    section: string;
    row: string;
    seat: string;
  };
};

const sampleTicket: TicketData = {
  id: "tix-2024-001234",
  eventTitle: "Nairobi Music Festival 2024",
  eventImage: "/api/placeholder/800/400",
  ticketNumber: "TIX-2024-001234",
  ticketType: "VIP Pass",
  price: "KES 15,000",
  purchaseDate: "January 15, 2024",
  eventDate: "March 15, 2024",
  eventTime: "7:00 PM",
  location: "Kasarani Stadium",
  address: "Nairobi, Kenya",
  attendeeName: "John Doe",
  attendeeEmail: "john.doe@example.com",
  attendeePhone: "+254 712 345 678",
  qrCode:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23000' width='100' height='100'/%3E%3C/svg%3E",
  status: "active",
  seatInfo: {
    section: "VIP",
    row: "A",
    seat: "12",
  },
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = sampleTicket; // In production, fetch by ID

  if (!ticket) {
    notFound();
  }

  const isActive = ticket.status === "active";
  const isUsed = ticket.status === "used";
  const isCancelled = ticket.status === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-8 py-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Events</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-8 py-12">
        {/* Status Banner */}
        {isActive && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Ticket Active</p>
                <p className="text-sm text-green-700">
                  Your ticket is ready for use at the event
                </p>
              </div>
            </div>
          </div>
        )}

        {isUsed && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-slate-600" />
              <div>
                <p className="font-semibold text-slate-900">Ticket Used</p>
                <p className="text-sm text-slate-600">
                  This ticket has already been scanned at the event
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Ticket Card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-2xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative grid gap-8 p-8 text-white lg:grid-cols-[1fr,auto]">
            {/* Left Section - Event Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {ticket.ticketType}
                </div>
                <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                  {ticket.eventTitle}
                </h1>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-5 text-white/80" />
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      Date & Time
                    </p>
                    <p className="mt-1 font-semibold">{ticket.eventDate}</p>
                    <p className="text-sm text-white/70">{ticket.eventTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 text-white/80" />
                  <div>
                    <p className="text-sm font-semibold text-white/80">Venue</p>
                    <p className="mt-1 font-semibold">{ticket.location}</p>
                    <p className="text-sm text-white/70">{ticket.address}</p>
                  </div>
                </div>
              </div>

              {ticket.seatInfo && (
                <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="mb-2 text-sm font-semibold text-white/80">
                    Seat Details
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-white/70">Section</p>
                      <p className="font-semibold">{ticket.seatInfo.section}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Row</p>
                      <p className="font-semibold">{ticket.seatInfo.row}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Seat</p>
                      <p className="font-semibold">{ticket.seatInfo.seat}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20">
                  <Download className="size-4" />
                  Download PDF
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20">
                  <Share2 className="size-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Right Section - QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm lg:w-64">
              <QrCode className="size-8 text-white/80" />
              <div className="relative h-48 w-48 rounded-xl bg-white p-4">
                <Image
                  src={ticket.qrCode}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-white/80">
                  Ticket Number
                </p>
                <p className="mt-1 font-mono text-sm font-bold">
                  {ticket.ticketNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Perforation Line */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 flex items-center justify-center">
              <div className="flex gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 rounded-full bg-white/20"
                    style={{
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendee Information */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Attendee Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Name</p>
                <p className="mt-1 text-sm text-slate-600">
                  {ticket.attendeeName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <p className="mt-1 text-sm text-slate-600">
                  {ticket.attendeeEmail}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Phone</p>
                <p className="mt-1 text-sm text-slate-600">
                  {ticket.attendeePhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Details */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Purchase Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Ticket Type
              </p>
              <p className="mt-1 text-sm text-slate-600">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Price</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {ticket.price}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Purchase Date
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {ticket.purchaseDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Ticket Number
              </p>
              <p className="mt-1 font-mono text-sm text-slate-600">
                {ticket.ticketNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
