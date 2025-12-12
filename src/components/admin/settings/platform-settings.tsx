"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Settings,
  Palette,
  Mail,
  MessageSquare,
  CreditCard,
  FileText,
  Globe,
  Save,
  Plus,
  Edit2,
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function PlatformSettings() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "communications" | "cms">("general");
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Tixhub",
    defaultCurrency: "KES",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSettings = async () => {
    // Settings would typically be stored in a platform config table
    // For now, we'll use defaults and allow saving
  };

  const handleSaveGeneral = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // TODO: Implement API endpoint for saving platform settings
      // await apiClient.patch('/admin/settings/general', generalSettings);
      toast.success('Saved', 'General settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="payments">Payment Config</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="cms">Content Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Platform Name</Label>
                <Input
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Default Currency</Label>
                <Select
                  value={generalSettings.defaultCurrency}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultCurrency: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveGeneral} disabled={loading}>
                <Save className="mr-2 size-4" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentSettingsTab user={user} toast={toast} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationSettingsTab user={user} toast={toast} />
        </TabsContent>

        <TabsContent value="cms" className="mt-6">
          <CMSTab user={user} toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentSettingsTab({ user, toast }: { user: any; toast: any }) {
  const [settings, setSettings] = useState({
    platformFee: "5",
    vatRate: "16",
    commissionRate: "3",
    mpesaEnabled: true,
    cardEnabled: true,
    stripeKey: "",
    mpesaPassKey: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // TODO: Implement API endpoint for saving payment settings
      // await apiClient.patch('/admin/settings/payments', settings);
      toast.success('Saved', 'Payment settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Fee Configuration</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Platform Fee (%)</Label>
            <Input
              type="number"
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>VAT Rate (%)</Label>
            <Input
              type="number"
              value={settings.vatRate}
              onChange={(e) => setSettings({ ...settings, vatRate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Commission Rate (%)</Label>
            <Input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">MPesa</div>
              <div className="text-sm text-slate-600">Mobile money payments</div>
            </div>
            <input
              type="checkbox"
              checked={settings.mpesaEnabled}
              onChange={(e) => setSettings({ ...settings, mpesaEnabled: e.target.checked })}
              className="size-4 rounded border-slate-300"
            />
          </div>
          {settings.mpesaEnabled && (
            <div>
              <Label>MPesa Pass Key</Label>
              <Input
                type="password"
                value={settings.mpesaPassKey}
                onChange={(e) => setSettings({ ...settings, mpesaPassKey: e.target.value })}
                className="mt-1"
                placeholder="Enter MPesa pass key"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Card Payments</div>
              <div className="text-sm text-slate-600">Credit/debit card processing</div>
            </div>
            <input
              type="checkbox"
              checked={settings.cardEnabled}
              onChange={(e) => setSettings({ ...settings, cardEnabled: e.target.checked })}
              className="size-4 rounded border-slate-300"
            />
          </div>
          {settings.cardEnabled && (
            <div>
              <Label>Stripe API Key</Label>
              <Input
                type="password"
                value={settings.stripeKey}
                onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value })}
                className="mt-1"
                placeholder="Enter Stripe API key"
              />
            </div>
          )}
        </div>
      </div>
      <Button onClick={handleSave} disabled={loading}>
        <Save className="mr-2 size-4" />
        {loading ? 'Saving...' : 'Save Payment Settings'}
      </Button>
    </div>
  );
}

function CommunicationSettingsTab({ user, toast }: { user: any; toast: any }) {
  const [settings, setSettings] = useState({
    smsProvider: "twilio",
    emailProvider: "sendgrid",
    smsApiKey: "",
    emailApiKey: "",
    defaultFromEmail: "noreply@tixhub.com",
    defaultFromSms: "Tixhub",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // TODO: Implement API endpoint for saving communication settings
      // await apiClient.patch('/admin/settings/communications', settings);
      toast.success('Saved', 'Communication settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">SMS Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label>SMS Provider</Label>
            <Select
              value={settings.smsProvider}
              onValueChange={(value) => setSettings({ ...settings, smsProvider: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="africas_talking">Africa's Talking</SelectItem>
                <SelectItem value="safaricom">Safaricom SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>SMS API Key</Label>
            <Input
              type="password"
              value={settings.smsApiKey}
              onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Default Sender ID</Label>
            <Input
              value={settings.defaultFromSms}
              onChange={(e) => setSettings({ ...settings, defaultFromSms: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Email Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label>Email Provider</Label>
            <Select
              value={settings.emailProvider}
              onValueChange={(value) => setSettings({ ...settings, emailProvider: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">AWS SES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email API Key</Label>
            <Input
              type="password"
              value={settings.emailApiKey}
              onChange={(e) => setSettings({ ...settings, emailApiKey: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Default From Email</Label>
            <Input
              type="email"
              value={settings.defaultFromEmail}
              onChange={(e) => setSettings({ ...settings, defaultFromEmail: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} disabled={loading}>
        <Save className="mr-2 size-4" />
        {loading ? 'Saving...' : 'Save Communication Settings'}
      </Button>
    </div>
  );
}

function CMSTab({ user, toast }: { user: any; toast: any }) {
  const [content, setContent] = useState<Array<{ id: string; title: string; updated: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadContent = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // TODO: Implement API endpoint for loading CMS content
      // const data = await apiClient.get('/admin/cms/content');
      // setContent(data);
      // For now, use defaults
      setContent([
        { id: "privacy", title: "Privacy Policy", updated: "2024-03-01" },
        { id: "terms", title: "Terms & Conditions", updated: "2024-02-15" },
        { id: "about", title: "About Us", updated: "2024-01-20" },
      ]);
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Content Pages</h3>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Add Page
        </Button>
      </div>
      <div className="space-y-3">
        {content.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="font-semibold text-slate-900">{page.title}</div>
              <div className="text-sm text-slate-600">
                Last updated: {new Date(page.updated).toLocaleDateString()}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit2 className="mr-2 size-4" />
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

