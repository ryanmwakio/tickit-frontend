"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type OrganiserApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface OrganiserApplication {
  id: string;
  name: string;
  organisation: string;
  email: string;
  phoneNumber?: string;
  eventDetails: string;
  status: OrganiserApplicationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<OrganiserApplicationStatus, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-800 border-slate-300",
    icon: XCircle,
  },
};

export function OrganiserApplications() {
  const [applications, setApplications] = useState<OrganiserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganiserApplicationStatus | "all">("all");
  const [selectedApplication, setSelectedApplication] = useState<OrganiserApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadApplications();
  }, [page, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 9,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await apiClient.get<{
        data: OrganiserApplication[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/organiser-applications`, params);

      if (page === 1) {
        setApplications(response.data || []);
      } else {
        setApplications((prev) => [...prev, ...(response.data || [])]);
      }

      setHasMore(response.page < response.totalPages);
    } catch (error: any) {
      console.error("Failed to load applications:", error);
      toast.error("Error", error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleViewApplication = (application: OrganiserApplication) => {
    setSelectedApplication(application);
    setReviewModalOpen(true);
    setReviewAction(null);
    setReviewNotes("");
  };

  const handleReview = (action: "approve" | "reject") => {
    if (!selectedApplication) return;
    setReviewAction(action);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication || !reviewAction) return;

    try {
      setSubmitting(true);
      const endpoint = `/admin/organiser-applications/${selectedApplication.id}/${reviewAction}`;
      await apiClient.post(endpoint, { notes: reviewNotes || undefined });

      toast.success(
        "Success",
        `Application ${reviewAction === "approve" ? "approved" : "rejected"} successfully`
      );

      setReviewModalOpen(false);
      setSelectedApplication(null);
      setReviewAction(null);
      setReviewNotes("");
      setPage(1);
      loadApplications();
    } catch (error: any) {
      console.error("Failed to review application:", error);
      toast.error("Error", error.message || `Failed to ${reviewAction} application`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Organisation", "Email", "Phone", "Status", "Event Details", "Submitted", "Reviewed"],
      ...applications.map((app) => [
        app.name,
        app.organisation,
        app.email,
        app.phoneNumber || "",
        app.status,
        app.eventDetails.replace(/\n/g, " "),
        new Date(app.createdAt).toLocaleDateString(),
        app.reviewedBy ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organiser-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.organisation.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.eventDetails.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, organisation, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as OrganiserApplicationStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export
        </Button>
      </div>

      {/* Applications List */}
      {loading && applications.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Clock className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No applications found</p>
          <p className="mt-2 text-sm text-slate-600">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No organiser applications have been submitted yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredApplications.map((application) => {
              const StatusIcon = statusConfig[application.status].icon;
              return (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig[application.status].className}`}
                        >
                          <StatusIcon className="size-3" />
                          {statusConfig[application.status].label}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Organisation:</span> {application.organisation}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {application.email}
                        </p>
                        {application.phoneNumber && (
                          <p>
                            <span className="font-medium">Phone:</span> {application.phoneNumber}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Submitted:</span>{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                        {application.reviewer && (
                          <p>
                            <span className="font-medium">Reviewed by:</span>{" "}
                            {application.reviewer.firstName} {application.reviewer.lastName}
                          </p>
                        )}
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-700">Event Details:</p>
                        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                          {application.eventDetails}
                        </p>
                      </div>
                      {application.adminNotes && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                          <p className="text-xs font-medium text-blue-700">Admin Notes:</p>
                          <p className="mt-1 text-sm text-blue-600 whitespace-pre-wrap">
                            {application.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    {application.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                        className="ml-4"
                      >
                        <Eye className="mr-2 size-4" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review the organiser application and approve or reject it.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-sm text-slate-600">{selectedApplication.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <p className="text-sm text-slate-600">{selectedApplication.organisation}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-slate-600">{selectedApplication.email}</p>
              </div>
              {selectedApplication.phoneNumber && (
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <p className="text-sm text-slate-600">{selectedApplication.phoneNumber}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Event Details</Label>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {selectedApplication.eventDetails}
                </p>
              </div>

              {!reviewAction ? (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleReview("approve")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReview("reject")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 size-4" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>
                      Admin Notes {reviewAction === "approve" ? "(Optional)" : "(Recommended)"}
                    </Label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder={
                        reviewAction === "approve"
                          ? "Add any notes about this approval..."
                          : "Please provide a reason for rejection..."
                      }
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewAction(null);
                        setReviewNotes("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submitting || (reviewAction === "reject" && !reviewNotes.trim())}
                      className={`flex-1 ${
                        reviewAction === "approve"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {reviewAction === "approve" ? (
                            <>
                              <CheckCircle2 className="mr-2 size-4" />
                              Confirm Approval
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 size-4" />
                              Confirm Rejection
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



