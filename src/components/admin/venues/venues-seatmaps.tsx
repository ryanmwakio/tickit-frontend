"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Building2,
  Map,
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Users,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  seatMaps: number;
  events: number;
  contact?: string;
};

const mockVenues: Venue[] = [
  {
    id: "venue-1",
    name: "Kenyatta International Conference Centre",
    address: "Harambee Avenue",
    city: "Nairobi",
    capacity: 5000,
    seatMaps: 3,
    events: 12,
  },
];

export function VenuesSeatMaps() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"venues" | "seatmaps">("venues");
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (user && activeTab === "venues") {
      loadVenues(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, searchQuery]);

  const loadVenues = async (reset: boolean = true) => {
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
          name: string;
          address: string;
          city: string;
          country?: string;
          capacity?: number;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/venues?page=${page}&limit=9&search=${encodeURIComponent(searchQuery || '')}`);

      // Get event counts for each venue
      const mappedVenues: Venue[] = await Promise.all(
        (response.data || []).map(async (v) => {
          // Get events using this venue
          const events = await apiClient.get<{ data: Array<any> }>(`/events?venueId=${v.id}&limit=1000`).catch(() => ({ data: [] }));
          
          return {
            id: v.id,
            name: v.name,
            address: v.address,
            city: v.city,
            capacity: v.capacity || 0,
            seatMaps: 0, // Would need seat map count
            events: events.data?.length || 0,
          };
        })
      );

      if (reset) {
        setVenues(mappedVenues);
      } else {
        setVenues(prev => [...prev, ...mappedVenues]);
      }

      setHasMore(response.total > displayedCount + mappedVenues.length);
    } catch (error) {
      console.error('Failed to load venues:', error);
      toast.error('Failed to load venues', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadVenues(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="seatmaps">Seat Maps</TabsTrigger>
          </TabsList>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Venue
          </Button>
        </div>

        <TabsContent value="venues" className="mt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                  <p className="mt-4 text-sm text-slate-600">Loading venues...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{venue.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{venue.address}, {venue.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>Capacity: {venue.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Map className="size-4" />
                      <span>{venue.seatMaps} seat maps</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit2 className="mr-2 size-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="size-4" />
                    </Button>
                  </div>
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

              {venues.length === 0 && !loadingMore && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                  <p className="text-slate-600">No venues found</p>
                </div>
              )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seatmaps" className="mt-6">
          <SeatMapsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SeatMapsTab() {
  const [seatMaps] = useState([
    {
      id: "sm-1",
      name: "Main Hall - Standard",
      venue: "KICC",
      capacity: 2000,
      sections: 8,
      usedInEvents: 5,
      createdAt: "2024-01-01",
    },
    {
      id: "sm-2",
      name: "VIP Section",
      venue: "KICC",
      capacity: 200,
      sections: 2,
      usedInEvents: 3,
      createdAt: "2024-02-01",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Seat Maps</h3>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Create Seat Map
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seatMaps.map((seatMap) => (
          <div
            key={seatMap.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <h4 className="text-lg font-semibold text-slate-900">{seatMap.name}</h4>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>Venue: {seatMap.venue}</div>
              <div>Capacity: {seatMap.capacity.toLocaleString()}</div>
              <div>Sections: {seatMap.sections}</div>
              <div>Used in {seatMap.usedInEvents} events</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="mr-2 size-4" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Edit2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

