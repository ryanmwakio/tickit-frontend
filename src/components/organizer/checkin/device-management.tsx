"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Settings,
  RefreshCw,
  Download,
  Upload,
  XCircle,
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
import { apiClient } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ScanningDevice = {
  id: string;
  deviceName: string;
  deviceType: "mobile" | "tablet" | "handheld";
  gateId: string | null;
  gateName: string | null;
  assignedStaff: string[];
  status: "active" | "inactive" | "maintenance";
  connectionStatus: "online" | "offline" | "syncing";
  batteryLevel: number;
  firmwareVersion: string;
  lastSync: string;
  permissions: {
    canScan: boolean;
    canVoid: boolean;
    canRefund: boolean;
  };
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

// Map API device to component format
function mapApiDeviceToComponentDevice(apiDevice: {
  deviceId: string;
  deviceName: string;
  gateId: string;
  gateName: string;
  batteryLevel: number;
  connectionStatus: "online" | "offline" | "syncing";
  lastSync: string;
  firmwareVersion: string;
  scanCount: number;
}): ScanningDevice {
  return {
    id: apiDevice.deviceId,
    deviceName: apiDevice.deviceName,
    deviceType: "mobile", // Default, can be enhanced later
    gateId: apiDevice.gateId || null,
    gateName: apiDevice.gateName || null,
    assignedStaff: [], // Can be enhanced later
    status: apiDevice.connectionStatus === "offline" ? "inactive" : "active",
    connectionStatus: apiDevice.connectionStatus,
    batteryLevel: apiDevice.batteryLevel,
    firmwareVersion: apiDevice.firmwareVersion,
    lastSync: apiDevice.lastSync,
    permissions: {
      canScan: true,
      canVoid: false,
      canRefund: false,
    },
  };
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<ScanningDevice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    deviceId: string | null;
  }>({ open: false, deviceId: null });

  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        // Fetch both registered devices and check-in derived devices
        const [registeredDevices, checkinDevices] = await Promise.all([
          apiClient.get<Array<{
            deviceId: string;
            deviceName: string;
            deviceType: string;
            gateId?: string;
            status: string;
            connectionStatus: "online" | "offline" | "syncing";
            batteryLevel: number;
            firmwareVersion: string;
            lastSync: string;
            permissions: {
              canScan: boolean;
              canVoid: boolean;
              canRefund: boolean;
            };
          }>>(`/organisers/${orgId}/devices`).catch(() => []),
          apiClient.get<Array<{
            deviceId: string;
            deviceName: string;
            gateId: string;
            gateName: string;
            batteryLevel: number;
            connectionStatus: "online" | "offline" | "syncing";
            lastSync: string;
            firmwareVersion: string;
            scanCount: number;
          }>>(`/organisers/${orgId}/checkin/devices`).catch(() => []),
        ]);

        // Merge registered devices with check-in devices
        const deviceMap = new Map<string, ScanningDevice>();
        
        // First, add registered devices
        (registeredDevices || []).forEach((device) => {
          deviceMap.set(device.deviceId, {
            id: device.deviceId,
            deviceName: device.deviceName,
            deviceType: device.deviceType as "mobile" | "tablet" | "handheld",
            gateId: device.gateId || null,
            gateName: null, // Will be filled from check-in data if available
            assignedStaff: [],
            status: device.status as "active" | "inactive" | "maintenance",
            connectionStatus: device.connectionStatus,
            batteryLevel: device.batteryLevel,
            firmwareVersion: device.firmwareVersion,
            lastSync: device.lastSync,
            permissions: device.permissions,
          });
        });

        // Then, merge with check-in devices (update existing or add new)
        (checkinDevices || []).forEach((checkinDevice) => {
          const existing = deviceMap.get(checkinDevice.deviceId);
          if (existing) {
            // Update existing device with check-in data
            existing.connectionStatus = checkinDevice.connectionStatus;
            existing.batteryLevel = checkinDevice.batteryLevel;
            existing.lastSync = checkinDevice.lastSync;
            existing.gateName = checkinDevice.gateName;
          } else {
            // Add new device from check-in data
            deviceMap.set(checkinDevice.deviceId, mapApiDeviceToComponentDevice(checkinDevice));
          }
        });

        setDevices(Array.from(deviceMap.values()));
      } catch (err: unknown) {
        console.error("Failed to load devices:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load devices";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, deviceId: id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.deviceId || !organiserId) return;

    try {
      await apiClient.delete(`/organisers/${organiserId}/devices/${deleteConfirm.deviceId}`);
      setDevices(devices.filter((d) => d.id !== deleteConfirm.deviceId));
      setDeleteConfirm({ open: false, deviceId: null });
    } catch (err: unknown) {
      console.error("Failed to delete device:", err);
      alert(err instanceof Error ? err.message : "Failed to delete device");
      setDeleteConfirm({ open: false, deviceId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Smartphone className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Scanning Devices</h3>
          <p className="mt-1 text-sm text-slate-600">
            Manage scanning devices, assign to gates, and configure permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          Register Device
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Smartphone className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No devices registered</p>
          <p className="mt-2 text-sm text-slate-600">
            Register your first scanning device to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={() => setEditingDevice(device.id)}
              onDelete={() => handleDeleteClick(device.id)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <DeviceEditor
          organiserId={organiserId}
          onSave={async (device) => {
            if (!organiserId) return;
            try {
              await apiClient.post(`/organisers/${organiserId}/devices`, {
                deviceId: device.id,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                gateId: device.gateId || undefined,
                permissions: device.permissions,
              });
              setDevices([...devices, device]);
              setShowAddModal(false);
            } catch (err: unknown) {
              console.error("Failed to register device:", err);
              alert(err instanceof Error ? err.message : "Failed to register device");
            }
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, deviceId: open ? deleteConfirm.deviceId : null })}
        title="Remove Device"
        description="Are you sure you want to remove this device? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DeviceCard({
  device,
  onEdit,
  onDelete,
}: {
  device: ScanningDevice;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-6 transition hover:shadow-lg ${
        device.connectionStatus === "offline"
          ? "border-red-200 bg-red-50/30"
          : device.status === "maintenance"
          ? "border-amber-200 bg-amber-50/30"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{device.deviceName}</h4>
          <p className="mt-1 text-xs text-slate-600 capitalize">{device.deviceType}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <Edit2 className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Connection</span>
          <div className="flex items-center gap-1">
            {device.connectionStatus === "online" ? (
              <>
                <Wifi className="size-3 text-green-600" />
                <span className="font-semibold text-green-600">Online</span>
              </>
            ) : device.connectionStatus === "syncing" ? (
              <>
                <RefreshCw className="size-3 text-amber-600" />
                <span className="font-semibold text-amber-600">Syncing</span>
              </>
            ) : (
              <>
                <WifiOff className="size-3 text-red-600" />
                <span className="font-semibold text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
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

      {device.gateName && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">Assigned Gate</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{device.gateName}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>FW: {device.firmwareVersion}</span>
        <span>
          {new Date(device.lastSync).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function DeviceEditor({
  organiserId,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  onSave: (device: ScanningDevice) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    deviceName: "",
    deviceType: "mobile" as "mobile" | "tablet" | "handheld",
    gateId: "",
    permissions: {
      canScan: true,
      canVoid: false,
      canRefund: false,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Register Device</h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Device Name *</Label>
            <Input
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              placeholder="e.g., Scanner #001"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Device Type</Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) =>
                setFormData({ ...formData, deviceType: value as ScanningDevice["deviceType"] })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="handheld">Handheld Scanner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-semibold text-slate-900">Permissions</h4>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.canScan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canScan: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Can Scan Tickets</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.canVoid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canVoid: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Can Void Tickets</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.canRefund}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canRefund: e.target.checked },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Can Process Refunds</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!formData.deviceName.trim()) {
                alert("Device name is required");
                return;
              }
              const deviceId = `device-${Date.now()}`;
              const newDevice: ScanningDevice = {
                id: deviceId,
                deviceName: formData.deviceName,
                deviceType: formData.deviceType,
                gateId: formData.gateId || null,
                gateName: null,
                assignedStaff: [],
                status: "active",
                connectionStatus: "offline",
                batteryLevel: 100,
                firmwareVersion: "v2.1.0",
                lastSync: new Date().toISOString(),
                permissions: formData.permissions,
              };
              onSave(newDevice);
            }}
            disabled={!organiserId}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Register Device
          </button>
        </div>
      </div>
    </div>
  );
}

