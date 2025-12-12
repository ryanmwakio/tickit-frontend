"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Package,
  DollarSign,
  ShoppingBag,
  Image as ImageIcon,
  AlertCircle,
  Save,
  X,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MerchandiseItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inventory: number;
  image?: string;
  category: string;
  sizeOptions?: string[];
  colorOptions?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  enabled: boolean;
  allowPreOrder: boolean;
  maxPerOrder: number;
  shippingRequired: boolean;
  shippingCost: number;
};

type MerchandiseManagerProps = {
  initialData?: {
    merchandise?: MerchandiseItem[];
  };
  onDataChange?: (updates: any) => void;
};

const defaultCategories = [
  "Apparel",
  "Accessories",
  "Collectibles",
  "Food & Beverages",
  "VIP Packages",
  "Digital Products",
  "Other",
];

export function MerchandiseManager({ initialData, onDataChange }: MerchandiseManagerProps = {}) {
  const [items, setItems] = useState<MerchandiseItem[]>(
    initialData?.merchandise || []
  );
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addItem = (item: Omit<MerchandiseItem, "id">) => {
    const newItem: MerchandiseItem = {
      ...item,
      id: `merch-${Date.now()}`,
    };
    setItems([...items, newItem]);
    setShowAddForm(false);
  };

  const updateItem = (id: string, updates: Partial<MerchandiseItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    setIsEditing(null);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const stats = {
    total: items.length,
    enabled: items.filter((i) => i.enabled).length,
    totalValue: items.reduce((sum, item) => sum + item.price * item.inventory, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Merchandise Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add products and merchandise to sell alongside your event tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Items</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Enabled</div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.enabled}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Inventory Value</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {stats.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Item Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Products</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <MerchandiseForm
          onSave={addItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Package className="mx-auto size-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">No merchandise items</p>
            <p className="mt-2 text-sm text-slate-600">
              Add your first product to start selling merchandise at your event
            </p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4" variant="outline">
              <Plus className="mr-2 size-4" />
              Add First Product
            </Button>
          </div>
        ) : (
          items.map((item, index) =>
            isEditing === item.id ? (
              <MerchandiseForm
                key={item.id}
                initialData={item}
                onSave={(updated) => updateItem(item.id, updated)}
                onCancel={() => setIsEditing(null)}
              />
            ) : (
              <MerchandiseCard
                key={item.id}
                item={item}
                onEdit={() => setIsEditing(item.id)}
                onDelete={() => deleteItem(item.id)}
                onToggle={() => toggleItem(item.id)}
                onMoveUp={index > 0 ? () => moveItem(item.id, "up") : undefined}
                onMoveDown={index < items.length - 1 ? () => moveItem(item.id, "down") : undefined}
              />
            )
          )
        )}
      </div>
    </div>
  );
}

function MerchandiseCard({
  item,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  item: MerchandiseItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-6 transition ${
        item.enabled
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-75"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="flex size-24 items-center justify-center rounded-lg bg-slate-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="size-full rounded-lg object-cover"
            />
          ) : (
            <ImageIcon className="size-8 text-slate-400" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                {!item.enabled && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Disabled
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Price: </span>
                  <span className="font-semibold text-slate-900">
                    KES {item.price.toLocaleString()}
                  </span>
                  {item.compareAtPrice && (
                    <span className="ml-2 text-slate-400 line-through">
                      KES {item.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-600">SKU: </span>
                  <span className="font-mono text-slate-900">{item.sku}</span>
                </div>
                <div>
                  <span className="text-slate-600">Inventory: </span>
                  <span
                    className={`font-semibold ${
                      item.inventory < 10 ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {item.inventory} units
                  </span>
                  {item.inventory < 10 && (
                    <AlertCircle className="ml-1 inline size-4 text-red-600" />
                  )}
                </div>
                <div>
                  <span className="text-slate-600">Category: </span>
                  <span className="font-semibold text-slate-900">{item.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {onMoveUp && (
              <Button variant="ghost" size="sm" onClick={onMoveUp}>
                <MoveUp className="size-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button variant="ghost" size="sm" onClick={onMoveDown}>
                <MoveDown className="size-4" />
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className={item.enabled ? "text-green-600" : "text-slate-600"}
          >
            {item.enabled ? "Disable" : "Enable"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MerchandiseForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: MerchandiseItem;
  onSave: (item: Omit<MerchandiseItem, "id">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<MerchandiseItem, "id">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice,
    sku: initialData?.sku || `SKU-${Date.now()}`,
    inventory: initialData?.inventory || 0,
    image: initialData?.image,
    category: initialData?.category || defaultCategories[0],
    sizeOptions: initialData?.sizeOptions || [],
    colorOptions: initialData?.colorOptions || [],
    weight: initialData?.weight,
    dimensions: initialData?.dimensions,
    enabled: initialData?.enabled ?? true,
    allowPreOrder: initialData?.allowPreOrder || false,
    maxPerOrder: initialData?.maxPerOrder || 10,
    shippingRequired: initialData?.shippingRequired || false,
    shippingCost: initialData?.shippingCost || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label>Product Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label>Description *</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Price (KES) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Compare At Price (KES)</Label>
              <Input
                type="number"
                value={formData.compareAtPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Inventory Quantity *</Label>
            <Input
              type="number"
              value={formData.inventory}
              onChange={(e) =>
                setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })
              }
              className="mt-1"
              required
              min="0"
            />
          </div>

          <div>
            <Label>Image URL</Label>
            <Input
              type="url"
              value={formData.image || ""}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="mt-1"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label>Max Per Order</Label>
            <Input
              type="number"
              value={formData.maxPerOrder}
              onChange={(e) =>
                setFormData({ ...formData, maxPerOrder: parseInt(e.target.value) || 10 })
              }
              className="mt-1"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="size-4 rounded border-slate-300"
              />
              <Label htmlFor="enabled">Enabled (visible to customers)</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preOrder"
                checked={formData.allowPreOrder}
                onChange={(e) => setFormData({ ...formData, allowPreOrder: e.target.checked })}
                className="size-4 rounded border-slate-300"
              />
              <Label htmlFor="preOrder">Allow Pre-Order</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shipping"
                checked={formData.shippingRequired}
                onChange={(e) => setFormData({ ...formData, shippingRequired: e.target.checked })}
                className="size-4 rounded border-slate-300"
              />
              <Label htmlFor="shipping">Requires Shipping</Label>
            </div>
          </div>

          {formData.shippingRequired && (
            <div>
              <Label>Shipping Cost (KES)</Label>
              <Input
                type="number"
                value={formData.shippingCost}
                onChange={(e) =>
                  setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })
                }
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div>
            <Label>Size Options (comma-separated)</Label>
            <Input
              value={formData.sizeOptions?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sizeOptions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="mt-1"
              placeholder="S, M, L, XL"
            />
          </div>

          <div>
            <Label>Color Options (comma-separated)</Label>
            <Input
              value={formData.colorOptions?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colorOptions: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                })
              }
              className="mt-1"
              placeholder="Red, Blue, Green"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 size-4" />
          {initialData ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

