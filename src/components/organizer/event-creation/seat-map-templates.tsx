"use client";

import { useState } from "react";
import { Map, Layout, Grid, Circle } from "lucide-react";

type SeatMapTemplate = {
  id: string;
  name: string;
  description: string;
  layout: "theater" | "arena" | "stadium" | "conference" | "outdoor" | "club" | "auditorium" | "ballroom" | "custom";
  icon: React.ReactNode;
  sections: Array<{ name: string; color: string; price: number }>;
  defaultSeats: Array<{ x: number; y: number; row: string; number: number; section: string }>;
};

export const seatMapTemplates: SeatMapTemplate[] = [
  {
    id: "theater",
    name: "Theater Style",
    description: "Traditional theater with curved rows facing stage",
    layout: "theater",
    icon: <Layout className="size-5" />,
    sections: [
      { name: "VIP", color: "#f97316", price: 5000 },
      { name: "Premium", color: "#3b82f6", price: 3000 },
      { name: "Standard", color: "#10b981", price: 2000 },
    ],
    defaultSeats: [
      // VIP rows
      ...Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 8 }, (_, seat) => ({
          x: 35 + seat * 4,
          y: 15 + row * 6,
          row: String.fromCharCode(65 + row),
          number: seat + 1,
          section: "VIP",
        }))
      ).flat(),
      // Premium rows
      ...Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 12 }, (_, seat) => ({
          x: 25 + seat * 4,
          y: 35 + row * 6,
          row: String.fromCharCode(68 + row),
          number: seat + 1,
          section: "Premium",
        }))
      ).flat(),
      // Standard rows
      ...Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 16 }, (_, seat) => ({
          x: 15 + seat * 4.5,
          y: 70 + row * 5,
          row: String.fromCharCode(73 + row),
          number: seat + 1,
          section: "Standard",
        }))
      ).flat(),
    ],
  },
  {
    id: "arena",
    name: "Arena/Concert",
    description: "360-degree seating around central stage",
    layout: "arena",
    icon: <Circle className="size-5" />,
    sections: [
      { name: "Front Row", color: "#f97316", price: 6000 },
      { name: "Middle Ring", color: "#3b82f6", price: 3500 },
      { name: "Upper Ring", color: "#10b981", price: 2000 },
    ],
    defaultSeats: [],
  },
  {
    id: "stadium",
    name: "Stadium Style",
    description: "Large venue with tiered seating sections",
    layout: "stadium",
    icon: <Grid className="size-5" />,
    sections: [
      { name: "VIP Box", color: "#f97316", price: 8000 },
      { name: "Lower Bowl", color: "#3b82f6", price: 4000 },
      { name: "Upper Bowl", color: "#10b981", price: 2500 },
      { name: "General", color: "#6366f1", price: 1500 },
    ],
    defaultSeats: [],
  },
  {
    id: "conference",
    name: "Conference Hall",
    description: "Rectangular rows for business events",
    layout: "conference",
    icon: <Map className="size-5" />,
    sections: [
      { name: "Front Section", color: "#f97316", price: 5000 },
      { name: "Middle Section", color: "#3b82f6", price: 3000 },
      { name: "Back Section", color: "#10b981", price: 2000 },
    ],
    defaultSeats: [],
  },
  {
    id: "outdoor",
    name: "Outdoor Festival",
    description: "Open space with standing and seated areas",
    layout: "outdoor",
    icon: <Map className="size-5" />,
    sections: [
      { name: "VIP Area", color: "#f97316", price: 6000 },
      { name: "Standing", color: "#3b82f6", price: 2500 },
      { name: "General", color: "#10b981", price: 1500 },
    ],
    defaultSeats: [],
  },
  {
    id: "club",
    name: "Nightclub/Bar",
    description: "Intimate venue with tables and standing",
    layout: "club",
    icon: <Layout className="size-5" />,
    sections: [
      { name: "VIP Tables", color: "#f97316", price: 8000 },
      { name: "Standard Tables", color: "#3b82f6", price: 4000 },
      { name: "Standing", color: "#10b981", price: 1500 },
    ],
    defaultSeats: [],
  },
  {
    id: "auditorium",
    name: "Auditorium",
    description: "Large hall with sloped seating",
    layout: "auditorium",
    icon: <Layout className="size-5" />,
    sections: [
      { name: "Orchestra", color: "#f97316", price: 5000 },
      { name: "Mezzanine", color: "#3b82f6", price: 3500 },
      { name: "Balcony", color: "#10b981", price: 2000 },
    ],
    defaultSeats: [],
  },
  {
    id: "ballroom",
    name: "Ballroom",
    description: "Elegant space with round tables",
    layout: "ballroom",
    icon: <Circle className="size-5" />,
    sections: [
      { name: "Head Table", color: "#f97316", price: 10000 },
      { name: "VIP Tables", color: "#f97316", price: 6000 },
      { name: "Standard Tables", color: "#3b82f6", price: 4000 },
    ],
    defaultSeats: [],
  },
  {
    id: "custom",
    name: "Custom Layout",
    description: "Start from scratch and design your own",
    layout: "custom",
    icon: <Map className="size-5" />,
    sections: [
      { name: "Section 1", color: "#3b82f6", price: 2000 },
    ],
    defaultSeats: [],
  },
];

