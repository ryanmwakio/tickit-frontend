"use client";

import { useState, useRef, useCallback } from "react";
import { Map, Plus, Minus, RotateCcw, Save, Download, Box, Layout, Layers } from "lucide-react";
import { SeatMap3DView } from "./seat-map-3d-view";
import { seatMapTemplates } from "./seat-map-templates";

type Seat = {
  id: string;
  x: number;
  y: number;
  row: string;
  number: number;
  section: string;
  price: number;
  status: "available" | "sold" | "reserved";
  color?: string;
};

type Section = {
  id: string;
  name: string;
  color: string;
  price: number;
};

type SeatMapCreatorProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function SeatMapCreator({ initialData, onDataChange }: SeatMapCreatorProps = {}) {
  const [sections, setSections] = useState<Section[]>([
    { id: "1", name: "VIP", color: "#f97316", price: 5000 },
    { id: "2", name: "Standard", color: "#3b82f6", price: 2000 },
    { id: "3", name: "General", color: "#10b981", price: 1000 },
  ]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("1");
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d" | "split">("split");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ x: 50, y: 50, width: 300, height: 100 });

  const handleAddSeat = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || !isDrawing) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const section = sections.find((s) => s.id === selectedSection);
      if (!section) return;

      const newSeat: Seat = {
        id: `seat-${Date.now()}-${Math.random()}`,
        x,
        y,
        row: String.fromCharCode(65 + Math.floor(seats.length / 20)),
        number: (seats.length % 20) + 1,
        section: section.name,
        price: section.price,
        status: "available",
        color: section.color,
      };

      setSeats([...seats, newSeat]);
    },
    [canvasRef, isDrawing, selectedSection, sections, seats]
  );

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  const handleAddSection = () => {
    const newSection: Section = {
      id: `${sections.length + 1}`,
      name: `Section ${sections.length + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      price: 1000,
    };
    setSections([...sections, newSection]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Seat Map Creator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Design your venue layout by adding seats, sections, and pricing zones. View your design in 2D, 3D, or side-by-side.
        </p>
      </div>

      {/* Template Selection */}
      {seats.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Choose a Template</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seatMapTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSections(
                    template.sections.map((s, idx) => ({
                      id: `${idx + 1}`,
                      name: s.name,
                      color: s.color,
                      price: s.price,
                    }))
                  );
                  setSelectedSection("1");
                  setSeats(
                    template.defaultSeats.map((seat) => ({
                      id: `seat-${seat.row}-${seat.number}`,
                      x: seat.x,
                      y: seat.y,
                      row: seat.row,
                      number: seat.number,
                      section: seat.section,
                      price: template.sections.find((s) => s.name === seat.section)?.price || 2000,
                      status: "available" as const,
                      color: template.sections.find((s) => s.name === seat.section)?.color || "#3b82f6",
                    }))
                  );
                }}
                className="group rounded-xl border-2 border-slate-200 p-4 text-left transition hover:border-slate-400"
              >
                <div className="mb-3 flex items-center gap-2 text-slate-600">
                  {template.icon}
                  <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                </div>
                <p className="text-xs text-slate-600">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.sections.map((section) => (
                    <span
                      key={section.name}
                      className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: section.color }}
                      />
                      {section.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* View Mode */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">View Mode</h3>
            <div className="space-y-2">
              <button
                onClick={() => setViewMode("2d")}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  viewMode === "2d"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layout className="mr-2 inline size-4" />
                2D View
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  viewMode === "3d"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Box className="mr-2 inline size-4" />
                3D View
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  viewMode === "split"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Map className="mr-2 inline size-4" />
                Split View
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Sections</h3>
              <button
                onClick={handleAddSection}
                className="rounded-lg bg-slate-900 p-1.5 text-white transition hover:bg-slate-800"
                title="Add section"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition ${
                    selectedSection === section.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded"
                      style={{ backgroundColor: section.color }}
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {section.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    KES {section.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  isDrawing
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Map className="mr-2 inline size-4" />
                {isDrawing ? "Drawing Mode" : "Add Seats"}
              </button>
              <button
                onClick={() => setSeats([])}
                className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <RotateCcw className="mr-2 inline size-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Zoom Controls */}
          {viewMode !== "3d" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Zoom</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
                >
                  <Minus className="size-4" />
                </button>
                <span className="flex-1 text-center text-sm font-semibold text-slate-900">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Seats</span>
                <span className="font-semibold text-slate-900">{seats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sections</span>
                <span className="font-semibold text-slate-900">{sections.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="space-y-6">
          {/* 2D View or Split View */}
          {(viewMode === "2d" || viewMode === "split") && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">2D Design Canvas</h3>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Download className="mr-1.5 inline size-3" />
                    Export
                  </button>
                  <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800">
                    <Save className="mr-1.5 inline size-3" />
                    Save
                  </button>
                </div>
              </div>
              <div
                ref={canvasRef}
                onClick={handleAddSeat}
                className={`relative w-full overflow-auto rounded-lg border-2 border-slate-300 bg-white ${
                  viewMode === "split" ? "h-[300px]" : "h-[600px]"
                }`}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  cursor: isDrawing ? "crosshair" : "default",
                }}
              >
                {/* Stage */}
                <div
                  className="absolute rounded-lg border-2 border-slate-900 bg-gradient-to-b from-slate-800 to-slate-900 text-white"
                  style={{
                    left: `${stageDimensions.x}%`,
                    top: `${stageDimensions.y}px`,
                    width: `${stageDimensions.width}px`,
                    height: `${stageDimensions.height}px`,
                  }}
                >
                  <div className="flex h-full items-center justify-center text-sm font-semibold">
                    STAGE
                  </div>
                </div>

                {/* Seats */}
                {seats.map((seat) => {
                  const section = sections.find((s) => s.name === seat.section);
                  return (
                    <div
                      key={seat.id}
                      className="absolute flex items-center justify-center rounded border-2 border-slate-900 text-[10px] font-semibold transition hover:scale-110"
                      style={{
                        left: `${seat.x}%`,
                        top: `${seat.y}%`,
                        width: "24px",
                        height: "24px",
                        backgroundColor:
                          seat.status === "available"
                            ? section?.color || "#3b82f6"
                            : seat.status === "sold"
                            ? "#ef4444"
                            : "#f59e0b",
                        color: "#ffffff",
                      }}
                      title={`${seat.row}${seat.number} - ${seat.section} - KES ${seat.price.toLocaleString()}`}
                    >
                      {seat.row}
                    </div>
                  );
                })}

                {isDrawing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5">
                    <p className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                      Click to add seats • Selected:{" "}
                      {sections.find((s) => s.id === selectedSection)?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3D View or Split View */}
          {(viewMode === "3d" || viewMode === "split") && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">3D Preview</h3>
                <p className="text-xs text-slate-500">Interactive 3D visualization</p>
              </div>
              <div className={`h-full w-full ${viewMode === "split" ? "h-[300px]" : "h-[600px]"}`}>
                <SeatMap3DView seats={seats} sections={sections} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
