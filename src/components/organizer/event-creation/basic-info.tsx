"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  MapPin,
  Tag,
  FileText,
  Clock,
  Plus,
  Trash2,
  GripVertical,
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
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { fetchEvents } from "@/lib/events-api";

type TimelineItem = {
  id: string;
  label: string;
  date: string;
  time: string;
  description?: string;
};

const defaultTimelineItems: Omit<TimelineItem, "id">[] = [
  { label: "Gates Open", date: "", time: "", description: "" },
  { label: "Event Start", date: "", time: "", description: "" },
  { label: "Event End", date: "", time: "", description: "" },
];

type EventBasicInfoProps = {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    location?: string;
    region?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    categories?: string[];
    tags?: string[];
    summary?: string;
    price?: string;
    timeline?: Array<{
      id: string;
      label: string;
      date: string;
      time: string;
      description?: string;
    }>;
  };
  onDataChange?: (updates: Partial<EventBasicInfoProps["initialData"]>) => void;
};

export function EventBasicInfo({
  initialData,
  onDataChange,
}: EventBasicInfoProps = {}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    region: initialData?.region || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    summary: initialData?.summary || "",
    price: initialData?.price || "",
  });

  const [dateError, setDateError] = useState<string>("");

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(
    initialData?.timeline && initialData.timeline.length > 0
      ? initialData.timeline.map((item) => ({
          ...item,
          id: item.id || `timeline-${Date.now()}-${Math.random()}`,
        }))
      : defaultTimelineItems.map((item, index) => ({
          ...item,
          id: `timeline-${index}`,
        })),
  );

  // Track if we're updating from initialData to avoid triggering onDataChange
  const isInitialMount = useRef(true);
  const isUpdatingFromParent = useRef(false);
  const lastSyncedFormDataRef = useRef<string>("");
  const lastSyncedTimelineRef = useRef<string>("");

  // Update form data when initialData changes (only on mount or when ID changes)
  useEffect(() => {
    if (!initialData) return;

    // Only update from parent if this is initial mount or if the data is significantly different
    const currentFormDataStr = JSON.stringify(formData);
    const newFormData = {
      title: initialData.title || "",
      description: initialData.description || "",
      location: initialData.location || "",
      region: initialData.region || "",
      startDate: initialData.startDate || "",
      endDate: initialData.endDate || "",
      startTime: initialData.startTime || "",
      endTime: initialData.endTime || "",
      categories: initialData.categories || [],
      tags: initialData.tags || [],
      summary: initialData.summary || "",
      price: initialData.price || "",
    };
    const newFormDataStr = JSON.stringify(newFormData);

    // Only update if data is different and we haven't just synced this data
    if (
      isInitialMount.current ||
      (newFormDataStr !== currentFormDataStr &&
        newFormDataStr !== lastSyncedFormDataRef.current)
    ) {
      isUpdatingFromParent.current = true;
      setFormData(newFormData);
      lastSyncedFormDataRef.current = newFormDataStr;
    }

    if (initialData.timeline && initialData.timeline.length > 0) {
      const newTimeline = initialData.timeline.map((item) => ({
        ...item,
        id: item.id || `timeline-${Date.now()}-${Math.random()}`,
      }));
      const newTimelineStr = JSON.stringify(newTimeline);
      const currentTimelineStr = JSON.stringify(timelineItems);

      if (
        isInitialMount.current ||
        (newTimelineStr !== currentTimelineStr &&
          newTimelineStr !== lastSyncedTimelineRef.current)
      ) {
        setTimelineItems(newTimeline);
        lastSyncedTimelineRef.current = newTimelineStr;
      }
    }

    // Reset flag after state updates
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
    }
  }, [initialData?.id]); // Only update when ID changes (new event loaded)

  // Sync formData changes to parent (only when user makes changes, not from parent updates)
  useEffect(() => {
    if (isInitialMount.current || isUpdatingFromParent.current) {
      return;
    }

    const currentFormDataStr = JSON.stringify(formData);
    // Only sync if data actually changed from what we last synced
    if (currentFormDataStr !== lastSyncedFormDataRef.current && onDataChange) {
      lastSyncedFormDataRef.current = currentFormDataStr;
      onDataChange(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Sync timelineItems changes to parent
  useEffect(() => {
    if (isInitialMount.current || isUpdatingFromParent.current) {
      return;
    }

    const currentTimelineStr = JSON.stringify(timelineItems);
    // Only sync if timeline actually changed from what we last synced
    if (currentTimelineStr !== lastSyncedTimelineRef.current && onDataChange) {
      lastSyncedTimelineRef.current = currentTimelineStr;
      onDataChange({ timeline: timelineItems });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineItems]);

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from existing events
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const response = await fetchEvents({ limit: 100 });
        const eventsArray = Array.isArray(response)
          ? response
          : response?.data || [];

        const categorySet = new Set<string>();
        eventsArray.forEach((event: any) => {
          if (event.category) {
            categorySet.add(event.category);
          }
        });

        // Add default categories if none exist
        const defaultCategories = [
          "Nightlife",
          "Afro house",
          "Corporate",
          "Family & lifestyle",
          "Wellness",
          "Food & culture",
          "Campus life",
          "Community impact",
          "Creator exclusives",
          "Weekend escapes",
        ];

        const categories = Array.from(categorySet);
        setAllCategories(
          categories.length > 0 ? categories : defaultCategories,
        );
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to default categories
        setAllCategories([
          "Nightlife",
          "Afro house",
          "Corporate",
          "Family & lifestyle",
          "Wellness",
          "Food & culture",
          "Campus life",
          "Community impact",
          "Creator exclusives",
          "Weekend escapes",
        ]);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const availableCategories = useMemo(() => {
    return allCategories.sort((a, b) => a.localeCompare(b));
  }, [allCategories]);

  const handleInputChange = (field: string, value: string | string[]) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };

    // Validate dates when start or end date changes
    if (field === "startDate" || field === "endDate") {
      const startDate =
        field === "startDate" ? (value as string) : newFormData.startDate;
      const endDate =
        field === "endDate" ? (value as string) : newFormData.endDate;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
          setDateError("End date cannot be earlier than start date");
          return; // Don't update form data if validation fails
        } else {
          setDateError("");
        }
      } else {
        setDateError("");
      }
    }

    setFormData(newFormData);
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Event Information
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the basic details for your event
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Event Title */}
          <div>
            <Label className="block text-sm font-semibold text-slate-900">
              Event Title *
            </Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter event title"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="block text-sm font-semibold text-slate-900">
              Description *
            </Label>
            <div className="mt-2">
              <RichTextEditor
                content={formData.description}
                onChange={(content) =>
                  handleInputChange("description", content)
                }
                placeholder="Describe your event in detail using the formatting toolbar above..."
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="size-4" />
              Short Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              placeholder="Brief summary (appears on event cards)"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="size-4" />
              Location *
            </Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Venue name and address"
              className="mt-2"
            />
          </div>

          {/* Region */}
          <div>
            <Label className="block text-sm font-semibold text-slate-900">
              Region *
            </Label>
            <Select
              value={formData.region}
              onValueChange={(value) => handleInputChange("region", value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nairobi">Nairobi</SelectItem>
                <SelectItem value="Coast">Coast</SelectItem>
                <SelectItem value="Rift Valley">Rift Valley</SelectItem>
                <SelectItem value="Mount Kenya">Mount Kenya</SelectItem>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="Western">Western</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Calendar className="size-4" />
              Date & Time *
            </label>
            <div className="mt-2 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(value) => handleInputChange("startDate", value)}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <Label className="block text-xs text-slate-600">
                    Start Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(value) => handleInputChange("endDate", value)}
                    placeholder="Select end date"
                  />
                </div>
                <div>
                  <Label className="block text-xs text-slate-600">
                    End Time
                  </Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              {dateError && (
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {dateError}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label className="block text-sm font-semibold text-slate-900">
              Starting Price
            </Label>
            <Input
              type="text"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="e.g., From KES 1,000"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Tag className="size-4" />
          Categories
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                formData.categories.includes(category)
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-slate-900">
          Tags
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </span>
          ))}
          <Input
            type="text"
            placeholder="Add tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagAdd(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Event Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Clock className="size-5" />
              Event Timeline
            </label>
            <p className="mt-1 text-sm text-slate-600">
              Set important milestones for your event (e.g., gates open, event
              start, intermission)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItem = {
                id: `timeline-${Date.now()}`,
                label: "",
                date: "",
                time: "",
                description: "",
              };
              const updated = [...timelineItems, newItem];
              setTimelineItems(updated);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add Timeline Item
          </Button>
        </div>

        <div className="space-y-4">
          {timelineItems.map((item, index) => (
            <TimelineItemEditor
              key={item.id}
              item={item}
              index={index}
              onUpdate={(updates) => {
                const updated = timelineItems.map((t) =>
                  t.id === item.id ? { ...t, ...updates } : t,
                );
                setTimelineItems(updated);
              }}
              onDelete={() => {
                const updated = timelineItems.filter((t) => t.id !== item.id);
                setTimelineItems(updated);
              }}
              onMoveUp={
                index > 0
                  ? () => {
                      const newItems = [...timelineItems];
                      const temp = newItems[index];
                      newItems[index] = newItems[index - 1];
                      newItems[index - 1] = temp;
                      setTimelineItems(newItems);
                    }
                  : undefined
              }
              onMoveDown={
                index < timelineItems.length - 1
                  ? () => {
                      const newItems = [...timelineItems];
                      const temp = newItems[index];
                      newItems[index] = newItems[index + 1];
                      newItems[index + 1] = temp;
                      setTimelineItems(newItems);
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {timelineItems.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Clock className="mx-auto size-12 text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-900">
              No timeline items
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Add timeline milestones to help attendees know what to expect
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                const newItem = {
                  id: `timeline-${Date.now()}`,
                  label: "",
                  date: "",
                  time: "",
                  description: "",
                };
                setTimelineItems([newItem]);
              }}
            >
              <Plus className="mr-2 size-4" />
              Add First Timeline Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItemEditor({
  item,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: TimelineItem;
  index: number;
  onUpdate: (updates: Partial<TimelineItem>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const commonLabels = [
    "Gates Open",
    "Doors Open",
    "Event Start",
    "Main Act",
    "Intermission",
    "Last Call",
    "Event End",
    "Gates Close",
    "After Party",
    "VIP Entrance",
    "General Admission",
    "Concert Begins",
    "Meet & Greet",
    "Sound Check",
  ];

  const [showCustomLabel, setShowCustomLabel] = useState(
    !commonLabels.includes(item.label),
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                title="Move up"
              >
                <GripVertical className="size-4 rotate-180" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                title="Move down"
              >
                <GripVertical className="size-4" />
              </button>
            )}
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {index + 1}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <Label className="text-sm font-semibold text-slate-900">
            Event Label *
          </Label>
          {!showCustomLabel ? (
            <div className="mt-2 space-y-2">
              <Select
                value={item.label}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomLabel(true);
                  } else {
                    onUpdate({ label: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter custom label" />
                </SelectTrigger>
                <SelectContent>
                  {commonLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Label</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <Input
                type="text"
                value={item.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="e.g., Gates Open, VIP Reception, etc."
                className="w-full"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomLabel(false);
                  if (!commonLabels.includes(item.label)) {
                    onUpdate({ label: "" });
                  }
                }}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Choose from common labels
              </button>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <DatePicker
              label="Date"
              value={item.date}
              onChange={(value) => onUpdate({ date: value })}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label className="block text-sm font-semibold text-slate-900">
              Time *
            </Label>
            <Input
              type="time"
              value={item.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        {/* Description (Optional) */}
        <div>
          <Label className="text-sm font-semibold text-slate-900">
            Description{" "}
            <span className="text-xs font-normal text-slate-500">
              (Optional)
            </span>
          </Label>
          <textarea
            value={item.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add any additional details about this milestone..."
            rows={2}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
