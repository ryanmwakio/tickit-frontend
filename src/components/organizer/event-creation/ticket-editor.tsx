"use client";

import { useState } from "react";
import { Palette, Type, Image as ImageIcon, Layers, Layout, QrCode, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TicketTemplate = {
  id: string;
  name: string;
  layout: "vertical" | "horizontal";
  component: (props: { eventName?: string; venue?: string; date?: string; ticketNumber?: string }) => JSX.Element;
};

const TicketTemplatePreview = ({ 
  template, 
  eventName = "Event Name", 
  venue = "Venue Location",
  date = "Fri, Jan 15 • 7:00 PM",
  ticketNumber = "TIX-2024-001234"
}: { 
  template: TicketTemplate;
  eventName?: string;
  venue?: string;
  date?: string;
  ticketNumber?: string;
}) => {
  return <template.component eventName={eventName} venue={venue} date={date} ticketNumber={ticketNumber} />;
};

// Classic Vertical Template
const ClassicVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-slate-900 bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Admit One</div>
      <h3 className="mb-3 text-lg font-bold leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3" />
          <span>{venue}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-dashed border-slate-600 bg-slate-800/50 p-3">
      <div className="text-xs font-semibold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded bg-white">
        <QrCode className="size-8 text-slate-900" />
      </div>
    </div>
  </div>
);

// Modern Vertical Template
const ModernVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-blue-100">Tickit</div>
      <h3 className="mb-4 text-xl font-extrabold leading-tight">{eventName}</h3>
      <div className="space-y-2 text-xs">
        <div className="font-semibold">{date}</div>
        <div className="text-blue-100">{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between bg-white/20 p-3 backdrop-blur-sm">
      <div className="text-[10px] font-mono font-bold text-white">{ticketNumber}</div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
        <QrCode className="size-7 text-purple-600" />
      </div>
    </div>
  </div>
);

// Elegant Horizontal Template
const ElegantHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-amber-600 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-amber-100">Premium Event</div>
      <h3 className="mb-2 text-base font-bold">{eventName}</h3>
      <div className="text-[10px] text-amber-50">{date} • {venue}</div>
    </div>
    <div className="flex w-32 flex-col items-center justify-center border-l-2 border-dashed border-amber-400 bg-amber-700/30">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded bg-white">
        <QrCode className="size-8 text-amber-600" />
      </div>
      <div className="text-[9px] font-mono font-bold">{ticketNumber}</div>
    </div>
  </div>
);

// Minimal Template
const MinimalVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-4 border-slate-900 bg-white text-slate-900 shadow-xl">
    <div className="flex-1 p-5">
      <h3 className="mb-4 text-xl font-bold">{eventName}</h3>
      <div className="space-y-2 text-sm text-slate-600">
        <div>{date}</div>
        <div>{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-4 border-slate-900 bg-slate-50 p-4">
      <div className="text-xs font-mono font-semibold">{ticketNumber}</div>
      <QrCode className="size-10 text-slate-900" />
    </div>
  </div>
);

// Vibrant Template
const VibrantVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-pink-500 bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase">
        Live Event
      </div>
      <h3 className="mb-3 text-lg font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-medium">
        <div>{date}</div>
        <div className="text-pink-100">{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between bg-rose-700/50 p-3">
      <div className="text-xs font-bold">{ticketNumber}</div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
        <QrCode className="size-8 text-rose-600" />
      </div>
    </div>
  </div>
);

// Corporate Horizontal Template
const CorporateHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-300">Business Event</div>
      <h3 className="mb-2 text-base font-bold">{eventName}</h3>
      <div className="text-[10px] text-slate-200">{date} • {venue}</div>
    </div>
    <div className="flex w-28 flex-col items-center justify-center border-l-2 border-slate-500 bg-slate-700/50">
      <QrCode className="mb-1 size-9 text-white" />
      <div className="text-[9px] font-mono">{ticketNumber}</div>
    </div>
  </div>
);

// Festival Template
const FestivalVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-green-500 bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-green-100">Festival Pass</div>
      <h3 className="mb-3 text-xl font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-semibold">
        <div>{date}</div>
        <div className="text-green-100">{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between bg-teal-700/50 p-3">
      <div className="text-xs font-bold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <QrCode className="size-8 text-teal-600" />
      </div>
    </div>
  </div>
);

// Premium Template
const PremiumVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-amber-400 bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-900 shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-800">VIP Access</div>
      <h3 className="mb-3 text-lg font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-semibold text-amber-900">
        <div>{date}</div>
        <div>{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-amber-600 bg-amber-500/50 p-3">
      <div className="text-xs font-mono font-bold text-amber-900">{ticketNumber}</div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900">
        <QrCode className="size-8 text-amber-400" />
      </div>
    </div>
  </div>
);

// Artistic Horizontal Template
const ArtisticHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-purple-100">Art & Culture</div>
      <h3 className="mb-2 text-base font-black">{eventName}</h3>
      <div className="text-[10px] font-medium text-pink-100">{date} • {venue}</div>
    </div>
    <div className="flex w-28 flex-col items-center justify-center border-l-2 border-pink-400 bg-pink-600/50">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white">
        <QrCode className="size-7 text-pink-600" />
      </div>
      <div className="text-[9px] font-mono font-bold">{ticketNumber}</div>
    </div>
  </div>
);

// Silver Gradient Vertical Template
const SilverGradientVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-slate-300 bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 text-slate-900 shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Silver Pass</div>
      <h3 className="mb-3 text-lg font-bold leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Calendar className="size-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3" />
          <span>{venue}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-slate-400 bg-slate-200/50 p-3">
      <div className="text-xs font-semibold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-900">
        <QrCode className="size-8 text-slate-300" />
      </div>
    </div>
  </div>
);

// Gold Luxury Vertical Template
const GoldLuxuryVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-amber-500 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-300 text-slate-900 shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-amber-800">Gold Premium</div>
      <h3 className="mb-3 text-xl font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-semibold text-amber-900">
        <div>{date}</div>
        <div>{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-amber-600 bg-amber-500/50 p-3">
      <div className="text-xs font-mono font-bold text-amber-900">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
        <QrCode className="size-8 text-amber-400" />
      </div>
    </div>
  </div>
);

// Striped Vertical Template
const StripedVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="relative flex h-64 flex-col overflow-hidden rounded-lg border-2 border-indigo-600 bg-indigo-600 text-white shadow-xl">
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)"
    }} />
    <div className="relative flex-1 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider">Striped Design</div>
      <h3 className="mb-3 text-lg font-bold leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs">
        <div>{date}</div>
        <div>{venue}</div>
      </div>
    </div>
    <div className="relative flex items-center justify-between border-t-2 border-indigo-400 bg-indigo-700/50 p-3">
      <div className="text-xs font-semibold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded bg-white">
        <QrCode className="size-8 text-indigo-600" />
      </div>
    </div>
  </div>
);

// Barcode Horizontal Template
const BarcodeHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-slate-900 bg-white text-slate-900 shadow-xl">
    <div className="flex-1 p-4">
      <h3 className="mb-2 text-base font-bold">{eventName}</h3>
      <div className="text-[10px] text-slate-600">{date} • {venue}</div>
      <div className="mt-2 flex h-8 items-center gap-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-full w-1 bg-slate-900" style={{ height: `${30 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
    <div className="flex w-32 flex-col items-center justify-center border-l-2 border-slate-900 bg-slate-50">
      <QrCode className="size-10 text-slate-900" />
      <div className="mt-1 text-[9px] font-mono">{ticketNumber}</div>
    </div>
  </div>
);

// Retro Vertical Template
const RetroVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-4 border-red-600 bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-extrabold uppercase tracking-widest">Retro Ticket</div>
      <h3 className="mb-3 text-xl font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-bold">
        <div>{date}</div>
        <div>{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-4 border-dashed border-white bg-red-600/50 p-3">
      <div className="text-xs font-mono font-bold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white">
        <QrCode className="size-7 text-red-600" />
      </div>
    </div>
  </div>
);

// Neon Vertical Template
const NeonVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-cyan-500/50">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">Neon Nights</div>
      <h3 className="mb-3 text-xl font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-semibold">
        <div>{date}</div>
        <div className="text-cyan-100">{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-cyan-400 bg-purple-700/50 p-3">
      <div className="text-xs font-mono font-bold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400">
        <QrCode className="size-8 text-slate-900" />
      </div>
    </div>
  </div>
);

// Elegant Stripe Horizontal Template
const ElegantStripeHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="relative flex h-32 overflow-hidden rounded-lg border-2 border-rose-600 bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xl">
    <div className="absolute left-0 top-0 h-full w-2 bg-white/30" />
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider">Elegant</div>
      <h3 className="mb-2 text-base font-bold">{eventName}</h3>
      <div className="text-[10px]">{date} • {venue}</div>
    </div>
    <div className="flex w-28 flex-col items-center justify-center border-l-2 border-rose-400 bg-rose-700/50">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white">
        <QrCode className="size-7 text-rose-600" />
      </div>
      <div className="text-[9px] font-mono font-bold">{ticketNumber}</div>
    </div>
  </div>
);

// Sport Vertical Template
const SportVertical = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-64 flex-col overflow-hidden rounded-lg border-2 border-emerald-600 bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-2 text-xs font-extrabold uppercase tracking-widest">Sports Event</div>
      <h3 className="mb-3 text-xl font-black leading-tight">{eventName}</h3>
      <div className="space-y-1.5 text-xs font-bold">
        <div>{date}</div>
        <div className="text-emerald-100">{venue}</div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t-2 border-emerald-400 bg-emerald-700/50 p-3">
      <div className="text-xs font-bold">{ticketNumber}</div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
        <QrCode className="size-8 text-emerald-600" />
      </div>
    </div>
  </div>
);

// Music Horizontal Template
const MusicHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-violet-600 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-violet-100">Music Show</div>
      <h3 className="mb-2 text-base font-black">{eventName}</h3>
      <div className="text-[10px] font-medium text-violet-100">{date} • {venue}</div>
    </div>
    <div className="flex w-28 flex-col items-center justify-center border-l-2 border-violet-400 bg-violet-700/50">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white">
        <QrCode className="size-7 text-violet-600" />
      </div>
      <div className="text-[9px] font-mono font-bold">{ticketNumber}</div>
    </div>
  </div>
);

// Luxury Horizontal Template
const LuxuryHorizontal = ({ eventName, venue, date, ticketNumber }: any) => (
  <div className="flex h-32 overflow-hidden rounded-lg border-2 border-amber-500 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-slate-900 shadow-xl">
    <div className="flex-1 p-4">
      <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-800">Luxury Access</div>
      <h3 className="mb-2 text-base font-black">{eventName}</h3>
      <div className="text-[10px] font-semibold text-amber-900">{date} • {venue}</div>
    </div>
    <div className="flex w-28 flex-col items-center justify-center border-l-2 border-amber-600 bg-amber-600/50">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
        <QrCode className="size-7 text-amber-400" />
      </div>
      <div className="text-[9px] font-mono font-bold text-slate-900">{ticketNumber}</div>
    </div>
  </div>
);

const ticketTemplates: TicketTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    layout: "vertical",
    component: ClassicVertical,
  },
  {
    id: "modern",
    name: "Modern",
    layout: "vertical",
    component: ModernVertical,
  },
  {
    id: "elegant",
    name: "Elegant",
    layout: "horizontal",
    component: ElegantHorizontal,
  },
  {
    id: "minimal",
    name: "Minimal",
    layout: "vertical",
    component: MinimalVertical,
  },
  {
    id: "vibrant",
    name: "Vibrant",
    layout: "vertical",
    component: VibrantVertical,
  },
  {
    id: "corporate",
    name: "Corporate",
    layout: "horizontal",
    component: CorporateHorizontal,
  },
  {
    id: "festival",
    name: "Festival",
    layout: "vertical",
    component: FestivalVertical,
  },
  {
    id: "premium",
    name: "Premium",
    layout: "vertical",
    component: PremiumVertical,
  },
  {
    id: "artistic",
    name: "Artistic",
    layout: "horizontal",
    component: ArtisticHorizontal,
  },
  {
    id: "silver",
    name: "Silver Gradient",
    layout: "vertical",
    component: SilverGradientVertical,
  },
  {
    id: "gold",
    name: "Gold Luxury",
    layout: "vertical",
    component: GoldLuxuryVertical,
  },
  {
    id: "striped",
    name: "Striped",
    layout: "vertical",
    component: StripedVertical,
  },
  {
    id: "barcode",
    name: "Barcode",
    layout: "horizontal",
    component: BarcodeHorizontal,
  },
  {
    id: "retro",
    name: "Retro",
    layout: "vertical",
    component: RetroVertical,
  },
  {
    id: "neon",
    name: "Neon",
    layout: "vertical",
    component: NeonVertical,
  },
  {
    id: "elegant-stripe",
    name: "Elegant Stripe",
    layout: "horizontal",
    component: ElegantStripeHorizontal,
  },
  {
    id: "sport",
    name: "Sports",
    layout: "vertical",
    component: SportVertical,
  },
  {
    id: "music",
    name: "Music",
    layout: "horizontal",
    component: MusicHorizontal,
  },
  {
    id: "luxury",
    name: "Luxury",
    layout: "horizontal",
    component: LuxuryHorizontal,
  },
];

type DesignElement = {
  id: string;
  type: "text" | "image" | "shape" | "barcode" | "qrcode" | "gradient" | "stripe";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  imageUrl?: string;
  gradientType?: "silver" | "gold" | "custom";
  stripePattern?: "diagonal" | "horizontal" | "vertical";
};

type TicketDesignEditorProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function TicketDesignEditor({ initialData, onDataChange }: TicketDesignEditorProps = {}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<"select" | "text" | "image">("select");
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setElements([]);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === "text") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newElement: DesignElement = {
        id: `text-${Date.now()}`,
        type: "text",
        content: "Double click to edit",
        x,
        y,
        width: 200,
        height: 40,
        fontSize: 16,
        color: "#000000",
        fontFamily: "Inter",
      };
      setElements([...elements, newElement]);
      setSelectedTool("select");
      setSelectedElement(newElement.id);
    }
  };

  const selectedTemplateData = ticketTemplates.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Ticket Design Studio</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a template or design your ticket from scratch with our visual editor
        </p>
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Choose Template</h3>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {ticketTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition ${
                selectedTemplate === template.id
                  ? "border-slate-900 ring-2 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <TicketTemplatePreview template={template} />
              <p className="mt-3 text-sm font-semibold text-slate-900">{template.name}</p>
              <p className="mt-1 text-xs text-slate-500 capitalize">
                {template.layout} layout
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedTemplate && selectedTemplateData && (
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          {/* Toolbar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Tools</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTool("select")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedTool === "select"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Layout className="mr-2 inline size-4" />
                  Select
                </button>
                <button
                  onClick={() => setSelectedTool("text")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedTool === "text"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Type className="mr-2 inline size-4" />
                  Text
                </button>
                <button
                  onClick={() => setSelectedTool("image")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    selectedTool === "image"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ImageIcon className="mr-2 inline size-4" />
                  Image
                </button>
              </div>
            </div>

            {/* Properties Panel */}
            {selectedElement && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Properties</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="block text-xs font-semibold text-slate-700">
                      Font Size
                    </Label>
                    <Input
                      type="number"
                      min="8"
                      max="72"
                      defaultValue="16"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-slate-700">Color</Label>
                    <Input
                      type="color"
                      defaultValue="#000000"
                      className="mt-1 h-10 w-full cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-slate-700">
                      Font Family
                    </Label>
                    <Select defaultValue="Inter">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Design Canvas</h4>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Preview
                </button>
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Export
                </button>
              </div>
            </div>
            <div
              onClick={handleCanvasClick}
              className={`relative mx-auto w-full max-w-sm cursor-crosshair overflow-hidden rounded-lg border-2 border-slate-300 bg-white shadow-xl ${
                selectedTemplateData.layout === "horizontal" ? "aspect-[16/9]" : "aspect-[2/3]"
              }`}
            >
              <TicketTemplatePreview template={selectedTemplateData} />
              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                  className={`absolute cursor-move border-2 ${
                    selectedElement === element.id
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                  }}
                >
                  {element.type === "text" && (
                    <div
                      style={{
                        fontSize: `${element.fontSize}px`,
                        color: element.color,
                        fontFamily: element.fontFamily,
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                </div>
              ))}
              {selectedTool === "text" && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5">
                  <p className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                    Click to add text
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedTemplate && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <Layers className="mx-auto size-16 text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">
            Select a template above to start designing your ticket
          </p>
        </div>
      )}
    </div>
  );
}
