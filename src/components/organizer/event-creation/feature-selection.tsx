"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Info,
  Calculator,
  Tag,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchAvailableFeatures, FeatureCategoryDto } from "@/lib/events-api";

type FeatureCategory = {
  id: string;
  name: string;
  description: string;
  features: Feature[];
};

type Feature = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricingType: "one_time" | "per_ticket" | "per_event" | "per_month";
  pricingUnit?: string;
  popular?: boolean;
  required?: boolean;
  category: string;
};

// Fallback feature categories (used when API is unavailable)
const fallbackFeatureCategories: FeatureCategory[] = [
  {
    id: "core",
    name: "Core Features",
    description: "Essential features for every event",
    features: [
      {
        id: "basic_listing",
        name: "Basic Event Listing",
        description: "Create and publish your event listing with basic information",
        basePrice: 0,
        pricingType: "one_time",
        required: true,
        category: "core",
      },
      {
        id: "ticket_sales",
        name: "Ticket Sales",
        description: "Sell tickets online with secure payment processing",
        basePrice: 0,
        pricingType: "per_ticket",
        pricingUnit: "per ticket sold",
        required: true,
        category: "core",
      },
    ],
  },
  {
    id: "design",
    name: "Design & Branding",
    description: "Customize your event's appearance",
    features: [
      {
        id: "custom_ticket_design",
        name: "Custom Ticket Design",
        description: "Design unique tickets with your branding, colors, and logo",
        basePrice: 5000,
        pricingType: "one_time",
        category: "design",
      },
      {
        id: "premium_templates",
        name: "Premium Ticket Templates",
        description: "Access to premium ticket design templates",
        basePrice: 2000,
        pricingType: "one_time",
        category: "design",
      },
      {
        id: "custom_gallery_layout",
        name: "Custom Gallery Layouts",
        description: "Choose from 5 different gallery layout styles",
        basePrice: 3000,
        pricingType: "one_time",
        category: "design",
        popular: true,
      },
      {
        id: "event_branding",
        name: "Event Branding Suite",
        description: "Custom colors, fonts, and logo placement throughout",
        basePrice: 8000,
        pricingType: "one_time",
        category: "design",
      },
    ],
  },
  {
    id: "tickets",
    name: "Ticketing Features",
    description: "Advanced ticketing capabilities",
    features: [
      {
        id: "qr_codes",
        name: "QR Code Tickets",
        description: "Generate QR codes for all tickets (included in ticket sales)",
        basePrice: 0,
        pricingType: "per_ticket",
        category: "tickets",
      },
      {
        id: "dynamic_pricing",
        name: "Dynamic Pricing",
        description: "Set pricing tiers based on time, quantity, or demand",
        basePrice: 5000,
        pricingType: "one_time",
        category: "tickets",
      },
      {
        id: "seat_selection",
        name: "Seat Selection",
        description: "Interactive seat map with seat selection",
        basePrice: 10000,
        pricingType: "one_time",
        category: "tickets",
        popular: true,
      },
      {
        id: "ticket_transfer",
        name: "Ticket Transfer",
        description: "Allow attendees to transfer tickets to others",
        basePrice: 3000,
        pricingType: "one_time",
        category: "tickets",
      },
      {
        id: "waitlist",
        name: "Waitlist Management",
        description: "Automatically manage waitlists when events sell out",
        basePrice: 4000,
        pricingType: "one_time",
        category: "tickets",
      },
    ],
  },
  {
    id: "management",
    name: "Event Management",
    description: "Tools to manage your event",
    features: [
      {
        id: "check_in_app",
        name: "Check-In App",
        description: "Mobile app for scanning tickets at the event",
        basePrice: 0,
        pricingType: "per_event",
        pricingUnit: "per event day",
        category: "management",
      },
      {
        id: "advanced_checkin",
        name: "Advanced Check-In Features",
        description: "Multiple gates, real-time analytics, duplicate detection",
        basePrice: 5000,
        pricingType: "per_event",
        category: "management",
      },
      {
        id: "staff_management",
        name: "Staff & Access Control",
        description: "Manage staff roles, permissions, and access",
        basePrice: 3000,
        pricingType: "one_time",
        category: "management",
      },
      {
        id: "analytics_dashboard",
        name: "Analytics Dashboard",
        description: "Comprehensive analytics and reporting",
        basePrice: 0,
        pricingType: "one_time",
        category: "management",
      },
      {
        id: "advanced_analytics",
        name: "Advanced Analytics",
        description: "Custom reports, export, and detailed insights",
        basePrice: 5000,
        pricingType: "one_time",
        category: "management",
        popular: true,
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing & Promotion",
    description: "Promote and grow your event",
    features: [
      {
        id: "email_campaigns",
        name: "Email Campaigns",
        description: "Send promotional emails to your audience",
        basePrice: 2000,
        pricingType: "one_time",
        category: "marketing",
      },
      {
        id: "sms_notifications",
        name: "SMS Notifications",
        description: "Send SMS updates and reminders",
        basePrice: 2,
        pricingType: "per_ticket",
        pricingUnit: "per SMS sent",
        category: "marketing",
      },
      {
        id: "social_sharing",
        name: "Social Media Integration",
        description: "Easy sharing to Facebook, Twitter, Instagram",
        basePrice: 0,
        pricingType: "one_time",
        category: "marketing",
      },
      {
        id: "affiliate_program",
        name: "Affiliate Program",
        description: "Set up an affiliate program with commission tracking",
        basePrice: 5000,
        pricingType: "one_time",
        category: "marketing",
      },
      {
        id: "promo_codes",
        name: "Promo Codes & Discounts",
        description: "Create and manage discount codes",
        basePrice: 0,
        pricingType: "one_time",
        category: "marketing",
      },
    ],
  },
  {
    id: "addons",
    name: "Add-ons & Extras",
    description: "Additional features and services",
    features: [
      {
        id: "merchandise",
        name: "Merchandise Sales",
        description: "Sell event merchandise alongside tickets",
        basePrice: 4000,
        pricingType: "one_time",
        category: "addons",
      },
      {
        id: "sponsor_management",
        name: "Sponsor Management",
        description: "Showcase sponsors with tiered visibility",
        basePrice: 3000,
        pricingType: "one_time",
        category: "addons",
      },
      {
        id: "live_streaming",
        name: "Live Streaming Integration",
        description: "Integrate with streaming platforms",
        basePrice: 8000,
        pricingType: "one_time",
        category: "addons",
      },
      {
        id: "multi_language",
        name: "Multi-Language Support",
        description: "Support multiple languages for your event",
        basePrice: 6000,
        pricingType: "one_time",
        category: "addons",
      },
      {
        id: "priority_support",
        name: "Priority Support",
        description: "24/7 priority customer support",
        basePrice: 10000,
        pricingType: "per_month",
        pricingUnit: "per month",
        category: "addons",
      },
    ],
  },
];

type FeatureSelectionProps = {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  estimatedTickets?: number;
  eventDays?: number;
  onContinue?: () => void;
};

export function FeatureSelection({
  selectedFeatures,
  onFeaturesChange,
  estimatedTickets = 500,
  eventDays = 1,
  onContinue,
}: FeatureSelectionProps) {
  const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>(fallbackFeatureCategories);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Fetch features from API
  useEffect(() => {
    async function loadFeatures() {
      try {
        setLoadingFeatures(true);
        const apiFeatures = await fetchAvailableFeatures();
        
        if (apiFeatures && apiFeatures.length > 0) {
          // Use features from API - convert to FeatureCategory format
          const convertedFeatures: FeatureCategory[] = apiFeatures.map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            features: cat.features.map((f) => ({
              id: f.id,
              name: f.name,
              description: f.description,
              basePrice: f.basePrice,
              pricingType: f.pricingType,
              pricingUnit: f.pricingUnit,
              popular: f.popular,
              required: f.required,
              category: f.category,
            })),
          }));
          setFeatureCategories(convertedFeatures);
          setExpandedCategories(convertedFeatures.map((cat) => cat.id));
        } else {
          // Fallback to hardcoded features if API returns empty or fails
          setFeatureCategories(fallbackFeatureCategories);
          setExpandedCategories(fallbackFeatureCategories.map((cat) => cat.id));
        }
      } catch (error) {
        console.error("Failed to load features from API, using fallback:", error);
        // Use hardcoded features as fallback
        setFeatureCategories(fallbackFeatureCategories);
        setExpandedCategories(fallbackFeatureCategories.map((cat) => cat.id));
      } finally {
        setLoadingFeatures(false);
      }
    }
    
    loadFeatures();
  }, []);

  const toggleFeature = (featureId: string) => {
    const feature = featureCategories
      .flatMap((cat) => cat.features)
      .find((f) => f.id === featureId);

    if (feature?.required) return; // Can't deselect required features

    if (selectedFeatures.includes(featureId)) {
      onFeaturesChange(selectedFeatures.filter((id) => id !== featureId));
    } else {
      onFeaturesChange([...selectedFeatures, featureId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Get all non-required features
  const allSelectableFeatures = useMemo(() => {
    return featureCategories
      .flatMap((cat) => cat.features)
      .filter((f) => !f.required)
      .map((f) => f.id);
  }, [featureCategories]);

  // Check if all selectable features are selected
  const areAllSelected = useMemo(() => {
    if (allSelectableFeatures.length === 0) return false;
    return allSelectableFeatures.every((id) => selectedFeatures.includes(id));
  }, [allSelectableFeatures, selectedFeatures]);

  // Toggle select all / deselect all
  const handleSelectAll = () => {
    if (areAllSelected) {
      // Deselect all (except required features)
      const requiredFeatures = featureCategories
        .flatMap((cat) => cat.features)
        .filter((f) => f.required)
        .map((f) => f.id);
      onFeaturesChange(requiredFeatures);
    } else {
      // Select all features (including required ones which should already be selected)
      const allFeatures = featureCategories
        .flatMap((cat) => cat.features)
        .map((f) => f.id);
      onFeaturesChange(Array.from(new Set(allFeatures))); // Use Set to avoid duplicates
    }
  };

  const costBreakdown = useMemo(() => {
    const breakdown: {
      oneTime: number;
      perTicket: number;
      perEvent: number;
      perMonth: number;
      items: Array<{ name: string; price: number; type: string }>;
    } = {
      oneTime: 0,
      perTicket: 0,
      perEvent: 0,
      perMonth: 0,
      items: [],
    };

    selectedFeatures.forEach((featureId) => {
      const feature = featureCategories
        .flatMap((cat) => cat.features)
        .find((f) => f.id === featureId);

      if (!feature) return;

      let price = 0;
      let displayPrice = 0;

      if (feature.pricingType === "one_time") {
        price = feature.basePrice;
        displayPrice = feature.basePrice;
        breakdown.oneTime += price;
      } else if (feature.pricingType === "per_ticket") {
        price = feature.basePrice * estimatedTickets;
        displayPrice = feature.basePrice;
        breakdown.perTicket += price;
      } else if (feature.pricingType === "per_event") {
        price = feature.basePrice * eventDays;
        displayPrice = feature.basePrice;
        breakdown.perEvent += price;
      } else if (feature.pricingType === "per_month") {
        price = feature.basePrice;
        displayPrice = feature.basePrice;
        breakdown.perMonth += price;
      }

      breakdown.items.push({
        name: feature.name,
        price: displayPrice,
        type: feature.pricingType,
      });
    });

    return breakdown;
  }, [selectedFeatures, estimatedTickets, eventDays, featureCategories]);

  const totalCost =
    costBreakdown.oneTime +
    costBreakdown.perTicket +
    costBreakdown.perEvent +
    costBreakdown.perMonth;

  // Auto-select required features when categories are loaded
  useEffect(() => {
    if (!loadingFeatures && featureCategories.length > 0) {
      const requiredFeatures = featureCategories
        .flatMap((cat) => cat.features)
        .filter((f) => f.required)
        .map((f) => f.id);
      const missingRequired = requiredFeatures.filter((id) => !selectedFeatures.includes(id));
      if (missingRequired.length > 0) {
        onFeaturesChange([...selectedFeatures, ...missingRequired]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFeatures, featureCategories]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Select Event Features</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose the features you need for your event. Required features are included automatically.
            </p>
          </div>
          <Button
            onClick={handleSelectAll}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loadingFeatures || allSelectableFeatures.length === 0}
          >
            {areAllSelected ? (
              <>
                <CheckSquare className="size-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="size-4" />
                Select All
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Features List */}
        <div className="lg:col-span-2 space-y-4">
          {featureCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {expandedCategories.includes(category.id) ? "−" : "+"}
                </span>
              </button>

              {expandedCategories.includes(category.id) && (
                <div className="mt-4 space-y-3">
                  {category.features.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature.id);
                    const priceText =
                      feature.basePrice === 0
                        ? "Free"
                        : feature.pricingType === "one_time"
                        ? `KES ${feature.basePrice.toLocaleString()}`
                        : feature.pricingType === "per_ticket"
                        ? `KES ${feature.basePrice.toLocaleString()}/${feature.pricingUnit || "ticket"}`
                        : feature.pricingType === "per_event"
                        ? `KES ${feature.basePrice.toLocaleString()}/${feature.pricingUnit || "event"}`
                        : `KES ${feature.basePrice.toLocaleString()}/${feature.pricingUnit || "month"}`;

                    return (
                      <div
                        key={feature.id}
                        className={`relative flex items-start gap-4 rounded-lg border p-4 transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        } ${feature.required ? "bg-amber-50 border-amber-200" : ""}`}
                      >
                        <button
                          onClick={() => toggleFeature(feature.id)}
                          disabled={feature.required}
                          className={`mt-0.5 ${
                            feature.required ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="size-5 text-slate-900" fill="currentColor" />
                          ) : (
                            <Circle className="size-5 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor={feature.id}
                                  className={`text-sm font-semibold ${
                                    feature.required ? "text-amber-900" : "text-slate-900"
                                  }`}
                                >
                                  {feature.name}
                                  {feature.required && (
                                    <span className="ml-2 text-xs font-normal text-amber-600">
                                      (Required)
                                    </span>
                                  )}
                                  {feature.popular && (
                                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                      <Sparkles className="size-3" />
                                      Popular
                                    </span>
                                  )}
                                </Label>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-sm font-semibold text-slate-900">{priceText}</div>
                              {feature.pricingType === "per_ticket" && feature.basePrice > 0 && (
                                <div className="mt-1 text-xs text-slate-500">
                                  ~KES{" "}
                                  {(feature.basePrice * estimatedTickets).toLocaleString()} for{" "}
                                  {estimatedTickets} tickets
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cost Breakdown Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="size-5 text-slate-900" />
              <h3 className="text-lg font-semibold text-slate-900">Cost Breakdown</h3>
            </div>

            <div className="space-y-4">
              {costBreakdown.oneTime > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    One-Time Fees
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    KES {costBreakdown.oneTime.toLocaleString()}
                  </div>
                </div>
              )}

              {costBreakdown.perTicket > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Per-Ticket Fees
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({estimatedTickets} tickets)
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    KES {costBreakdown.perTicket.toLocaleString()}
                  </div>
                </div>
              )}

              {costBreakdown.perEvent > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Per-Event Fees
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({eventDays} {eventDays === 1 ? "day" : "days"})
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    KES {costBreakdown.perEvent.toLocaleString()}
                  </div>
                </div>
              )}

              {costBreakdown.perMonth > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Monthly Fees
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    KES {costBreakdown.perMonth.toLocaleString()}/month
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">Total Cost:</span>
                  <span className="text-2xl font-bold text-slate-900">
                    KES {totalCost.toLocaleString()}
                  </span>
                </div>
                {costBreakdown.perTicket > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Plus platform fees per ticket sold (5% + payment processing)
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 text-blue-600" />
                  <div className="text-xs text-blue-900">
                    <div className="font-semibold">Note:</div>
                    <div className="mt-1">
                      Platform fees (5% of ticket sales) and payment processing fees (2.9% + KES 5)
                      are charged separately on each transaction.
                    </div>
                  </div>
                </div>
              </div>

              {estimatedTickets && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs text-amber-900">
                    <div className="font-semibold">Estimated Tickets:</div>
                    <div className="mt-1">{estimatedTickets.toLocaleString()} tickets</div>
                  </div>
                </div>
              )}

              {onContinue && (
                <Button
                  onClick={onContinue}
                  className="mt-4 w-full"
                  size="lg"
                >
                  Continue to Event Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

