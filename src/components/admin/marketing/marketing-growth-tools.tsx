"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Megaphone,
  Mail,
  MessageSquare,
  Tag,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function MarketingGrowthTools() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"campaigns" | "promos" | "affiliates">("campaigns");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="promos">Promo Codes</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          </TabsList>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Create Campaign
          </Button>
        </div>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsTab user={user} toast={toast} />
        </TabsContent>

        <TabsContent value="promos" className="mt-6">
          <PromoCodesTab user={user} toast={toast} />
        </TabsContent>

        <TabsContent value="affiliates" className="mt-6">
          <AffiliatesTab user={user} toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CampaignsTab({ user, toast }: { user: any; toast: any }) {
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    startDate: string;
    endDate: string;
    organiserName?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiClient.get<Array<{
        id: string;
        name: string;
        type: string;
        status: string;
        startDate: string;
        endDate: string;
        organiserName: string;
      }>>('/admin/marketing/campaigns');
      
      setCampaigns(data.map((c) => ({
        ...c,
        sent: 0, // Would need campaign tracking
        opened: 0,
        clicked: 0,
        converted: 0,
      })));
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-600">Loading campaigns...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Organiser
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns.length > 0 ? campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{campaign.name}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{campaign.organiserName || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{campaign.type}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Button variant="outline" size="sm">
                    <Eye className="size-4" />
                  </Button>
                </td>
              </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-600">
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PromoCodesTab({ user, toast }: { user: any; toast: any }) {
  const [promos, setPromos] = useState<Array<{
    id: string;
    code: string;
    discount: string;
    type: string;
    usage: number;
    limit: number;
    expires: string;
    status: string;
    organiserName?: string;
  }>>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadPromos(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchQuery]);

  const loadPromos = async (reset: boolean = true) => {
    if (!user) return;
    try {
      if (reset) {
        setLoading(true);
        setDisplayedCount(9);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : Math.floor(displayedCount / 9) + 1;
      
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          code: string;
          type: string;
          value: number;
          maxUses?: number;
          usesCount: number;
          validUntil?: string;
          isActive: boolean;
          organiser?: { name: string };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/marketing/promo-codes?page=${page}&limit=9&search=${encodeURIComponent(searchQuery || '')}`);

      const mappedPromos = (response.data || []).map((p) => ({
        id: p.id,
        code: p.code,
        discount: p.type === 'PERCENTAGE' ? `${p.value}%` : `KES ${p.value}`,
        type: p.type.toLowerCase(),
        usage: p.usesCount || 0,
        limit: p.maxUses || 0,
        expires: p.validUntil || '',
        status: p.isActive ? 'active' : 'inactive',
        organiserName: p.organiser?.name,
      }));

      if (reset) {
        setPromos(mappedPromos);
      } else {
        setPromos(prev => [...prev, ...mappedPromos]);
      }

      setHasMore(response.total > displayedCount + mappedPromos.length);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
      toast.error('Failed to load promo codes', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadPromos(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search promo codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-600">Loading promo codes...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promos.map((promo) => (
          <div
            key={promo.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">{promo.code}</div>
                <div className="mt-1 text-sm text-slate-600">{promo.discount} off</div>
              </div>
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                {promo.status}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Usage:</span>
                <span className="font-semibold text-slate-900">
                  {promo.usage} / {promo.limit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Expires:</span>
                <span className="text-slate-900">{new Date(promo.expires).toLocaleDateString()}</span>
              </div>
            </div>
            {promo.organiserName && (
              <div className="mt-2 text-xs text-slate-500">
                Organiser: {promo.organiserName}
              </div>
            )}
          </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}

          {promos.length === 0 && !loadingMore && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">No promo codes found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AffiliatesTab({ user, toast }: { user: any; toast: any }) {
  const [affiliates, setAffiliates] = useState<Array<{
    id: string;
    name: string;
    link: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
    organiserName?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAffiliates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAffiliates = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiClient.get<Array<{
        id: string;
        name: string;
        code: string;
        commissionRate: number;
        organiserName: string;
      }>>('/admin/marketing/affiliates');
      
      setAffiliates(data.map((aff) => ({
        id: aff.id,
        name: aff.name,
        link: `tickit.com/ref/${aff.code}`,
        clicks: 0, // Would need tracking
        conversions: 0,
        revenue: 0,
        commission: 0,
        organiserName: aff.organiserName,
      })));
    } catch (error) {
      console.error('Failed to load affiliates:', error);
      toast.error('Failed to load affiliates', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-600">Loading affiliates...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Organiser
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {affiliates.length > 0 ? affiliates.map((aff) => (
              <tr key={aff.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                  {aff.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{aff.organiserName || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{aff.link}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{aff.clicks}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{aff.conversions}</td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  KES {(aff.revenue / 1000).toFixed(0)}k
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  KES {(aff.commission / 1000).toFixed(0)}k
                </td>
              </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                    No affiliates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

