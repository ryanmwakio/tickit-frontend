"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Type,
  Image as ImageIcon,
  Layout,
  Palette,
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Settings,
  Upload,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  X,
  Maximize2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TicketDesignConfig,
  ticketDesignTemplates,
  getDefaultTicketDesignConfig,
  createTicketDesign,
  updateTicketDesign,
  getTicketDesigns,
  TicketDesign,
} from "@/lib/ticket-designs-api";
import { useToast } from "@/contexts/toast-context";
import { DefaultTicketPreview } from "@/components/organizer/default-ticket-design";
import { TicketTemplateGrid } from "@/components/organizer/ticket-template-previews";

interface DesignElement {
  id: string;
  type: "text" | "image" | "qr" | "logo";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  opacity?: number;
  zIndex?: number;
  locked?: boolean;
}

interface TicketDesignEditorProps {
  initialData?: {
    ticketDesign?: TicketDesign;
    selectedFeatures?: string[];
    organiserId?: string;
    eventId?: string;
    title?: string;
    startDate?: string;
    startTime?: string;
    location?: string;
    price?: string;
  };
  onDataChange?: (updates: {
    ticketDesign?: TicketDesign;
    designConfig?: TicketDesignConfig;
  }) => void;
}

export function TicketDesignEditor({
  initialData,
  onDataChange,
}: TicketDesignEditorProps = {}) {
  const hasCustomDesignFeature = initialData?.selectedFeatures?.includes(
    "custom_ticket_design",
  );
  const toast = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [designConfig, setDesignConfig] = useState<TicketDesignConfig>(
    initialData?.ticketDesign?.designConfig || getDefaultTicketDesignConfig(),
  );
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<
    "select" | "text" | "image" | "qr"
  >("select");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [designName, setDesignName] = useState(
    initialData?.ticketDesign?.name || "New Ticket Design",
  );
  const [savedDesigns, setSavedDesigns] = useState<TicketDesign[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // If custom design feature is not enabled, show default design
  if (!hasCustomDesignFeature) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Ticket Design
          </h2>
          <p className="text-sm text-slate-600">
            Your tickets will use our default professional design
          </p>
        </div>

        <DefaultTicketPreview
          eventData={{
            title: initialData?.title || "Your Event Title",
            startDate: initialData?.startDate,
            startTime: initialData?.startTime,
            location: initialData?.location,
            price: initialData?.price,
          }}
        />
      </div>
    );
  }

  // Load existing designs
  useEffect(() => {
    if (initialData?.organiserId) {
      loadSavedDesigns();
    }
  }, [initialData?.organiserId]);

  const loadSavedDesigns = async () => {
    if (!initialData?.organiserId) return;
    try {
      const designs = await getTicketDesigns(
        initialData.organiserId,
        initialData.eventId,
      );
      setSavedDesigns(designs);
    } catch (error) {
      console.error("Failed to load saved designs:", error);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = ticketDesignTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setDesignConfig(template.config as TicketDesignConfig);
      setElements([]);
      setSelectedElement(null);
      setShowTemplateModal(false);
    }
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedTool === "text") {
      const newElement: DesignElement = {
        id: `text-${Date.now()}`,
        type: "text",
        content: "Click to edit text",
        x: Math.max(0, Math.min(85, x)),
        y: Math.max(0, Math.min(85, y)),
        width: 150,
        height: 30,
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "left",
        color: "#1f2937",
        backgroundColor: "transparent",
        opacity: 1,
        zIndex: elements.length + 1,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setSelectedTool("select");
    } else if (selectedTool === "image") {
      const newElement: DesignElement = {
        id: `image-${Date.now()}`,
        type: "image",
        content: "https://via.placeholder.com/150x100/e2e8f0/64748b?text=Image",
        x: Math.max(0, Math.min(75, x)),
        y: Math.max(0, Math.min(75, y)),
        width: 100,
        height: 75,
        opacity: 1,
        zIndex: elements.length + 1,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setSelectedTool("select");
    } else if (selectedTool === "qr") {
      const newElement: DesignElement = {
        id: `qr-${Date.now()}`,
        type: "qr",
        content: "QR_CODE_PLACEHOLDER",
        x: Math.max(0, Math.min(80, x)),
        y: Math.max(0, Math.min(80, y)),
        width: 80,
        height: 80,
        opacity: 1,
        zIndex: elements.length + 1,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setSelectedTool("select");
    }
  };

  // Handle element drag
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElement || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedElement
            ? {
                ...el,
                x: Math.max(0, Math.min(100 - el.width / 3, el.x + deltaX)),
                y: Math.max(0, Math.min(100 - el.height / 3, el.y + deltaY)),
              }
            : el,
        ),
      );

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, selectedElement, dragStart]);

  // Update element properties
  const updateElement = (
    elementId: string,
    updates: Partial<DesignElement>,
  ) => {
    setElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
    );
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (element) {
      const newElement: DesignElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: Math.min(85, element.x + 5),
        y: Math.min(85, element.y + 5),
        zIndex: Math.max(...elements.map((el) => el.zIndex || 0)) + 1,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  // Save design
  const handleSaveDesign = async () => {
    if (!initialData?.organiserId) {
      toast.error("No organizer ID available");
      return;
    }

    setIsSaving(true);
    try {
      const designData = {
        name: designName,
        description: `Custom ticket design with ${elements.length} elements`,
        designConfig: {
          ...designConfig,
          elements: elements,
        },
        eventId: initialData.eventId,
        isDefault: false,
      };

      let savedDesign: TicketDesign;
      if (initialData?.ticketDesign?.id) {
        // Update existing design
        savedDesign = await updateTicketDesign(
          initialData.ticketDesign.id,
          designData,
        );
      } else {
        // Create new design
        savedDesign = await createTicketDesign(
          initialData.organiserId,
          designData,
        );
      }

      toast.success("Design saved successfully!");
      onDataChange?.({
        ticketDesign: savedDesign,
        designConfig: savedDesign.designConfig,
      });
      await loadSavedDesigns();
    } catch (error) {
      console.error("Failed to save design:", error);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved design
  const handleLoadDesign = (design: TicketDesign) => {
    setDesignConfig(design.designConfig);
    setDesignName(design.name);
    setElements((design.designConfig as any).elements || []);
    setSelectedElement(null);
    onDataChange?.({
      ticketDesign: design,
      designConfig: design.designConfig,
    });
  };

  // Get selected element
  const selectedElementData = selectedElement
    ? elements.find((el) => el.id === selectedElement)
    : null;

  // Export design as image (placeholder)
  const handleExportDesign = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Ticket Design Studio
          </h2>
          <p className="text-sm text-slate-600">
            Create custom ticket designs with our visual editor
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <Layout className="size-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="size-4 mr-2" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDesign}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleSaveDesign} disabled={isSaving}>
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save Design"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px,1fr,300px]">
        {/* Left Panel - Templates & Tools */}
        <div className="space-y-4">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">
                    Quick Templates
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <Maximize2 className="size-3 mr-1" />
                    View All
                  </Button>
                </div>
                <div className="grid gap-2">
                  {ticketDesignTemplates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 text-left rounded-lg border transition ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <h4 className="font-medium text-slate-900 text-sm">
                        {template.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-slate-900">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedTool === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("text")}
                    className="justify-start"
                  >
                    <Type className="size-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    variant={selectedTool === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("image")}
                    className="justify-start"
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    variant={selectedTool === "qr" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("qr")}
                    className="justify-start"
                  >
                    <Grid className="size-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant={selectedTool === "select" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("select")}
                    className="justify-start"
                  >
                    <Layout className="size-4 mr-2" />
                    Select
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-slate-900">Canvas Settings</h3>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Grid</Label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>
                <div>
                  <Label className="text-sm">
                    Zoom ({Math.round(zoom * 100)}%)
                  </Label>
                  <Slider
                    value={[zoom * 100]}
                    onValueChange={([value]) => setZoom(value / 100)}
                    min={25}
                    max={200}
                    step={25}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div>
                <Input
                  placeholder="Design name"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="mb-3"
                />
              </div>
              <div className="space-y-2">
                {savedDesigns.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleLoadDesign(design)}
                    className="w-full p-3 text-left rounded-lg border border-slate-200 hover:border-slate-300 transition"
                  >
                    <h4 className="font-medium text-slate-900">
                      {design.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {design.isDefault && (
                        <span className="text-blue-600">Default • </span>
                      )}
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
                {savedDesigns.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No saved designs yet
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center Panel - Canvas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">Design Canvas</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Layout: {designConfig.layout || "Portrait"}</span>
              <span>•</span>
              <span>
                {designConfig.width || 300} × {designConfig.height || 450}px
              </span>
            </div>
          </div>

          <div
            className="relative bg-slate-100 rounded-lg p-8 overflow-hidden"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center top",
            }}
          >
            {/* Grid */}
            {showGrid && (
              <div
                className="absolute inset-8 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #64748b 1px, transparent 1px),
                    linear-gradient(to bottom, #64748b 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            )}

            {/* Canvas */}
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`relative mx-auto bg-white shadow-lg overflow-hidden ${
                selectedTool !== "select"
                  ? "cursor-crosshair"
                  : "cursor-default"
              }`}
              style={{
                width: designConfig.width || 300,
                height: designConfig.height || 450,
                backgroundColor: designConfig.backgroundColor || "#ffffff",
                borderRadius: `${designConfig.border?.radius || 8}px`,
                border: designConfig.border?.enabled
                  ? `${designConfig.border.width || 2}px ${
                      designConfig.border.style || "solid"
                    } ${designConfig.border.color || "#e2e8f0"}`
                  : "none",
              }}
            >
              {/* Background */}
              {designConfig.backgroundImage && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${designConfig.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {designConfig.backgroundGradient && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${
                      designConfig.backgroundGradient.direction || "to-br"
                    }, ${designConfig.backgroundGradient.colors.join(", ")})`,
                  }}
                />
              )}

              {/* Header */}
              {designConfig.header?.enabled && (
                <div
                  className="absolute top-0 left-0 right-0 flex items-center justify-center"
                  style={{
                    height: designConfig.header.height || 80,
                    backgroundColor:
                      designConfig.header.backgroundColor || "#1f2937",
                  }}
                >
                  {designConfig.header.text && (
                    <span
                      style={{
                        fontSize: `${designConfig.header.text.fontSize || 24}px`,
                        fontFamily:
                          designConfig.header.text.fontFamily || "Inter",
                        color: designConfig.header.text.color || "#ffffff",
                        fontWeight:
                          designConfig.header.text.fontWeight || "bold",
                      }}
                    >
                      {designConfig.header.text.content}
                    </span>
                  )}
                </div>
              )}

              {/* Custom Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                  className={`absolute cursor-move border-2 ${
                    selectedElement === element.id && !previewMode
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: element.width,
                    height: element.height,
                    transform: `rotate(${element.rotation || 0}deg)`,
                    opacity: element.opacity || 1,
                    zIndex: element.zIndex || 1,
                    backgroundColor: element.backgroundColor || "transparent",
                    borderRadius: `${element.borderRadius || 0}px`,
                  }}
                >
                  {element.type === "text" && (
                    <div
                      className="w-full h-full flex items-center"
                      style={{
                        fontSize: `${element.fontSize || 16}px`,
                        fontFamily: element.fontFamily || "Inter",
                        fontWeight: element.fontWeight || "normal",
                        fontStyle: element.fontStyle || "normal",
                        textDecoration: element.textDecoration || "none",
                        textAlign: element.textAlign || "left",
                        color: element.color || "#1f2937",
                        padding: "4px",
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === "image" && (
                    <img
                      src={element.content}
                      alt="Design element"
                      className="w-full h-full object-cover"
                      style={{ borderRadius: `${element.borderRadius || 0}px` }}
                    />
                  )}
                  {element.type === "qr" && (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                      QR Code
                    </div>
                  )}

                  {/* Selection handles */}
                  {selectedElement === element.id && !previewMode && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    </>
                  )}
                </div>
              ))}

              {/* Tool hint */}
              {selectedTool !== "select" && !previewMode && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-slate-900">
                    Click to add {selectedTool}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="space-y-4">
          {selectedElementData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">
                  Element Properties
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateElement(selectedElementData.id)}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteElement(selectedElementData.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Content */}
                {selectedElementData.type === "text" && (
                  <div>
                    <Label className="text-sm font-medium">Text Content</Label>
                    <Input
                      value={selectedElementData.content}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          content: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                )}

                {selectedElementData.type === "image" && (
                  <div>
                    <Label className="text-sm font-medium">Image URL</Label>
                    <Input
                      value={selectedElementData.content}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          content: e.target.value,
                        })
                      }
                      className="mt-1"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {/* Typography (for text elements) */}
                {selectedElementData.type === "text" && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Font Size</Label>
                      <Input
                        type="number"
                        value={selectedElementData.fontSize || 16}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            fontSize: parseInt(e.target.value),
                          })
                        }
                        className="mt-1"
                        min="8"
                        max="72"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Font Family</Label>
                      <Select
                        value={selectedElementData.fontFamily || "Inter"}
                        onValueChange={(value) =>
                          updateElement(selectedElementData.id, {
                            fontFamily: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Times New Roman">
                            Times New Roman
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Text Style</Label>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.fontWeight === "bold"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              fontWeight:
                                selectedElementData.fontWeight === "bold"
                                  ? "normal"
                                  : "bold",
                            })
                          }
                        >
                          <Bold className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.fontStyle === "italic"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              fontStyle:
                                selectedElementData.fontStyle === "italic"
                                  ? "normal"
                                  : "italic",
                            })
                          }
                        >
                          <Italic className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.textDecoration === "underline"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textDecoration:
                                selectedElementData.textDecoration ===
                                "underline"
                                  ? "none"
                                  : "underline",
                            })
                          }
                        >
                          <Underline className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Text Align</Label>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.textAlign === "left"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textAlign: "left",
                            })
                          }
                        >
                          <AlignLeft className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.textAlign === "center"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textAlign: "center",
                            })
                          }
                        >
                          <AlignCenter className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedElementData.textAlign === "right"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textAlign: "right",
                            })
                          }
                        >
                          <AlignRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Color */}
                <div>
                  <Label className="text-sm font-medium">Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedElementData.color || "#1f2937"}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={selectedElementData.color || "#1f2937"}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          color: e.target.value,
                        })
                      }
                      className="flex-1"
                      placeholder="#1f2937"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Width</Label>
                    <Input
                      type="number"
                      value={selectedElementData.width}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          width: parseInt(e.target.value),
                        })
                      }
                      className="mt-1"
                      min="10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Height</Label>
                    <Input
                      type="number"
                      value={selectedElementData.height}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          height: parseInt(e.target.value),
                        })
                      }
                      className="mt-1"
                      min="10"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <Label className="text-sm font-medium">
                    Opacity (
                    {Math.round((selectedElementData.opacity || 1) * 100)}%)
                  </Label>
                  <Slider
                    value={[(selectedElementData.opacity || 1) * 100]}
                    onValueChange={([value]) =>
                      updateElement(selectedElementData.id, {
                        opacity: value / 100,
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Select an element to edit its properties
              </p>
            </div>
          )}
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Choose Your Ticket Design
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Select a professional template that matches your event's
                    style
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="size-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <TicketTemplateGrid
                  selectedTemplate={selectedTemplate ?? undefined}
                  onTemplateSelect={handleTemplateSelect}
                  eventData={{
                    title: initialData?.title,
                    startDate: initialData?.startDate,
                    startTime: initialData?.startTime,
                    location: initialData?.location,
                    price: initialData?.price,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
