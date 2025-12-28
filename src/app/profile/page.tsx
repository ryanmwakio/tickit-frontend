"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Bell,
  Save,
  Camera,
  CheckCircle2,
  Shield,
  Settings,
  TrendingUp,
  Calendar,
  Ticket,
  X,
  Download,
  QrCode,
  Upload,
} from "lucide-react";
import Link from "next/link";

const preferences = [
  "Product updates & release notes",
  "Event performance emails",
  "Ops alerts & incident summaries",
  "Waitlist + resale notifications",
];

interface UserTicket {
  id: string;
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  ticketType: string;
  status: string;
  qrCode?: string;
  price?: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    organization: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        organization: "",
        bio: "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    
    setTicketsLoading(true);
    try {
      const response = await apiClient.get<UserTicket[]>("/tickets");
      setTickets(response || []);
    } catch (error: any) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleShowTickets = () => {
    if (!showTickets) {
      fetchTickets();
    }
    setShowTickets(!showTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await apiClient.patch("/users/me", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatarUrl,
        preferredLanguage: formData.bio ? "en" : undefined,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || user?.firstName?.[0] || "";
    const last = formData.lastName?.[0] || user?.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData({ ...formData, avatarUrl: dataUrl });
    };
    reader.onerror = () => {
      alert("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    const fileInput = document.getElementById("avatar-upload") as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <ProtectedRoute>
      <div className="bg-white text-slate-900">
      {/* Header Section */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start lg:items-center lg:justify-between">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Account</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Your profile</h1>
              <p className="mt-3 max-w-3xl text-base text-slate-600 sm:text-lg sm:mx-0 mx-auto">
                Update contact info, organisation details, and notification preferences. Everything syncs to ops, payouts, and support.
              </p>
            </div>
            
            {/* Avatar Section - Improved Mobile Design */}
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
              <div className="relative">
                {/* Hidden file input */}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                
                {/* Avatar Container - Clickable for upload */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="relative group h-28 w-28 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-md ring-1 ring-slate-50 sm:h-32 sm:w-32 lg:h-36 lg:w-36 transition-all hover:border-slate-300 hover:shadow-lg active:scale-95 touch-manipulation"
                  title="Click to upload image or use URL below"
                  aria-label="Upload profile picture"
                >
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-2xl font-semibold text-slate-700 sm:text-3xl lg:text-4xl">
                      {getInitials()}
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-6 w-6 text-white drop-shadow-lg sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </button>
                
                {/* Camera Button - Alternative upload trigger */}
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 shadow-lg transition-all hover:bg-slate-800 hover:scale-110 active:scale-95 sm:h-10 sm:w-10 lg:h-11 lg:w-11 touch-manipulation z-10"
                  title="Upload image"
                  aria-label="Upload profile picture"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr,0.7fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2">
                  <Ticket className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-2xl font-semibold text-slate-900">{tickets.length}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">Total Tickets</div>
              </div>
              
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-2xl font-semibold text-slate-900">0</div>
                <div className="mt-1 text-xs font-medium text-slate-500">Events Attended</div>
              </div>
              
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-2xl font-semibold text-slate-900">0</div>
                <div className="mt-1 text-xs font-medium text-slate-500">Member Since</div>
              </div>
            </div>

            {/* Tickets Section - Shows when My Tickets is clicked */}
            {showTickets && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">My Tickets</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      View and manage your event tickets
                    </p>
                  </div>
                  <button
                    onClick={handleShowTickets}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Close tickets"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {ticketsLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
                    <p className="mt-4 text-sm text-slate-600">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Ticket className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No tickets yet</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Your purchased tickets will appear here
                    </p>
                    <Link
                      href="/events"
                      className="mt-4 inline-block rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Browse Events
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  ticket.status === "valid" || ticket.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : ticket.status === "used"
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {ticket.eventTitle}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {ticket.ticketType}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {ticket.eventDate}
                              </span>
                              {ticket.price && (
                                <span className="font-medium text-slate-700">{ticket.price}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:flex-col">
                            {ticket.qrCode && (
                              <button
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                title="View QR Code"
                              >
                                <QrCode className="h-4 w-4" />
                                <span className="hidden sm:inline">QR Code</span>
                              </button>
                            )}
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Form Card */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6"
            >
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Jane"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Mwangi"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Phone number cannot be changed here</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Organisation</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Skyline Festivals"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about the events you run, partners, and upcoming series."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Avatar URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg or upload above"
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      title="Upload image file"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Click the avatar above or use the upload button to select an image file, or enter a URL
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/50 transition hover:shadow-xl ${
                    saved
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  } disabled:opacity-50`}
                >
                  {saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Saved Successfully!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="h-5 w-5" />
                      {loading ? "Saving..." : "Save profile"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose what you want to hear about. These map directly to organiser workspace alerts and email digests.
                </p>
              </div>

              <div className="space-y-3">
                {preferences.map((pref) => (
                  <label
                    key={pref}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">{pref}</span>
                  </label>
                ))}
              </div>

              <button className="mt-6 w-full rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Save Preferences
              </button>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/profile/enhanced"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Enhanced Settings</span>
                </Link>
                
                <button
                  onClick={handleShowTickets}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </button>
                
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security & Privacy</span>
                </Link>
              </div>
            </div>

            {/* Help Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="mb-2 font-semibold text-slate-900">Need help?</p>
              <p className="mb-3">
                Need to export your data or close the account? Email{" "}
                <a href="mailto:privacy@tickit.app" className="font-semibold text-slate-900 underline">
                  privacy@tickit.app
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </ProtectedRoute>
  );
}
