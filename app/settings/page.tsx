"use client";

import { useState } from "react";
import { 
  Bell, 
  Mail, 
  Slack, 
  Globe,
  Shield,
  Database,
  Save,
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileCode,
  Clock,
  Zap
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { cn } from "@/lib/utils";

type TabId = "notifications" | "defaults" | "auth" | "compliance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("notifications");
  const [settings, setSettings] = useState(mockData.settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "defaults", label: "Defaults", icon: Database },
    { id: "auth", label: "Authentication", icon: Shield },
    { id: "compliance", label: "Compliance", icon: Globe }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6 max-w-4xl">
          {activeTab === "notifications" && <NotificationsTab settings={settings} />}
          {activeTab === "defaults" && <DefaultsTab settings={settings} />}
          {activeTab === "auth" && <AuthTab settings={settings} />}
          {activeTab === "compliance" && <ComplianceTab />}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ settings }: any) {
  const [channels, setChannels] = useState(settings.notifications.channels);
  const [events, setEvents] = useState(settings.notifications.events);

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Notification Channels</h3>
        
        {/* Slack Configuration */}
        <div className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Slack className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Slack</h4>
                <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={channels.slack.enabled}
                onChange={(e) => setChannels({
                  ...channels,
                  slack: { ...channels.slack, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {channels.slack.enabled && (
            <div className="ml-11 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  defaultValue={channels.slack.webhook}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel
                </label>
                <input
                  type="text"
                  defaultValue={channels.slack.channel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="#scraper-alerts"
                />
              </div>
            </div>
          )}
        </div>

        {/* Email Configuration */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-gray-500">Send alerts via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={channels.email.enabled}
                onChange={(e) => setChannels({
                  ...channels,
                  email: { ...channels.email, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {channels.email.enabled && (
            <div className="ml-11">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={channels.email.to}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="pontus@example.com"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notification Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Notification Events</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Failures</div>
              <div className="text-sm text-gray-500">Alert when a scraper run fails</div>
            </div>
            <input
              type="checkbox"
              checked={events.failures}
              onChange={(e) => setEvents({ ...events, failures: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Zero New Items</div>
              <div className="text-sm text-gray-500">Alert when no new items are found</div>
            </div>
            <input
              type="checkbox"
              checked={events.zeroNewItems}
              onChange={(e) => setEvents({ ...events, zeroNewItems: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Error Spikes</div>
              <div className="text-sm text-gray-500">Alert on unusual error patterns</div>
            </div>
            <input
              type="checkbox"
              checked={events.errorSpikes}
              onChange={(e) => setEvents({ ...events, errorSpikes: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Schema Violations</div>
              <div className="text-sm text-gray-500">Alert when parsed data doesn't match schema</div>
            </div>
            <input
              type="checkbox"
              checked={events.schemaViolations}
              onChange={(e) => setEvents({ ...events, schemaViolations: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Rate Limiting</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Notifications per Hour
            </label>
            <input
              type="number"
              defaultValue={settings.notifications.rateLimit.maxPerHour}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cooldown (minutes)
            </label>
            <input
              type="number"
              defaultValue={settings.notifications.rateLimit.cooldown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultsTab({ settings }: any) {
  return (
    <div className="space-y-6">
      {/* LLM Defaults */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          LLM Defaults
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Model
              </label>
              <select
                defaultValue={settings.defaults.model}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="gpt-5">GPT-5 ($1.25/$10)</option>
                <option value="gpt-5-mini">GPT-5 Mini ($0.25/$2) ⚡</option>
                <option value="gpt-5-nano">GPT-5 Nano ($0.05/$0.40) ⚡</option>
                <option value="gpt-4o-2024-08-06">GPT-4o (2024-08-06) ⚡</option>
                <option value="gpt-4o-mini">GPT-4o Mini ⚡</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue={settings.defaults.temperature}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              defaultValue={settings.defaults.maxTokens}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Schedule Defaults */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule Defaults
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Schedule (Cron)
          </label>
          <input
            type="text"
            defaultValue={settings.defaults.schedule}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
            placeholder="0 */6 * * *"
          />
          <p className="mt-1 text-xs text-gray-500">Default: Every 6 hours</p>
        </div>
      </div>

      {/* Content Selection Defaults */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Content Selection Defaults
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Include Regions
            </label>
            <textarea
              rows={3}
              defaultValue={settings.defaults.includeRegions?.join("\n")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="One selector per line"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Exclude Regions
            </label>
            <textarea
              rows={3}
              defaultValue={settings.defaults.excludeRegions?.join("\n")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="One selector per line"
            />
          </div>
        </div>
      </div>

      {/* Cost Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Management
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Cap Warning (SEK per day)
          </label>
          <input
            type="number"
            defaultValue={settings.defaults.costCapWarning}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="mt-1 text-xs text-gray-500">Alert when daily cost exceeds this amount</p>
        </div>
      </div>
    </div>
  );
}

function AuthTab({ settings }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Authentication Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Authentication</div>
              <div className="text-sm text-gray-500">Require login to access dashboard</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={settings.auth.enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network Restriction (CIDR)
            </label>
            <input
              type="text"
              defaultValue={settings.auth.networkRestriction}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
              placeholder="192.168.1.0/24"
            />
            <p className="mt-1 text-xs text-gray-500">Restrict access to specific IP ranges</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Single User Mode</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This dashboard is configured for single-user access only (Pontus). 
              Multi-user support with roles and permissions is not available in this version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Robots.txt Compliance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Respect robots.txt</div>
              <div className="text-sm text-gray-500">Global setting for all sources</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Policy Notes
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Notes about compliance stance, contact information, etc."
              defaultValue="Scraping for internal job aggregation purposes only. Contact: pontus@example.com"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">GDPR / Cookie Handling</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Cookie Banner Selector
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="button.accept-cookies, #cookie-accept"
              defaultValue="button.accept-cookies, .cookie-accept, #gdpr-accept"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">
              Automatically handle cookie banners when detected
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Compliance Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Per-source compliance settings can override these defaults. 
              Always ensure you have permission to scrape target websites and comply with their terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}