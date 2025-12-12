"use client";

import { useState } from "react";
import {
  DollarSign,
  Package,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Users,
  Percent,
  Tag,
  Gift,
  Copy,
  Eye,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-picker";

type TicketPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  quantitySold: number;
  minPerOrder: number | null;
  maxPerOrder: number | null;
  salesStartsAt: Date | null;
  salesEndsAt: Date | null;
  isRefundable: boolean;
  ticketDesignId: string | null;
  seatMapSection: string | null;
  benefits: string[];
  addOns: AddOn[];
  fees: {
    platformFee: number;
    organizerFee: number;
    tax: number;
  };
  metadata: {
    isEarlyBird: boolean;
    isVIP: boolean;
    isPopular: boolean;
    color: string;
  };
};

type AddOn = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
};

type PricingPackagesProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function PricingPackages({ initialData, onDataChange }: PricingPackagesProps = {}) {
  const [packages, setPackages] = useState<TicketPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [promoCodes, setPromoCodes] = useState<
    Array<{
      id: string;
      code: string;
      discountType: "percentage" | "fixed";
      value: number;
      validFrom: Date | null;
      validUntil: Date | null;
      usageLimit: number | null;
      usageCount: number;
      applicablePackages: string[];
    }>
  >([]);

  const handleAddPackage = () => {
    const newPackage: TicketPackage = {
      id: `pkg-${Date.now()}`,
      name: "New Package",
      description: "",
      price: 0,
      currency: "KES",
      quantity: 100,
      quantitySold: 0,
      minPerOrder: null,
      maxPerOrder: null,
      salesStartsAt: null,
      salesEndsAt: null,
      isRefundable: true,
      ticketDesignId: null,
      seatMapSection: null,
      benefits: [],
      addOns: [],
      fees: {
        platformFee: 2.5,
        organizerFee: 0,
        tax: 0,
      },
      metadata: {
        isEarlyBird: false,
        isVIP: false,
        isPopular: false,
        color: "#3b82f6",
      },
    };
    setPackages([...packages, newPackage]);
    setSelectedPackage(newPackage.id);
    setIsEditing(true);
  };

  const handleUpdatePackage = (id: string, updates: Partial<TicketPackage>) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, ...updates } : pkg)));
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
    if (selectedPackage === id) {
      setSelectedPackage(null);
    }
  };

  const handleDuplicatePackage = (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    if (pkg) {
      const duplicated: TicketPackage = {
        ...pkg,
        id: `pkg-${Date.now()}`,
        name: `${pkg.name} (Copy)`,
        quantitySold: 0,
      };
      setPackages([...packages, duplicated]);
    }
  };

  const selectedPackageData = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Pricing & Packages</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure ticket packages, pricing, discounts, and packages linked to your ticket designs and seat map.
        </p>
      </div>

      {/* Quick Stats */}
      {packages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Package className="size-4" />
              <span>Total Packages</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{packages.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="size-4" />
              <span>Total Capacity</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {packages.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="size-4" />
              <span>Revenue Potential</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {packages
                .reduce((sum, p) => sum + p.price * p.quantity, 0)
                .toLocaleString("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Percent className="size-4" />
              <span>Promo Codes</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{promoCodes.length}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[350px,1fr]">
        {/* Packages List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Ticket Packages</h3>
            <button
              onClick={handleAddPackage}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Package className="mx-auto size-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-600">No packages yet</p>
              <button
                onClick={handleAddPackage}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="size-4" />
                Create First Package
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    setIsEditing(false);
                  }}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                    selectedPackage === pkg.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: pkg.metadata.color }}
                        />
                        <h4 className="font-semibold text-slate-900">{pkg.name}</h4>
                        {pkg.metadata.isPopular && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {pkg.price.toLocaleString("en-KE", {
                          style: "currency",
                          currency: pkg.currency,
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {pkg.quantitySold} / {pkg.quantity} sold
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePackage(pkg.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
                        title="Duplicate"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePackage(pkg.id);
                        }}
                        className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Package Details */}
        {selectedPackageData ? (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{selectedPackageData.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{selectedPackageData.description || "No description"}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Edit2 className="size-4" />
                    Edit
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Price</label>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedPackageData.price.toLocaleString("en-KE", {
                        style: "currency",
                        currency: selectedPackageData.currency,
                        minimumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Quantity Available</label>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedPackageData.quantity - selectedPackageData.quantitySold} /{" "}
                      {selectedPackageData.quantity}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Ticket Design</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedPackageData.ticketDesignId ? "Linked" : "Not linked"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Seat Map Section</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {selectedPackageData.seatMapSection || "Not linked"}
                    </p>
                  </div>
                </div>

                {selectedPackageData.benefits.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-semibold text-slate-600">Benefits</label>
                    <ul className="mt-2 space-y-2">
                      {selectedPackageData.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-900">
                          <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <PackageEditor
                package={selectedPackageData}
                onUpdate={(updates) => handleUpdatePackage(selectedPackageData.id, updates)}
                onCancel={() => setIsEditing(false)}
                onSave={() => setIsEditing(false)}
              />
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <Info className="mx-auto size-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-600">Select a package to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Promo Codes Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Promo Codes & Discounts</h3>
            <p className="mt-1 text-sm text-slate-600">Create discount codes and special offers</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Plus className="size-4" />
            Add Promo Code
          </button>
        </div>

        {promoCodes.length === 0 ? (
          <div className="mt-6 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Tag className="mx-auto size-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No promo codes yet</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-white px-2 py-1 text-sm font-mono font-semibold text-slate-900">
                      {promo.code}
                    </code>
                    <span className="text-sm font-semibold text-slate-900">
                      {promo.discountType === "percentage" ? `${promo.value}%` : `${promo.value} ${promo.currency || "KES"}`} off
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Used {promo.usageCount} / {promo.usageLimit || "∞"} times
                  </p>
                </div>
                <button className="rounded-lg p-2 text-slate-600 transition hover:bg-white">
                  <Edit2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PackageEditor({
  package: pkg,
  onUpdate,
  onCancel,
  onSave,
}: {
  package: TicketPackage;
  onUpdate: (updates: Partial<TicketPackage>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState(pkg);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Package Details</h3>

        <div className="mt-6 space-y-4">
          <div>
            <Label className="block text-sm font-semibold text-slate-900">Package Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                onUpdate({ name: e.target.value });
              }}
              className="mt-1"
              placeholder="e.g., VIP Pass, General Admission"
            />
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-900">Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                onUpdate({ description: e.target.value });
              }}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Describe what's included in this package..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="block text-sm font-semibold text-slate-900">Price</Label>
              <div className="mt-1 flex items-center gap-2">
                <Select
                  value={formData.currency}
                  onValueChange={(value) => {
                    setFormData({ ...formData, currency: value });
                    onUpdate({ currency: value });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: Number(e.target.value) });
                    onUpdate({ price: Number(e.target.value) });
                  }}
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-semibold text-slate-900">Total Quantity</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({ ...formData, quantity: Number(e.target.value) });
                  onUpdate({ quantity: Number(e.target.value) });
                }}
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="block text-sm font-semibold text-slate-900">Min per Order</Label>
              <Input
                type="number"
                value={formData.minPerOrder || ""}
                onChange={(e) => {
                  setFormData({ ...formData, minPerOrder: e.target.value ? Number(e.target.value) : null });
                  onUpdate({ minPerOrder: e.target.value ? Number(e.target.value) : null });
                }}
                min="1"
                placeholder="Optional"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-slate-900">Max per Order</Label>
              <Input
                type="number"
                value={formData.maxPerOrder || ""}
                onChange={(e) => {
                  setFormData({ ...formData, maxPerOrder: e.target.value ? Number(e.target.value) : null });
                  onUpdate({ maxPerOrder: e.target.value ? Number(e.target.value) : null });
                }}
                min="1"
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <DateTimePicker
                label="Sales Start"
                value={
                  formData.salesStartsAt
                    ? new Date(formData.salesStartsAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(value) => {
                  const date = value ? new Date(value) : null;
                  setFormData({ ...formData, salesStartsAt: date });
                  onUpdate({ salesStartsAt: date });
                }}
                placeholder="Select start date and time"
              />
            </div>

            <div>
              <DateTimePicker
                label="Sales End"
                value={
                  formData.salesEndsAt
                    ? new Date(formData.salesEndsAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(value) => {
                  const date = value ? new Date(value) : null;
                  setFormData({ ...formData, salesEndsAt: date });
                  onUpdate({ salesEndsAt: date });
                }}
                placeholder="Select end date and time"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isRefundable}
              onChange={(e) => {
                setFormData({ ...formData, isRefundable: e.target.checked });
                onUpdate({ isRefundable: e.target.checked });
              }}
              className="size-4 rounded border-slate-300"
            />
            <label className="text-sm font-semibold text-slate-900">Refundable</label>
          </div>
        </div>
      </div>

      {/* Link to Ticket Design */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Link to Design</h3>
        <p className="mt-1 text-sm text-slate-600">
          Connect this package to a ticket design and seat map section
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="block text-sm font-semibold text-slate-900">Ticket Design</Label>
            <Select
              value={formData.ticketDesignId ? formData.ticketDesignId : "none"}
              onValueChange={(value) => {
                const newValue = value === "none" ? null : value;
                setFormData({ ...formData, ticketDesignId: newValue });
                onUpdate({ ticketDesignId: newValue });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a ticket design..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="artistic">Artistic</SelectItem>
                <SelectItem value="silver">Silver Gradient</SelectItem>
                <SelectItem value="gold">Gold Luxury</SelectItem>
                <SelectItem value="striped">Striped</SelectItem>
                <SelectItem value="barcode">Barcode</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
                <SelectItem value="elegant-stripe">Elegant Stripe</SelectItem>
                <SelectItem value="sport">Sports</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-semibold text-slate-900">Seat Map Section</Label>
            <Select
              value={formData.seatMapSection ? formData.seatMapSection : "none"}
              onValueChange={(value) => {
                const newValue = value === "none" ? null : value;
                setFormData({ ...formData, seatMapSection: newValue });
                onUpdate({ seatMapSection: newValue });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a section..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fees & Pricing Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Fees & Pricing Breakdown</h3>
        <p className="mt-1 text-sm text-slate-600">Configure platform fees, taxes, and pricing structure</p>

        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="block text-sm font-semibold text-slate-900">Platform Fee (%)</Label>
              <Input
                type="number"
                value={formData.fees.platformFee}
                onChange={(e) => {
                  const fees = { ...formData.fees, platformFee: Number(e.target.value) };
                  setFormData({ ...formData, fees });
                  onUpdate({ fees });
                }}
                min="0"
                max="100"
                step="0.1"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="block text-sm font-semibold text-slate-900">Organizer Fee (%)</Label>
              <Input
                type="number"
                value={formData.fees.organizerFee}
                onChange={(e) => {
                  const fees = { ...formData.fees, organizerFee: Number(e.target.value) };
                  setFormData({ ...formData, fees });
                  onUpdate({ fees });
                }}
                min="0"
                max="100"
                step="0.1"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="block text-sm font-semibold text-slate-900">Tax (%)</Label>
              <Input
                type="number"
                value={formData.fees.tax}
                onChange={(e) => {
                  const fees = { ...formData.fees, tax: Number(e.target.value) };
                  setFormData({ ...formData, fees });
                  onUpdate({ fees });
                }}
                min="0"
                max="100"
                step="0.1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-900">Customer Price Breakdown</h4>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Price</span>
                <span className="font-semibold text-slate-900">
                  {formData.price.toLocaleString("en-KE", {
                    style: "currency",
                    currency: formData.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Fee</span>
                <span className="font-semibold text-slate-900">
                  {((formData.price * formData.fees.platformFee) / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: formData.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold text-slate-900">
                  {((formData.price * formData.fees.tax) / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: formData.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>
                  {(
                    formData.price +
                    (formData.price * formData.fees.platformFee) / 100 +
                    (formData.price * formData.fees.tax) / 100
                  ).toLocaleString("en-KE", {
                    style: "currency",
                    currency: formData.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Save className="size-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

