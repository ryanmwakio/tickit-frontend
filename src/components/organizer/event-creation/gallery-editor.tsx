"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon, GripVertical, Trash2, Layout, Eye, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GalleryLayouts } from "@/components/gallery/gallery-layouts";
import type { EventMediaItem } from "@/data/events";

type GalleryLayout = "grid" | "masonry" | "carousel" | "stack" | "featured";

type GalleryImage = {
  id: string;
  url: string;
  file?: File;
  isHero?: boolean;
};

const layoutOptions: { value: GalleryLayout; label: string; description: string }[] = [
  { value: "grid", label: "Grid", description: "Uniform grid layout" },
  { value: "masonry", label: "Masonry", description: "Pinterest-style layout" },
  { value: "carousel", label: "Carousel", description: "Horizontal scrollable" },
  { value: "stack", label: "Stack", description: "Vertical stacked layout" },
  { value: "featured", label: "Featured", description: "Large featured + grid" },
];

type EventGalleryEditorProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function EventGalleryEditor({ initialData, onDataChange }: EventGalleryEditorProps = {}) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<GalleryLayout>("grid");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const isInitialLoad = useRef(true);
  
  // Sync images to parent whenever they change (using useEffect to avoid render-time updates)
  useEffect(() => {
    // Skip sync on initial load to avoid overwriting parent data
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    if (onDataChange && images.length > 0) {
      const coverImage = images.find((img) => img.isHero);
      const galleryImages = images.filter((img) => !img.isHero);
      onDataChange({
        coverImageUrl: coverImage?.url || "",
        imageGalleryUrls: galleryImages.map((img) => img.url),
      });
    }
  }, [images, onDataChange]);

  // Load images from initialData when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      const loadedImages: GalleryImage[] = [];
      
      // Load cover image if it exists
      if (initialData.coverImageUrl) {
        loadedImages.push({
          id: `cover-${Date.now()}`,
          url: initialData.coverImageUrl,
          isHero: true,
        });
      }
      
      // Load gallery images
      if (initialData.imageGalleryUrls && Array.isArray(initialData.imageGalleryUrls)) {
        initialData.imageGalleryUrls.forEach((url: string, index: number) => {
          // Skip if it's the same as cover image
          if (url !== initialData.coverImageUrl) {
            loadedImages.push({
              id: `gallery-${index}-${Date.now()}`,
              url: url,
              isHero: false,
            });
          }
        });
      }
      
      // Only update if we have images to load
      if (loadedImages.length > 0) {
        setImages(loadedImages);
        // Don't sync on initial load to avoid overwriting
      }
    }
  }, [initialData?.coverImageUrl, initialData?.imageGalleryUrls]); // Only reload when these specific fields change

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            const newImage: GalleryImage = {
              id: `img-${Date.now()}-${Math.random()}`,
              url,
              file,
              isHero: images.length === 0,
            };
            setImages((prev) => {
              return [...prev, newImage];
            });
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [images.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && prev.find((img) => img.id === id)?.isHero) {
        filtered[0].isHero = true;
      }
      return filtered;
    });
  };

  const handleSetHero = (id: string) => {
    setImages((prev) => {
      return prev.map((img) => ({
        ...img,
        isHero: img.id === id,
      }));
    });
  };

  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    const newImage: GalleryImage = {
      id: `url-${Date.now()}-${Math.random()}`,
      url: trimmedUrl,
      isHero: images.length === 0,
    };

    setImages((prev) => {
      return [...prev, newImage];
    });

    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Event Gallery</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload images or add them by URL. Drag to reorder, set hero image, or remove.
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition ${
            isDragging
              ? "border-slate-900 bg-slate-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <Upload className="mx-auto size-12 text-slate-400" />
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Drag and drop images here, or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports JPG, PNG, WebP (max 10MB per image)
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className="mt-4 inline-block cursor-pointer rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse Files
          </label>
        </div>

        {/* URL Input Section */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-5 text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">
                Or add images by URL
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-slate-700"
            >
              {showUrlInput ? "Hide" : "Add URL"}
            </Button>
          </div>

          {showUrlInput && (
            <div className="mt-4 flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddUrl}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Layout Selection */}
      {images.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-sm font-semibold text-slate-900">Gallery Layout</Label>
              <p className="mt-1 text-xs text-slate-600">
                Choose how your gallery will be displayed on the event page
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="size-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
          <Select 
            value={selectedLayout} 
            onValueChange={(value) => {
              setSelectedLayout(value as GalleryLayout);
              if (onDataChange) {
                onDataChange({ galleryLayout: value });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layoutOptions.map((layout) => (
                <SelectItem key={layout.value} value={layout.value}>
                  <div>
                    <div className="font-semibold">{layout.label}</div>
                    <div className="text-xs text-slate-500">{layout.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Layout Preview */}
      {showPreview && images.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Layout Preview</h3>
          <GalleryLayouts
            media={images.map((img) => ({ type: "image" as const, src: img.url }))}
            layout={selectedLayout}
            title="Event Gallery"
          />
        </div>
      )}

      {/* Gallery Management Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Gallery ({images.length} image{images.length !== 1 ? "s" : ""})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOverItem(e, index)}
                className={`group relative overflow-hidden rounded-xl border-2 bg-white shadow-lg transition ${
                  draggedIndex === index
                    ? "opacity-50"
                    : image.isHero
                    ? "border-slate-900 ring-2 ring-slate-900"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Drag Handle */}
                <div className="absolute left-2 top-2 z-10 flex items-center gap-2">
                  <button
                    className="rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
                    title="Drag to reorder"
                  >
                    <GripVertical className="size-4" />
                  </button>
                </div>

                {/* Hero Badge */}
                {image.isHero && (
                  <div className="absolute left-2 top-12 z-10 rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                    Hero
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(image.id)}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-red-500 p-1.5 text-white opacity-0 shadow-sm transition hover:bg-red-600 group-hover:opacity-100"
                  title="Remove image"
                >
                  <Trash2 className="size-4" />
                </button>

                {/* Image */}
                <div className="relative aspect-video w-full bg-slate-100">
                  <Image
                    src={image.url}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Actions */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    {!image.isHero && (
                      <button
                        onClick={() => handleSetHero(image.id)}
                        className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white"
                      >
                        Set as Hero
                      </button>
                    )}
                    <div className="flex-1 text-right text-xs font-semibold text-white">
                      {image.file?.name || `Image ${index + 1}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <ImageIcon className="mx-auto size-16 text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">
            No images uploaded yet. Upload images to create your event gallery.
          </p>
        </div>
      )}
    </div>
  );
}

