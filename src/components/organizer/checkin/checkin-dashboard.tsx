"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";

type GateActivity = {
  gateId: string;
  gateName: string;
  scannedCount: number;
  expectedCount: number;
  duplicateScans: number;
  fraudAttempts: number;
  throughput: number; // scans per minute
  status: "active" | "warning" | "error";
  lastScan: string;
  staff: {
    id: string;
    name: string;
    scans: number;
    deviceId: string;
  }[];
};

type DeviceStatus = {
  deviceId: string;
  deviceName: string;
  gateId: string;
  gateName: string;
  batteryLevel: number;
  connectionStatus: "online" | "offline" | "syncing";
  lastSync: string;
  firmwareVersion: string;
  scanCount: number;
};

// Helper to get organiserId
async function getUserOrganiserId(): Promise<string | null> {
  try {
    const events = await apiClient.get<Array<{ organiserId?: string }>>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

export function CheckInDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<string>("current");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gates, setGates] = useState<GateActivity[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalScanned: 0,
    totalExpected: 0,
    duplicateScans: 0,
    fraudAttempts: 0,
    totalThroughput: 0,
  });

  // Fetch organiserId and data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        // Fetch check-in stats
        const stats = await apiClient.get<{
          totalScanned: number;
          totalExpected: number;
          duplicateScans: number;
          fraudAttempts: number;
          totalThroughput: number;
          checkInRate: number;
        }>(`/organisers/${orgId}/checkin/stats${selectedEvent !== "current" ? `?eventId=${selectedEvent}` : ""}`);

        setTotalStats({
          totalScanned: stats.totalScanned || 0,
          totalExpected: stats.totalExpected || 0,
          duplicateScans: stats.duplicateScans || 0,
          fraudAttempts: stats.fraudAttempts || 0,
          totalThroughput: stats.totalThroughput || 0,
        });

        // Fetch gate activity
        const gatesData = await apiClient.get<GateActivity[]>(
          `/organisers/${orgId}/checkin/gates${selectedEvent !== "current" ? `?eventId=${selectedEvent}` : ""}`
        );
        setGates(gatesData || []);

        // Fetch device status
        const devicesData = await apiClient.get<DeviceStatus[]>(
          `/organisers/${orgId}/checkin/devices`
        );
        setDevices(devicesData || []);
      } catch (err: unknown) {
        console.error("Failed to load check-in data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load check-in data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Auto-refresh if enabled
    if (isAutoRefresh) {
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedEvent, isAutoRefresh]);

  const checkInRate = totalStats.totalExpected > 0
    ? (totalStats.totalScanned / totalStats.totalExpected) * 100
    : 0;

  const handleRefresh = async () => {
    if (!organiserId) return;
    try {
      setLoading(true);
      const stats = await apiClient.get(`/organisers/${organiserId}/checkin/stats${selectedEvent !== "current" ? `?eventId=${selectedEvent}` : ""}`);
      setTotalStats({
        totalScanned: stats.totalScanned || 0,
        totalExpected: stats.totalExpected || 0,
        duplicateScans: stats.duplicateScans || 0,
        fraudAttempts: stats.fraudAttempts || 0,
        totalThroughput: stats.totalThroughput || 0,
      });
      const gatesData = await apiClient.get(`/organisers/${organiserId}/checkin/gates${selectedEvent !== "current" ? `?eventId=${selectedEvent}` : ""}`);
      setGates(gatesData || []);
      const devicesData = await apiClient.get(`/organisers/${organiserId}/checkin/devices`);
      setDevices(devicesData || []);
    } catch (err) {
      console.error("Failed to refresh:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && gates.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading check-in data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-blue-600" />
            <span>Scanned</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalScanned.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            of {totalStats.totalExpected.toLocaleString()} expected
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-green-600" />
            <span>Check-in Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {checkInRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="size-4 text-purple-600" />
            <span>Throughput</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalThroughput} /min
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="size-4" />
            <span>Duplicates</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-900">
            {totalStats.duplicateScans}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="size-4" />
            <span>Fraud Alerts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-900">
            {totalStats.fraudAttempts}
          </p>
        </div>
      </div>

      {/* Gate Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Gate Activity</h3>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
                className="size-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-600">Auto-refresh</span>
            </label>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {gates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Activity className="mx-auto size-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">No gate activity yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Gate activity will appear here once check-ins start
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gates.map((gate) => (
              <GateCard key={gate.gateId} gate={gate} />
            ))}
          </div>
        )}
      </div>

      {/* Device Status */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Device Status</h3>
        {devices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Smartphone className="mx-auto size-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">No devices registered</p>
            <p className="mt-2 text-sm text-slate-600">
              Device status will appear here once devices are used for scanning
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard key={device.deviceId} device={device} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GateCard({ gate }: { gate: GateActivity }) {
  const checkInRate = gate.expectedCount > 0
    ? (gate.scannedCount / gate.expectedCount) * 100
    : 0;

  return (
    <div
      className={`rounded-xl border-2 p-6 transition hover:shadow-lg ${
        gate.status === "warning"
          ? "border-amber-200 bg-amber-50/30"
          : gate.status === "error"
          ? "border-red-200 bg-red-50/30"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{gate.gateName}</h4>
          <p className="mt-1 text-sm text-slate-600">
            {gate.scannedCount} / {gate.expectedCount} scanned
          </p>
        </div>
        {gate.status === "warning" && (
          <AlertTriangle className="size-5 text-amber-600" />
        )}
        {gate.status === "error" && (
          <AlertTriangle className="size-5 text-red-600" />
        )}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
          <span>Check-in Progress</span>
          <span className="font-semibold">{checkInRate.toFixed(1)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all"
            style={{ width: `${Math.min(checkInRate, 100)}%` }}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div>
          <p className="text-xs text-slate-600">Throughput</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{gate.throughput}/min</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Duplicates</p>
          <p className="mt-1 text-sm font-semibold text-amber-600">{gate.duplicateScans}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Fraud</p>
          <p className="mt-1 text-sm font-semibold text-red-600">{gate.fraudAttempts}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">Staff Activity</p>
        {gate.staff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2"
          >
            <span className="text-sm text-slate-900">{staffMember.name}</span>
            <span className="text-xs font-semibold text-slate-600">{staffMember.scans} scans</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceCard({ device }: { device: DeviceStatus }) {
  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        device.connectionStatus === "offline"
          ? "border-red-200 bg-red-50/30"
          : device.connectionStatus === "syncing"
          ? "border-amber-200 bg-amber-50/30"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-semibold text-slate-900">{device.deviceName}</h5>
          <p className="mt-1 text-xs text-slate-600">{device.gateName}</p>
        </div>
        {device.connectionStatus === "online" ? (
          <Wifi className="size-5 text-green-600" />
        ) : (
          <WifiOff className="size-5 text-red-600" />
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Battery</span>
          <span className="font-semibold text-slate-900">{device.batteryLevel}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all ${
              device.batteryLevel > 50
                ? "bg-green-500"
                : device.batteryLevel > 20
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${device.batteryLevel}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span>Scans: {device.scanCount}</span>
        <span>FW: {device.firmwareVersion}</span>
      </div>
    </div>
  );
}

