"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Activity,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  Globe,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function EnhancedProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: "Jane",
    lastName: "Mwangi",
    email: "jane@example.com",
    phone: "+254 700 000 000",
    organization: "Skyline Festivals",
    bio: "",
    avatarUrl: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    productUpdates: true,
    eventPerformance: true,
    opsAlerts: true,
    waitlistResale: true,
    marketing: false,
    sms: true,
    email: true,
    push: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const [activity] = useState([
    {
      id: "1",
      action: "Logged in",
      location: "Nairobi, Kenya",
      ip: "197.237.0.1",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      action: "Updated profile",
      location: "Nairobi, Kenya",
      ip: "197.237.0.1",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ]);

  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Profile & Settings</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Manage your account information, security settings, notifications,
            and activity history.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid w-full grid-cols-2 gap-2 bg-slate-100 p-2 lg:grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Personal Information</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Last Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Organization</Label>
                  <Input
                    value={profile.organization}
                    onChange={(e) =>
                      setProfile({ ...profile, organization: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    rows={4}
                    placeholder="Tell us about the events you run, partners, and upcoming series."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input
                    type="url"
                    value={profile.avatarUrl}
                    onChange={(e) =>
                      setProfile({ ...profile, avatarUrl: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-2"
                  />
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>New Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Must be at least 8 characters with numbers and special characters
                  </p>
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
                  Update Password
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSecurity({
                        ...security,
                        twoFactorEnabled: !security.twoFactorEnabled,
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      security.twoFactorEnabled
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {security.twoFactorEnabled ? "Enabled" : "Enable"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Login Alerts</h3>
                    <p className="text-sm text-slate-600">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSecurity({
                        ...security,
                        loginAlerts: !security.loginAlerts,
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      security.loginAlerts
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {security.loginAlerts ? "On" : "Off"}
                  </button>
                </div>

                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 max-w-xs"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Email Notifications</h2>
              
              <div className="space-y-4">
                {Object.entries({
                  productUpdates: "Product updates & release notes",
                  eventPerformance: "Event performance emails",
                  opsAlerts: "Ops alerts & incident summaries",
                  waitlistResale: "Waitlist + resale notifications",
                  marketing: "Marketing emails and promotions",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <span className="text-sm text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [key]: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Notification Channels</h2>
              
              <div className="space-y-4">
                {Object.entries({
                  email: "Email notifications",
                  sms: "SMS notifications",
                  push: "Push notifications",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <span className="text-sm text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [key]: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                ))}
              </div>

              <button className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
                Save Preferences
              </button>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold">Recent Activity</h2>
              
              <div className="space-y-4">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-slate-100 p-2">
                        <Activity className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.action}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {item.location}
                          </span>
                          <span>{item.ip}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">API Keys</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage your API keys for programmatic access
                  </p>
                </div>
                <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
                  <Key className="mr-2 inline h-4 w-4" />
                  Generate New Key
                </button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p>
                  ⚠️ Keep your API keys secure. Never share them publicly or
                  commit them to version control.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Production Key</p>
                      <p className="text-xs text-slate-500">
                        Created on Jan 15, 2024
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
                        Copy
                      </button>
                      <button className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold text-red-900">
                Danger Zone
              </h2>
              <p className="mb-6 text-sm text-red-700">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button className="flex items-center gap-2 rounded-xl border-2 border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

