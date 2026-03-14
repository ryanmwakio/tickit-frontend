"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  ScanLine,
  Users,
  Monitor,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Search,
  Download,
  Settings,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type DeviceStatus = "online" | "offline" | "error";

type ScanDevice = {
  id: string;
  name: string;
  deviceId: string;
  eventId: string;
  eventName: string;
  gate: string;
  status: DeviceStatus;
  operator: string;
  lastScan: string;
  scansToday: number;
  firmware: string;
  ipAddress: string;
  batteryLevel?: number;
  location?: string;
};

type ScanEvent = {
  id: string;
  ticketNumber: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  gate: string;
  status: "success" | "duplicate" | "invalid" | "fraud";
  customerName: string;
  eventName: string;
  scannedBy?: string; // Staff/scanner name
  staffId?: string;
};

const mockDevices: ScanDevice[] = [
  {
    id: "device-1",
    name: "Gate 1 Scanner",
    deviceId: "SCN-001",
    eventId: "event-1",
    eventName: "Nairobi Music Festival 2024",
    gate: "Main Entrance",
    status: "online",
    operator: "John Doe",
    lastScan: "2024-03-15T18:45:00Z",
    scansToday: 245,
    firmware: "v2.1.3",
    ipAddress: "192.168.1.10",
    batteryLevel: 85,
    location: "Main Gate",
  },
  {
    id: "device-2",
    name: "VIP Scanner",
    deviceId: "SCN-002",
    eventId: "event-1",
    eventName: "Nairobi Music Festival 2024",
    gate: "VIP Entrance",
    status: "offline",
    operator: "Jane Smith",
    lastScan: "2024-03-15T17:30:00Z",
    scansToday: 120,
    firmware: "v2.1.2",
    ipAddress: "192.168.1.11",
    batteryLevel: 45,
  },
];

const mockScans: ScanEvent[] = [
  {
    id: "scan-1",
    ticketNumber: "TIX-2024-001234",
    timestamp: "2024-03-15T18:45:00Z",
    deviceId: "SCN-001",
    deviceName: "Gate 1 Scanner",
    gate: "Main Entrance",
    status: "success",
    customerName: "John Doe",
    eventName: "Nairobi Music Festival 2024",
  },
  {
    id: "scan-2",
    ticketNumber: "TIX-2024-001235",
    timestamp: "2024-03-15T18:46:00Z",
    deviceId: "SCN-001",
    deviceName: "Gate 1 Scanner",
    gate: "Main Entrance",
    status: "duplicate",
    customerName: "Jane Smith",
    eventName: "Nairobi Music Festival 2024",
  },
];

export function CheckInGateManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [devices, setDevices] = useState<ScanDevice[]>([]);
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "devices" | "scans">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadStats();
      if (activeTab === "scans") {
        loadScans(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, searchQuery]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const stats = await apiClient.get<{
        totalCheckins: number;
        todayCheckins: number;
        totalDevices: number;
        onlineDevices: number;
      }>('/admin/checkins/stats');
      
      // For now, devices would come from organiser metadata - simplified
      setDevices([]);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadScans = async (reset: boolean = true) => {
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
          createdAt: string;
          deviceId?: string;
          deviceName?: string;
          isDuplicate?: boolean;
          staffId?: string;
          gate?: { name?: string };
          ticket?: {
            ticketNumber: string;
            ticketType?: { event?: { title: string; id: string } };
            orderItem?: { order?: { buyer?: { firstName?: string; lastName?: string; email: string } } };
          };
          staff?: { firstName?: string; lastName?: string };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/checkins?page=${page}&limit=9&search=${encodeURIComponent(searchQuery || '')}`);

      const mappedScans: ScanEvent[] = (response.data || []).map((c) => {
        const buyer = c.ticket?.orderItem?.order?.buyer;
        const staffName = c.staff 
          ? `${c.staff.firstName || ''} ${c.staff.lastName || ''}`.trim() || 'Staff'
          : 'System';
        return {
          id: c.id,
          ticketNumber: c.ticket?.ticketNumber || 'Unknown',
          timestamp: c.createdAt,
          deviceId: c.deviceId || 'N/A',
          deviceName: c.deviceName || 'N/A',
          gate: c.gate?.name || 'N/A',
          status: c.isDuplicate ? 'duplicate' : 'success',
          customerName: buyer ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.email : 'Unknown',
          eventName: c.ticket?.ticketType?.event?.title || 'Unknown Event',
          scannedBy: staffName,
          staffId: c.staffId,
        };
      });

      if (reset) {
        setScans(mappedScans);
      } else {
        setScans(prev => [...prev, ...mappedScans]);
      }

      setHasMore(response.total > displayedCount + mappedScans.length);
    } catch (error) {
      console.error('Failed to load scans:', error);
      toast.error('Failed to load scans', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadScans(false);
  };

  const handleExport = () => {
    const csv = [
      ['Ticket Number', 'Customer', 'Event', 'Device', 'Gate', 'Status', 'Timestamp'],
      ...scans.map((s) => [
        s.ticketNumber,
        s.customerName,
        s.eventName,
        s.deviceName,
        s.gate,
        s.status,
        new Date(s.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-checkins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Check-ins exported to CSV');
  };

  const stats = useMemo(() => {
    const todayScans = scans.filter((s) => {
      const scanDate = new Date(s.timestamp).toDateString();
      const today = new Date().toDateString();
      return scanDate === today && s.status === "success";
    });
    return {
      totalDevices: devices.length,
      onlineDevices: devices.filter((d) => d.status === "online").length,
      totalScansToday: scans.filter((s) => {
        const scanDate = new Date(s.timestamp).toDateString();
        const today = new Date().toDateString();
        return scanDate === today;
      }).length,
      successfulScans: todayScans.length,
      duplicateAttempts: scans.filter((s) => s.status === "duplicate").length,
    };
  }, [devices, scans]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Devices</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalDevices}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="size-4 text-green-600" />
            <span>Online</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.onlineDevices}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Scans Today</div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.totalScansToday}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Successful</div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.successfulScans}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Duplicates</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.duplicateAttempts}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices ({stats.totalDevices})</TabsTrigger>
            <TabsTrigger value="scans">Scan Logs</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Live Activity */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Live Activity</h3>
              <div className="space-y-3">
                {scans.slice(0, 5).map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {scan.ticketNumber}
                      </div>
                      <div className="text-xs text-slate-600">{scan.gate}</div>
                      <div className="text-xs text-slate-500">By: {scan.scannedBy || 'System'}</div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={scan.status} />
                      <div className="text-xs text-slate-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Device Status</h3>
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-2 rounded-full ${
                            device.status === "online" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-semibold text-slate-900">{device.name}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {device.scansToday} scans today
                      </div>
                    </div>
                    {device.batteryLevel && (
                      <div className="text-xs text-slate-600">
                        {device.batteryLevel}% battery
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Gate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Scans Today
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Last Scan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{device.name}</div>
                        <div className="text-xs text-slate-500">{device.deviceId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{device.eventName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{device.gate}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <DeviceStatusBadge status={device.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{device.scansToday}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(device.lastScan).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="scans" className="mt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by ticket number, customer, gate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                  <p className="mt-4 text-sm text-slate-600">Loading scans...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Gate/Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Scanned By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scans.map((scan) => (
                        <tr key={scan.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                            {scan.ticketNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">{scan.customerName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {scan.gate} - {scan.deviceName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {scan.scannedBy || 'System'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <StatusBadge status={scan.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(scan.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

                {scans.length === 0 && !loadingMore && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <p className="text-slate-600">No scans found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const config = {
    online: { label: "Online", className: "bg-green-100 text-green-700", icon: Wifi },
    offline: { label: "Offline", className: "bg-red-100 text-red-700", icon: WifiOff },
    error: { label: "Error", className: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  };
  const statusConfig = config[status];
  const Icon = statusConfig.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      <Icon className="size-3" />
      {statusConfig.label}
    </span>
  );
}

function StatusBadge({ status }: { status: "success" | "duplicate" | "invalid" | "fraud" }) {
  const config = {
    success: { label: "Success", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    duplicate: { label: "Duplicate", className: "bg-red-100 text-red-700", icon: AlertTriangle },
    invalid: { label: "Invalid", className: "bg-amber-100 text-amber-700", icon: XCircle },
    fraud: { label: "Fraud", className: "bg-red-100 text-red-700", icon: AlertTriangle },
  };
  const statusConfig = config[status];
  const Icon = statusConfig.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      <Icon className="size-3" />
      {statusConfig.label}
    </span>
  );
}

