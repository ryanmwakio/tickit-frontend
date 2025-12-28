"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";

export function HostApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    email: "",
    phoneNumber: "",
    eventDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.organisation || !formData.email || !formData.eventDetails) {
      toast.error("Error", "Please fill in all required fields");
      return;
    }

    // Split name and organisation if provided in format "Name · Organisation"
    let name = formData.name;
    let organisation = formData.organisation;
    
    if (formData.name.includes("·")) {
      const parts = formData.name.split("·").map(s => s.trim());
      name = parts[0] || "";
      organisation = parts[1] || formData.organisation;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/organiser-applications", {
        name: name || formData.name,
        organisation: organisation || formData.organisation,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        eventDetails: formData.eventDetails,
      });

      toast.success("Success", "Your application has been submitted! We'll get back to you within 1 business day.");
      setSubmittedEmail(formData.email);
      setSubmitted(true);
      setFormData({
        name: "",
        organisation: "",
        email: "",
        phoneNumber: "",
        eventDetails: "",
      });
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      toast.error("Error", error.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 rounded-3xl border-2 border-green-300 bg-green-50 p-6 shadow-xl shadow-slate-200/70">
        <h2 className="text-lg font-semibold text-green-900">Application Submitted!</h2>
        <p className="text-sm text-green-700">
          Thank you for your interest in hosting on Tickit. We've received your application and will review it within 1 business day.
        </p>
        <p className="text-sm text-green-700">
          You'll receive an email at {submittedEmail} with next steps and an onboarding call slot.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/60 hover:bg-green-700"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
      <h2 className="text-lg font-semibold">Tell us about your series</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Jane Doe"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Organisation *
        </label>
        <input
          type="text"
          value={formData.organisation}
          onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
          placeholder="Skyline Events"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@example.com"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+254712345678"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Upcoming event details *
        </label>
        <textarea
          value={formData.eventDetails}
          onChange={(e) => setFormData({ ...formData, eventDetails: e.target.value })}
          placeholder="Date, venue, expected capacity, payment flows needed..."
          rows={4}
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Request launch session"}
      </button>
      <p className="text-xs text-slate-500">
        We reply within 1 business day with next steps and an onboarding
        call slot.
      </p>
    </form>
  );
}

