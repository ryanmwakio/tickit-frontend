"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Search,
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  Filter,
  Globe,
  FileText,
  Code,
  Layers,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type ContentBlock = {
  id: string;
  key: string;
  section: string;
  category: string;
  content: string;
  type: "text" | "html" | "markdown" | "json";
  locale: string | null;
  metadata: Record<string, unknown> | null;
  lastModifiedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  updatedAt: string;
};

export function ContentManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<ContentBlock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBlock, setNewBlock] = useState({
    key: "",
    section: "",
    category: "",
    content: "",
    type: "text" as const,
    locale: "en",
  });

  useEffect(() => {
    if (user) {
      loadContentBlocks();
      loadSections();
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterBlocks();
  }, [blocks, searchQuery, selectedSection, selectedCategory]);

  const loadContentBlocks = async () => {
    try {
      const data = await apiClient.get<ContentBlock[]>('/content-blocks');
      setBlocks(data);
    } catch (error) {
      console.error('Failed to load content blocks:', error);
    }
  };

  const loadSections = async () => {
    try {
      const data = await apiClient.get<ContentBlock[]>('/content-blocks');
      const uniqueSections = Array.from(new Set(data.map(b => b.section)));
      setSections(uniqueSections);
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections(["homepage", "admin", "organizer", "profile", "auth", "navigation"]);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.get<ContentBlock[]>(`/content-blocks${selectedSection !== 'all' ? `?section=${selectedSection}` : ''}`);
      const uniqueCategories = Array.from(new Set(data.map(b => b.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(["hero", "dashboard", "navigation", "labels", "messages", "descriptions"]);
    }
  };

  const filterBlocks = () => {
    let filtered = [...blocks];

    if (searchQuery) {
      filtered = filtered.filter(
        (block) =>
          block.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.section.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSection !== "all") {
      filtered = filtered.filter((block) => block.section === selectedSection);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((block) => block.category === selectedCategory);
    }

    setFilteredBlocks(filtered);
  };

  const handleSave = async (id: string) => {
    if (!user) return;
    try {
      await apiClient.put(`/content-blocks/${id}`, { content: editingContent });
      await loadContentBlocks();
      setEditingId(null);
      toast.success('Saved', 'Content block updated successfully');
    } catch (error) {
      console.error('Failed to save content block:', error);
      toast.error('Failed to save', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    try {
      await apiClient.post('/content-blocks', newBlock);
      setNewBlock({
        key: "",
        section: "",
        category: "",
        content: "",
        type: "text",
        locale: "en",
      });
      setIsCreating(false);
      await loadContentBlocks();
      toast.success('Created', 'Content block created successfully');
    } catch (error) {
      console.error('Failed to create content block:', error);
      toast.error('Failed to create', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this content block?")) return;
    
    try {
      await apiClient.delete(`/content-blocks/${id}`);
      await loadContentBlocks();
      toast.success('Deleted', 'Content block deleted successfully');
    } catch (error) {
      console.error('Failed to delete content block:', error);
      toast.error('Failed to delete', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "html":
      case "json":
        return <Code className="h-4 w-4" />;
      case "markdown":
        return <FileText className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search content blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Block
        </button>
      </div>

      {/* Create New Block Form */}
      {isCreating && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create New Content Block</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Key (e.g., homepage.hero.title)</Label>
              <Input
                value={newBlock.key}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, key: e.target.value })
                }
                placeholder="homepage.hero.title"
              />
            </div>
            <div>
              <Label>Section</Label>
              <Select
                value={newBlock.section}
                onValueChange={(value) =>
                  setNewBlock({ ...newBlock, section: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newBlock.category}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, category: e.target.value })
                }
                placeholder="hero"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newBlock.type}
                onValueChange={(value: any) =>
                  setNewBlock({ ...newBlock, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Content</Label>
              <textarea
                value={newBlock.content}
                onChange={(e) =>
                  setNewBlock({ ...newBlock, content: e.target.value })
                }
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="Enter content..."
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>
      )}

      {/* Content Blocks List */}
      <div className="space-y-3">
        {filteredBlocks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">
              {blocks.length === 0
                ? "No content blocks found. Create your first one!"
                : "No content blocks match your filters."}
            </p>
          </div>
        ) : (
          filteredBlocks.map((block) => (
            <div
              key={block.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(block.type)}
                    <div>
                      <h4 className="font-semibold text-slate-900">{block.key}</h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {block.section}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {block.category}
                        </span>
                        {block.locale && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                            <Globe className="h-3 w-3" />
                            {block.locale}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingId(block.id);
                      setEditingContent(block.content);
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {editingId === block.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={block.type === "json" ? 8 : 4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-slate-400 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(block.id)}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {block.content}
                  </p>
                  {block.lastModifiedBy && (
                    <p className="mt-2 text-xs text-slate-500">
                      Last modified by {block.lastModifiedBy.firstName}{" "}
                      {block.lastModifiedBy.lastName} on{" "}
                      {new Date(block.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

