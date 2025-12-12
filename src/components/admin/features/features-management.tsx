"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Tag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Save,
  X,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchAvailableFeatures,
  createFeature,
  createFeatureCategory,
  updateFeature,
  updateFeatureCategory,
  deleteFeature,
  deleteFeatureCategory,
  type FeatureCategoryDto,
  type FeatureDto,
  type CreateFeatureDto,
  type CreateFeatureCategoryDto,
} from "@/lib/events-api";

export function FeaturesManagement() {
  const [featureCategories, setFeatureCategories] = useState<FeatureCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"features" | "categories">("features");
  
  // Dialog states
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDto | null>(null);
  const [editingCategory, setEditingCategory] = useState<FeatureCategoryDto | null>(null);
  
  // Form states
  const [featureForm, setFeatureForm] = useState<CreateFeatureDto>({
    name: "",
    description: "",
    basePrice: 0,
    pricingType: "one_time",
    categoryId: "",
    popular: false,
    required: false,
  });
  const [categoryForm, setCategoryForm] = useState<CreateFeatureCategoryDto>({
    name: "",
    description: "",
  });

  // Load features from API
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const features = await fetchAvailableFeatures();
      setFeatureCategories(features);
    } catch (error) {
      console.error("Failed to load features:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered features
  const filteredCategories = useMemo(() => {
    let filtered = featureCategories;

    if (filterCategory !== "all") {
      filtered = filtered.filter((cat) => cat.id === filterCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map((cat) => ({
        ...cat,
        features: cat.features.filter(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query) ||
            f.id.toLowerCase().includes(query)
        ),
      })).filter((cat) => cat.features.length > 0);
    }

    return filtered;
  }, [featureCategories, searchQuery, filterCategory]);

  // All features flattened for display
  const allFeatures = useMemo(() => {
    return featureCategories.flatMap((cat) =>
      cat.features.map((f) => ({ ...f, categoryName: cat.name, categoryId: cat.id }))
    );
  }, [featureCategories]);

  const handleCreateFeature = () => {
    setEditingFeature(null);
    setFeatureForm({
      name: "",
      description: "",
      basePrice: 0,
      pricingType: "one_time",
      categoryId: featureCategories[0]?.id || "",
      popular: false,
      required: false,
    });
    setIsFeatureDialogOpen(true);
  };

  const handleEditFeature = (feature: FeatureDto, categoryId: string) => {
    setEditingFeature(feature);
    setFeatureForm({
      name: feature.name,
      description: feature.description,
      basePrice: feature.basePrice,
      pricingType: feature.pricingType,
      pricingUnit: feature.pricingUnit,
      categoryId: categoryId,
      popular: feature.popular || false,
      required: feature.required || false,
    });
    setIsFeatureDialogOpen(true);
  };

  const handleSaveFeature = async () => {
    try {
      if (editingFeature) {
        await updateFeature(editingFeature.id, featureForm);
      } else {
        await createFeature(featureForm);
      }
      await loadFeatures();
      setIsFeatureDialogOpen(false);
      setEditingFeature(null);
    } catch (error: any) {
      console.error("Failed to save feature:", error);
      alert(error.message || "Failed to save feature");
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) {
      return;
    }
    try {
      await deleteFeature(featureId);
      await loadFeatures();
    } catch (error: any) {
      console.error("Failed to delete feature:", error);
      alert(error.message || "Failed to delete feature");
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: FeatureCategoryDto) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateFeatureCategory(editingCategory.id, categoryForm);
      } else {
        await createFeatureCategory(categoryForm);
      }
      await loadFeatures();
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error("Failed to save category:", error);
      alert(error.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? All features in this category will also be deleted.")) {
      return;
    }
    try {
      await deleteFeatureCategory(categoryId);
      await loadFeatures();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(error.message || "Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {featureCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "features" | "categories")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <Button
            onClick={activeTab === "features" ? handleCreateFeature : handleCreateCategory}
            className="inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            {activeTab === "features" ? "Create Feature" : "Create Category"}
          </Button>
        </div>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Sparkles className="mx-auto size-12 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">No features found</p>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery ? "Try adjusting your search query" : "Create your first feature to get started"}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {category.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{feature.name}</h4>
                          {feature.required && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Required
                            </span>
                          )}
                          {feature.popular && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              <Sparkles className="size-3" />
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3" />
                            {feature.basePrice === 0
                              ? "Free"
                              : `KES ${feature.basePrice.toLocaleString()}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="size-3" />
                            {feature.pricingType.replace("_", " ")}
                          </span>
                          {feature.pricingUnit && (
                            <span className="text-slate-400">({feature.pricingUnit})</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFeature(feature, category.id)}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        {!feature.required && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateFeature}
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    Add Feature to {category.name}
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          {featureCategories.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Tag className="mx-auto size-12 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">No categories found</p>
              <p className="mt-2 text-sm text-slate-600">Create your first category to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {category.features.length} feature{category.features.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="flex-1"
                    >
                      <Edit2 className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Feature Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFeature ? "Edit Feature" : "Create Feature"}</DialogTitle>
            <DialogDescription>
              {editingFeature
                ? "Update the feature details below"
                : "Fill in the details to create a new feature"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feature-name">Feature Name *</Label>
              <Input
                id="feature-name"
                value={featureForm.name}
                onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                placeholder="e.g., Custom Ticket Design"
              />
            </div>
            <div>
              <Label htmlFor="feature-description">Description *</Label>
              <textarea
                id="feature-description"
                value={featureForm.description}
                onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                placeholder="Describe what this feature does..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="feature-category">Category *</Label>
                <Select
                  value={featureForm.categoryId}
                  onValueChange={(value) => setFeatureForm({ ...featureForm, categoryId: value })}
                >
                  <SelectTrigger id="feature-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {featureCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feature-price">Base Price (KES) *</Label>
                <Input
                  id="feature-price"
                  type="number"
                  min="0"
                  value={featureForm.basePrice}
                  onChange={(e) =>
                    setFeatureForm({ ...featureForm, basePrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="feature-pricing-type">Pricing Type *</Label>
                <Select
                  value={featureForm.pricingType}
                  onValueChange={(value: any) =>
                    setFeatureForm({ ...featureForm, pricingType: value })
                  }
                >
                  <SelectTrigger id="feature-pricing-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="per_ticket">Per Ticket</SelectItem>
                    <SelectItem value="per_event">Per Event</SelectItem>
                    <SelectItem value="per_month">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feature-pricing-unit">Pricing Unit (Optional)</Label>
                <Input
                  id="feature-pricing-unit"
                  value={featureForm.pricingUnit || ""}
                  onChange={(e) => setFeatureForm({ ...featureForm, pricingUnit: e.target.value })}
                  placeholder="e.g., per ticket sold"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={featureForm.required || false}
                  onChange={(e) => setFeatureForm({ ...featureForm, required: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Required Feature</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={featureForm.popular || false}
                  onChange={(e) => setFeatureForm({ ...featureForm, popular: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Popular Feature</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFeature}>
                <Save className="size-4" />
                {editingFeature ? "Update Feature" : "Create Feature"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below"
                : "Fill in the details to create a new feature category"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Design & Branding"
              />
            </div>
            <div>
              <Label htmlFor="category-description">Description *</Label>
              <textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Describe this category..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategory}>
                <Save className="size-4" />
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



