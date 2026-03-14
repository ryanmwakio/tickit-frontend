"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Crown,
  Award,
  Star,
  Users,
  GripVertical,
  Link as LinkIcon,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SponsorTier = "gold" | "silver" | "bronze" | "standard" | null;

type Sponsor = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  tier: SponsorTier;
  order: number;
};

const tierConfig: Record<
  NonNullable<SponsorTier>,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  gold: {
    label: "Gold Sponsor",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  silver: {
    label: "Silver Sponsor",
    icon: Award,
    color: "text-slate-500",
    bgColor: "bg-slate-50 border-slate-200",
  },
  bronze: {
    label: "Bronze Sponsor",
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
  },
  standard: {
    label: "Standard Sponsor",
    icon: Users,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
  },
};

type SponsorsManagerProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function SponsorsManager({ initialData, onDataChange }: SponsorsManagerProps = {}) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useTiers, setUseTiers] = useState(true);

  const handleAdd = () => {
    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}`,
      name: "",
      tier: useTiers ? "standard" : null,
      order: sponsors.length,
    };
    setSponsors([...sponsors, newSponsor]);
    setEditingId(newSponsor.id);
  };

  const handleUpdate = (id: string, updates: Partial<Sponsor>) => {
    setSponsors(sponsors.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDelete = (id: string) => {
    setSponsors(sponsors.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleLogoUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      handleUpdate(id, { logo: url });
    };
    reader.readAsDataURL(file);
  };

  const groupedSponsors = useTiers
    ? {
        gold: sponsors.filter((s) => s.tier === "gold").sort((a, b) => a.order - b.order),
        silver: sponsors.filter((s) => s.tier === "silver").sort((a, b) => a.order - b.order),
        bronze: sponsors.filter((s) => s.tier === "bronze").sort((a, b) => a.order - b.order),
        standard: sponsors.filter((s) => s.tier === "standard").sort((a, b) => a.order - b.order),
      }
    : { all: sponsors.sort((a, b) => a.order - b.order) };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Event Sponsors</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add sponsors and organize them by tier or keep them on the same level
        </p>
      </div>

      {/* Tier Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <Label className="text-sm font-semibold text-slate-900">Sponsor Ranking</Label>
          <p className="mt-1 text-xs text-slate-600">
            {useTiers
              ? "Organize sponsors by tier (Gold, Silver, Bronze, Standard)"
              : "All sponsors on the same level"}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Same Level</span>
          <input
            type="checkbox"
            checked={!useTiers}
            onChange={(e) => setUseTiers(!e.target.checked)}
            className="size-5 rounded border-slate-300"
          />
        </label>
      </div>

      {/* Add Sponsor Button */}
      <button
        onClick={handleAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Plus className="size-4" />
        Add Sponsor
      </button>

      {/* Sponsors List */}
      {sponsors.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Users className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">No sponsors added yet</p>
        </div>
      ) : useTiers ? (
        <div className="space-y-6">
          {(["gold", "silver", "bronze", "standard"] as const).map((tier) => {
            const tierSponsors = groupedSponsors[tier] ?? [];
            if (tierSponsors.length === 0) return null;

            const TierIcon = tierConfig[tier].icon;
            return (
              <div key={tier} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TierIcon className={`size-5 ${tierConfig[tier].color}`} />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {tierConfig[tier].label}s
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {tierSponsors.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tierSponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      isEditing={editingId === sponsor.id}
                      onEdit={() => setEditingId(sponsor.id)}
                      onCancel={() => setEditingId(null)}
                      onUpdate={(updates) => handleUpdate(sponsor.id, updates)}
                      onDelete={() => handleDelete(sponsor.id)}
                      onLogoUpload={(file) => handleLogoUpload(sponsor.id, file)}
                      useTiers={useTiers}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {((groupedSponsors as { all?: Sponsor[] }).all ?? []).map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              isEditing={editingId === sponsor.id}
              onEdit={() => setEditingId(sponsor.id)}
              onCancel={() => setEditingId(null)}
              onUpdate={(updates) => handleUpdate(sponsor.id, updates)}
              onDelete={() => handleDelete(sponsor.id)}
              onLogoUpload={(file) => handleLogoUpload(sponsor.id, file)}
              useTiers={useTiers}
            />
          ))}
        </div>
      )}

      {/* Editing Modal */}
      {editingId && (
        <SponsorEditor
          sponsor={sponsors.find((s) => s.id === editingId)!}
          onUpdate={(updates) => {
            handleUpdate(editingId, updates);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
          useTiers={useTiers}
          onLogoUpload={(file) => handleLogoUpload(editingId, file)}
        />
      )}
    </div>
  );
}

function SponsorCard({
  sponsor,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onLogoUpload,
  useTiers,
}: {
  sponsor: Sponsor;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<Sponsor>) => void;
  onDelete: () => void;
  onLogoUpload: (file: File) => void;
  useTiers: boolean;
}) {
  const tier = sponsor.tier ? tierConfig[sponsor.tier] : null;

  if (isEditing) {
    return (
      <SponsorEditor
        sponsor={sponsor}
        onUpdate={(updates) => {
          onUpdate(updates);
          onCancel();
        }}
        onCancel={onCancel}
        useTiers={useTiers}
        onLogoUpload={onLogoUpload}
      />
    );
  }

  return (
    <div
      className={`relative rounded-xl border-2 p-4 ${
        tier ? tier.bgColor : "border-slate-200 bg-white"
      }`}
    >
      {tier && (
        <div className="absolute right-2 top-2">
          <tier.icon className={`size-5 ${tier.color}`} />
        </div>
      )}

      {sponsor.logo ? (
        <div className="relative mb-3 h-24 w-full overflow-hidden rounded-lg bg-white">
          <Image
            src={sponsor.logo}
            alt={sponsor.name}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="mb-3 flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
          <span className="text-xs text-slate-400">No logo</span>
        </div>
      )}

      <h4 className="mb-1 font-semibold text-slate-900">{sponsor.name || "Untitled Sponsor"}</h4>
      {sponsor.description && (
        <p className="mb-2 text-xs text-slate-600 line-clamp-2">{sponsor.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Edit2 className="mr-1 inline size-3" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

function SponsorEditor({
  sponsor,
  onUpdate,
  onCancel,
  useTiers,
  onLogoUpload,
}: {
  sponsor: Sponsor;
  onUpdate: (updates: Partial<Sponsor>) => void;
  onCancel: () => void;
  useTiers: boolean;
  onLogoUpload: (file: File) => void;
}) {
  const [formData, setFormData] = useState({
    name: sponsor.name,
    website: sponsor.website || "",
    description: sponsor.description || "",
    tier: sponsor.tier || "standard",
  });

  return (
    <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        {sponsor.id.startsWith("sponsor-") && !sponsor.name ? "Add Sponsor" : "Edit Sponsor"}
      </h3>

      <div className="space-y-4">
        {useTiers && (
          <div>
            <Label>Sponsor Tier</Label>
            <Select
              value={formData.tier || "standard"}
              onValueChange={(value) => {
                const tier = value as NonNullable<SponsorTier>;
                setFormData({ ...formData, tier });
                onUpdate({ tier });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">Gold Sponsor</SelectItem>
                <SelectItem value="silver">Silver Sponsor</SelectItem>
                <SelectItem value="bronze">Bronze Sponsor</SelectItem>
                <SelectItem value="standard">Standard Sponsor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Sponsor Name *</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              onUpdate({ name: e.target.value });
            }}
            placeholder="Enter sponsor name"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Logo</Label>
          <div className="mt-1">
            {sponsor.logo ? (
              <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain" />
                <button
                  onClick={() => onUpdate({ logo: undefined })}
                  className="absolute right-2 top-2 rounded bg-red-500 p-1 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : null}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Upload className="size-4" />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoUpload(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <Label>Website</Label>
          <Input
            type="url"
            value={formData.website}
            onChange={(e) => {
              setFormData({ ...formData, website: e.target.value });
              onUpdate({ website: e.target.value });
            }}
            placeholder="https://example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              onUpdate({ description: e.target.value });
            }}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Brief description of the sponsor..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(formData)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

