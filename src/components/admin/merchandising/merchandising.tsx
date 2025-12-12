"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Package,
  Plus,
  Edit2,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function Merchandising() {
  const [activeTab, setActiveTab] = useState<"products" | "inventory" | "bundles">("products");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
          </TabsList>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Product
          </Button>
        </div>

        <TabsContent value="products" className="mt-6">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="bundles" className="mt-6">
          <BundlesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsTab() {
  const [products] = useState([
    {
      id: "prod-1",
      name: "Event T-Shirt",
      price: 2500,
      inventory: 150,
      category: "Apparel",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200",
      sales: 45,
      revenue: 112500,
    },
    {
      id: "prod-2",
      name: "VIP Accessory Kit",
      price: 5000,
      inventory: 30,
      category: "VIP",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200",
      sales: 18,
      revenue: 90000,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="mb-4 flex size-20 items-center justify-center rounded-lg bg-slate-100">
              <Package className="size-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>Category: {product.category}</div>
              <div>Price: KES {product.price.toLocaleString()}</div>
              <div>Inventory: {product.inventory} units</div>
              <div>Sales: {product.sales} units</div>
              <div className="font-semibold text-green-600">
                Revenue: KES {product.revenue.toLocaleString()}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit2 className="mr-2 size-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryTab() {
  const [inventory] = useState([
    {
      id: "inv-1",
      product: "Event T-Shirt",
      sku: "TSH-001",
      quantity: 150,
      lowStock: 20,
      status: "in_stock",
      location: "Warehouse A",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                  {item.product}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.sku}</td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {item.quantity}
                  {item.quantity <= item.lowStock && (
                    <span className="ml-2 text-red-600">
                      <AlertCircle className="inline size-4" />
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === "in_stock"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "in_stock" ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BundlesTab() {
  const [bundles] = useState([
    {
      id: "bundle-1",
      name: "VIP Experience Bundle",
      ticketType: "VIP Pass",
      products: ["Event T-Shirt", "VIP Accessory Kit"],
      price: 12000,
      savings: 500,
      sales: 25,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900">{bundle.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>Includes: {bundle.ticketType}</div>
              <div className="mt-2">
                <div className="font-semibold">Products:</div>
                <ul className="ml-4 list-disc">
                  {bundle.products.map((prod, idx) => (
                    <li key={idx}>{prod}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <span className="font-semibold text-slate-900">
                  KES {bundle.price.toLocaleString()}
                </span>
                <span className="ml-2 text-green-600">Save KES {bundle.savings}</span>
              </div>
              <div>Sales: {bundle.sales} bundles</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

