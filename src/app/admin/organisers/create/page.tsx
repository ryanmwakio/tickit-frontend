"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  activeRole: string;
  status: string;
}

interface CreateOrganiserData {
  name: string;
  description: string;
  logoUrl: string;
  ownerId: string;
}

export default function CreateOrganiserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateOrganiserData>({
    name: "",
    description: "",
    logoUrl: "",
    ownerId: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const loadUsers = async (search = "") => {
    try {
      setUsersLoading(true);
      const params: any = {
        limit: 50,
        page: 1,
      };
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get<{
        data: User[];
        total: number;
      }>("/admin/users", params);
      setUsers(response.data || []);
    } catch (error: any) {
      console.error("Failed to load users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (userSearch !== "") {
        loadUsers(userSearch);
      } else {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [userSearch]);

  const handleInputChange = (field: keyof CreateOrganiserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Organiser name is required";
    }

    if (!formData.ownerId) {
      newErrors.ownerId = "Please select an owner";
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        logoUrl: formData.logoUrl.trim() || undefined,
      };

      await apiClient.post("/admin/organisers", payload);
      
      toast.success("Success", "Organiser created successfully");
      router.push("/admin/organisers");
    } catch (error: any) {
      console.error("Failed to create organiser:", error);
      toast.error("Error", error.message || "Failed to create organiser");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find(user => user.id === formData.ownerId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/organisers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Organiser</h1>
          <p className="text-sm text-slate-600">
            Create a new organiser profile and assign an owner
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Organiser Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Organiser Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter organiser name or company name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-300" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the organiser's business, focus areas, or background..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
              <p className="text-xs text-slate-500">
                This helps identify the organiser and their events
              </p>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                className={errors.logoUrl ? "border-red-300" : ""}
              />
              {errors.logoUrl && (
                <p className="text-sm text-red-600">{errors.logoUrl}</p>
              )}
              <p className="text-xs text-slate-500">
                Optional: URL to the organiser's logo image
              </p>
            </div>
          </div>
        </div>

        {/* Owner Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Owner Assignment</h2>
          
          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label htmlFor="userSearch">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="userSearch"
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Owner Selection */}
            <div className="space-y-2">
              <Label htmlFor="owner">
                Select Owner <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.ownerId} onValueChange={(value) => handleInputChange("ownerId", value)}>
                <SelectTrigger className={errors.ownerId ? "border-red-300" : ""}>
                  <SelectValue placeholder="Choose a user to be the organiser owner" />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>Loading users...</SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="no-users" disabled>No users found</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName} 
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.ownerId && (
                <p className="text-sm text-red-600">{errors.ownerId}</p>
              )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-medium text-slate-900 mb-2">Selected Owner</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Name:</span> {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedUser.email}
                  </p>
                  <p>
                    <span className="font-medium">Current Role:</span> {selectedUser.activeRole}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {selectedUser.status}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/admin/organisers" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? (
              "Creating..."
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Create Organiser
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Users className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Organiser Ownership</p>
            <p>
              The selected user will become the owner of this organiser profile. They will be able to:
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Create and manage events under this organiser</li>
              <li>• Access organiser dashboard and analytics</li>
              <li>• Manage staff and permissions</li>
              <li>• Update organiser profile information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}