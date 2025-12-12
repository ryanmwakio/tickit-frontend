"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Package,
  Plus,
  Minus,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type MerchandiseItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  category: string;
  inventory: number;
  sizeOptions?: string[];
  colorOptions?: string[];
  maxPerOrder: number;
};

type MerchandiseSectionProps = {
  items: MerchandiseItem[];
};

export function MerchandiseSection({ items }: MerchandiseSectionProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string; color?: string }>>({});

  if (!items || items.length === 0) {
    return null;
  }

  const addToCart = (item: MerchandiseItem) => {
    const currentQuantity = selectedItems[item.id]?.quantity || 0;
    if (currentQuantity < item.maxPerOrder && currentQuantity < item.inventory) {
      setSelectedItems({
        ...selectedItems,
        [item.id]: {
          ...selectedItems[item.id],
          quantity: currentQuantity + 1,
        },
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    const currentQuantity = selectedItems[itemId]?.quantity || 0;
    if (currentQuantity > 0) {
      setSelectedItems({
        ...selectedItems,
        [itemId]: {
          ...selectedItems[itemId],
          quantity: currentQuantity - 1,
        },
      });
    }
  };

  const updateVariant = (itemId: string, field: "size" | "color", value: string) => {
    setSelectedItems({
      ...selectedItems,
      [itemId]: {
        ...selectedItems[itemId],
        [field]: value,
        quantity: selectedItems[itemId]?.quantity || 1,
      },
    });
  };

  const getTotalCartValue = () => {
    return items.reduce((total, item) => {
      const quantity = selectedItems[item.id]?.quantity || 0;
      return total + item.price * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(selectedItems).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MerchandiseItem[]>);

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="size-5 text-indigo-500" />
          <h2 className="text-2xl font-semibold">Merchandise & Products</h2>
        </div>
        {getCartItemCount() > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-slate-600">{getCartItemCount()} items</div>
              <div className="text-lg font-semibold text-slate-900">
                KES {getTotalCartValue().toLocaleString()}
              </div>
            </div>
            <Button size="lg">
              <ShoppingBag className="mr-2 size-4" />
              View Cart
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryItems.map((item) => {
                const selected = selectedItems[item.id];
                const quantity = selected?.quantity || 0;
                const isAvailable = item.inventory > 0;
                const isLowStock = item.inventory < 10 && item.inventory > 0;

                return (
                  <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-2xl border transition ${
                      !isAvailable
                        ? "border-slate-200 bg-slate-50 opacity-60"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Package className="size-12 text-slate-300" />
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                          Save {Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-slate-900">{item.name}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>

                      {/* Variants */}
                      {item.sizeOptions && item.sizeOptions.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-xs font-semibold text-slate-700">Size:</div>
                          <div className="flex flex-wrap gap-2">
                            {item.sizeOptions.map((size) => (
                              <button
                                key={size}
                                onClick={() => updateVariant(item.id, "size", size)}
                                disabled={!isAvailable}
                                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                  selected?.size === size
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                } ${!isAvailable ? "cursor-not-allowed opacity-50" : ""}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.colorOptions && item.colorOptions.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-xs font-semibold text-slate-700">Color:</div>
                          <div className="flex flex-wrap gap-2">
                            {item.colorOptions.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateVariant(item.id, "color", color)}
                                disabled={!isAvailable}
                                className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                  selected?.color === color
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                } ${!isAvailable ? "cursor-not-allowed opacity-50" : ""}`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">
                              KES {item.price.toLocaleString()}
                            </span>
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <span className="text-sm text-slate-400 line-through">
                                KES {item.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {isLowStock && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="size-3" />
                              <span>Only {item.inventory} left</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {isAvailable && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center rounded-lg border border-slate-200">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              disabled={quantity === 0}
                              className="p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="min-w-[3rem] px-4 py-2 text-center text-sm font-semibold text-slate-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              disabled={quantity >= item.maxPerOrder || quantity >= item.inventory}
                              className="p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          {quantity > 0 && (
                            <div className="text-sm font-semibold text-green-600">
                              KES {(item.price * quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      {isAvailable && quantity === 0 && (
                        <Button
                          onClick={() => addToCart(item)}
                          className="mt-4 w-full"
                          variant="outline"
                        >
                          <Plus className="mr-2 size-4" />
                          Add to Cart
                        </Button>
                      )}

                      {quantity > 0 && (
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={quantity >= item.maxPerOrder || quantity >= item.inventory}
                          className="mt-4 w-full"
                        >
                          <Check className="mr-2 size-4" />
                          {quantity} in Cart
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

