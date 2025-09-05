"use client";

import { useState } from "react";
import { 
  Shield,
  Database,
  Save,
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileCode,
  Clock,
  Zap,
  FolderTree,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { cn } from "@/lib/utils";

type TabId = "defaults" | "auth" | "navigation";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("defaults");
  const [settings, setSettings] = useState(mockData.settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "defaults", label: "Defaults", icon: Database },
    { id: "navigation", label: "Navigation", icon: FolderTree },
    { id: "auth", label: "Authentication", icon: Shield }
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
          {activeTab === "defaults" && <DefaultsTab settings={settings} />}
          {activeTab === "navigation" && <NavigationTab settings={settings} />}
          {activeTab === "auth" && <AuthTab settings={settings} />}
        </div>
      </div>
    </div>
  );
}


// Simple two-level navigation editor (Categories and Subcategories)
function NavigationTab({ settings }: any) {
  type Subcategory = { id: string; name: string };
  type Category = { id: string; name: string; subcategories: Subcategory[] };

  const initialNav: Category[] = (settings?.navigation as Category[] | undefined) || [
    { id: "cat_1", name: "Marketing", subcategories: [
      { id: "cat_1_1", name: "E-commerce" },
      { id: "cat_1_2", name: "SEO" }
    ]},
    { id: "cat_2", name: "Sales", subcategories: [
      { id: "cat_2_1", name: "B2B" },
      { id: "cat_2_2", name: "B2C" }
    ]}
  ];

  const [nav, setNav] = useState<Category[]>(initialNav);

  const newId = () => Math.random().toString(36).slice(2, 9);

  const addCategory = () => {
    setNav(prev => [...prev, { id: `cat_${newId()}`, name: "New Category", subcategories: [] }]);
  };

  const updateCategoryName = (catId: string, name: string) => {
    setNav(prev => prev.map(c => c.id === catId ? { ...c, name } : c));
  };

  const deleteCategory = (catId: string) => {
    setNav(prev => prev.filter(c => c.id !== catId));
  };

  const moveCategory = (index: number, dir: -1 | 1) => {
    setNav(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const addSub = (catId: string) => {
    setNav(prev => prev.map(c => c.id === catId
      ? { ...c, subcategories: [...c.subcategories, { id: `sub_${newId()}`, name: "New Subcategory" }] }
      : c
    ));
  };

  const updateSub = (catId: string, subId: string, name: string) => {
    setNav(prev => prev.map(c => c.id === catId
      ? { ...c, subcategories: c.subcategories.map(s => s.id === subId ? { ...s, name } : s) }
      : c
    ));
  };

  const deleteSub = (catId: string, subId: string) => {
    setNav(prev => prev.map(c => c.id === catId
      ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) }
      : c
    ));
  };

  const moveSub = (catId: string, index: number, dir: -1 | 1) => {
    setNav(prev => prev.map(c => {
      if (c.id !== catId) return c;
      const nextSubs = [...c.subcategories];
      const target = index + dir;
      if (target < 0 || target >= nextSubs.length) return c;
      const [item] = nextSubs.splice(index, 1);
      nextSubs.splice(target, 0, item);
      return { ...c, subcategories: nextSubs };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Website Navigation</h3>
          </div>
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        <div className="space-y-3">
          {nav.map((cat, i) => (
            <div key={cat.id} className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <input
                  value={cat.name}
                  onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Category name"
                />
                <div className="flex items-center gap-1">
                  <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="p-2 rounded border disabled:opacity-50"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => moveCategory(i, +1)} disabled={i === nav.length - 1} className="p-2 rounded border disabled:opacity-50"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded border hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-600" /></button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                {cat.subcategories.map((sub, si) => (
                  <div key={sub.id} className="flex items-center gap-3 pl-7">
                    <span className="w-4 h-4 rounded bg-gray-200 inline-block" />
                    <input
                      value={sub.name}
                      onChange={(e) => updateSub(cat.id, sub.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Subcategory name"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveSub(cat.id, si, -1)} disabled={si === 0} className="p-2 rounded border disabled:opacity-50"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => moveSub(cat.id, si, +1)} disabled={si === cat.subcategories.length - 1} className="p-2 rounded border disabled:opacity-50"><ArrowDown className="h-4 w-4" /></button>
                      <button onClick={() => deleteSub(cat.id, sub.id)} className="p-2 rounded border hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-600" /></button>
                    </div>
                  </div>
                ))}
                <div className="pl-7">
                  <button onClick={() => addSub(cat.id)} className="inline-flex items-center gap-2 px-2 py-1 text-xs border rounded hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Add Subcategory
                  </button>
                </div>
              </div>
            </div>
          ))}
          {nav.length === 0 && (
            <div className="text-sm text-gray-500">No categories yet. Click “Add Category” to get started.</div>
          )}
        </div>
      </div>

      {/* Optional: Preview JSON for clarity */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Current structure (preview)</div>
        <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-3">{JSON.stringify(nav, null, 2)}</pre>
        <p className="text-xs text-gray-500 mt-2">This is UI-only and would be persisted via backend in production.</p>
      </div>
    </div>
  );
}

function DefaultsTab({ settings }: any) {
  const models: { id: string; label?: string; name?: string }[] = settings?.llmModels || [
    { id: "gpt-5", label: "GPT-5 ($1.25/$10)" },
    { id: "gpt-5-mini", label: "GPT-5 Mini ($0.25/$2) ⚡" },
    { id: "gpt-5-nano", label: "GPT-5 Nano ($0.05/$0.40) ⚡" },
    { id: "gpt-4o-2024-08-06", label: "GPT-4o (2024-08-06) ⚡" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini ⚡" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { id: "claude-3", label: "Claude 3" },
  ];
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
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label || m.name || m.id}
                  </option>
                ))}
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
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Email Address
            </label>
            <input
              type="email"
              defaultValue={settings.defaults.costAlertEmail}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="your-email@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">Email address to notify when cost limits are exceeded</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthTab({ settings }: any) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Password Authentication</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Length
              </label>
              <input
                type="number"
                min="8"
                max="128"
                defaultValue={settings.auth.password?.minLength || 12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                defaultValue={settings.auth.session?.timeoutHours || 24}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={settings.auth.password?.requireSpecialChars}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Require special characters</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={settings.auth.session?.rememberMe}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm">Allow "Remember Me"</span>
            </label>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security Recommendation</h4>
            <p className="text-sm text-blue-700 mt-1">
              Use a strong, unique password with at least 12 characters including special characters. 
              Since you work from multiple locations, password authentication provides the flexibility you need 
              while maintaining reasonable security for single-user access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
