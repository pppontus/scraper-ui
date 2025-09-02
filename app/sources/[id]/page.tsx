"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  TestTube2, 
  Settings, 
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Code,
  Database,
  Calendar,
  FileText,
  History,
  RefreshCw,
  Search
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { formatTimestamp, formatCost, getStatusColor, cn } from "@/lib/utils";

type TabId = "overview" | "discovery" | "extraction" | "llm" | "save" | "schedule" | "logs" | "history";

export default function SourceDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const source = mockData.sources.find(s => s.id === params.id) || mockData.sources[0];
  const recentRuns = mockData.runs.filter(r => r.sourceId === source.id);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const runTest = (step: string) => {
    setTestResults({
      ...testResults,
      [step]: {
        status: "running",
        message: "Testing..."
      }
    });

    setTimeout(() => {
      setTestResults({
        ...testResults,
        [step]: {
          status: "success",
          message: "Test completed successfully",
          data: step === "discovery" ? {
            urlsFound: 145,
            sample: [
              "https://allakonsultuppdrag.se/job/123",
              "https://allakonsultuppdrag.se/job/124",
              "https://allakonsultuppdrag.se/job/125"
            ]
          } : {}
        }
      });
    }, 2000);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "discovery", label: "Discovery", icon: Search },
    { id: "extraction", label: "Extraction", icon: FileText },
    { id: "llm", label: "LLM Parsing", icon: Database },
    { id: "save", label: "Save", icon: Database },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "logs", label: "Logs", icon: FileText },
    { id: "history", label: "History", icon: History }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sources"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{source.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                  getStatusColor(source.status)
                )}>
                  {source.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Search className="h-3 w-3 text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      source.discoveryTechnique === "api" ? "bg-purple-100 text-purple-700" :
                      source.discoveryTechnique === "html" ? "bg-blue-100 text-blue-700" :
                      source.discoveryTechnique === "js" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {source.discoveryTechnique.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      source.extractionTechnique === "api" ? "bg-purple-100 text-purple-700" :
                      source.extractionTechnique === "html" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {source.extractionTechnique.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{source.siteUrl}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run Now
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <TestTube2 className="h-4 w-4" />
              Dry Run
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
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
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab source={source} recentRuns={recentRuns} />}
          {activeTab === "discovery" && <DiscoveryTab source={source} onTest={() => runTest("discovery")} testResult={testResults.discovery} />}
          {activeTab === "extraction" && <ExtractionTab source={source} onTest={() => runTest("extraction")} testResult={testResults.extraction} />}
          {activeTab === "llm" && <LLMParsingTab source={source} onTest={() => runTest("llm")} testResult={testResults.llm} />}
          {activeTab === "save" && <SaveTab source={source} />}
          {activeTab === "schedule" && <ScheduleTab source={source} />}
          {activeTab === "logs" && <LogsTab runs={recentRuns} />}
          {activeTab === "history" && <HistoryTab runs={recentRuns} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ source, recentRuns }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Gigs" value={source.activeGigs} />
        <StatCard label="Added (24h)" value={`+${source.added24h}`} color="green" />
        <StatCard label="Deleted (24h)" value={`-${source.deleted24h}`} color="red" />
        <StatCard label="Error Count" value={source.errorCount} color={source.errorCount > 0 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Site URL</dt>
              <dd className="mt-1 text-sm text-gray-900">{source.siteUrl}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Discovery</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  source.discoveryTechnique === "api" ? "bg-purple-100 text-purple-700" :
                  source.discoveryTechnique === "html" ? "bg-blue-100 text-blue-700" :
                  source.discoveryTechnique === "js" ? "bg-green-100 text-green-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {source.discoveryTechnique.toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Extraction</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  source.extractionTechnique === "api" ? "bg-purple-100 text-purple-700" :
                  source.extractionTechnique === "html" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {source.extractionTechnique.toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Run</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(source.lastRun)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Next Run</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {source.nextRun ? formatTimestamp(source.nextRun) : "Not scheduled"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Avg Run Time</dt>
              <dd className="mt-1 text-sm text-gray-900">{source.avgRunTime}s</dd>
            </div>
          </dl>
        </div>

        {/* Active Gig Rules */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Active Gig Detection</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Closed Indicators</h4>
              <ul className="space-y-1">
                {source.activeGigRules?.closedIndicators?.map((indicator: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{indicator}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detection Methods</h4>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={source.activeGigRules?.deletionDetection} readOnly className="rounded" />
                  <span className="text-sm text-gray-600">Deletion Detection</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!source.activeGigRules?.colorChange} readOnly className="rounded" />
                  <span className="text-sm text-gray-600">Color Change</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Runs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Runs</h3>
        <div className="space-y-3">
          {recentRuns.slice(0, 3).map((run: any) => (
            <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className={cn(
                  "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                  getStatusColor(run.status)
                )}>
                  {run.status}
                </span>
                <div>
                  <div className="text-sm font-medium">{formatTimestamp(run.startTime)}</div>
                  <div className="text-xs text-gray-500">Duration: {run.duration}s</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Found:</span> {run.itemsFound}
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span> {run.itemsUpdated}
                </div>
                <div>
                  <span className="text-gray-500">Cost:</span> {formatCost(run.llmCost)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscoveryTab({ source, onTest, testResult }: any) {
  const [showRawPayload, setShowRawPayload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Discovery Configuration</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              source.discoveryTechnique === "api" ? "bg-purple-100 text-purple-700" :
              source.discoveryTechnique === "html" ? "bg-blue-100 text-blue-700" :
              source.discoveryTechnique === "js" ? "bg-green-100 text-green-700" :
              "bg-orange-100 text-orange-700"
            }`}>
              {source.discoveryTechnique.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onTest}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TestTube2 className="h-4 w-4" />
            Test Discovery
          </button>
        </div>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <div className="flex gap-2">
              {["API", "HTML", "JS"].map(mode => (
                <button
                  key={mode}
                  className={cn(
                    "px-4 py-2 rounded-lg border transition-colors",
                    source.config?.discovery?.mode === mode
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {mode === "JS" ? "JS (Crawl4AI)" : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Pagination Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pagination/Scroll</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="numbered">Numbered Pages</option>
              <option value="next-link">Next Link</option>
              <option value="load-more">Load More Button</option>
              <option value="infinite">Infinite/Virtual Scroll</option>
            </select>
          </div>

          {/* Selectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selectors</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="List selector (CSS/XPath)"
                defaultValue={source.config?.discovery?.selectors?.list}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Title selector"
                defaultValue={source.config?.discovery?.selectors?.title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="URL selector"
                defaultValue={source.config?.discovery?.selectors?.url}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Include/Exclude Regions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Include Regions</label>
              <textarea
                rows={3}
                defaultValue={source.config?.discovery?.includeRegions?.join("\n")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="One selector per line"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Regions</label>
              <textarea
                rows={3}
                defaultValue={source.config?.discovery?.excludeRegions?.join("\n")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="One selector per line"
              />
            </div>
          </div>

          {/* Page Interaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Interaction</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Wait for selector"
                defaultValue={source.config?.discovery?.pageInteraction?.waitFor}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Cookie handler selector"
                defaultValue={source.config?.discovery?.pageInteraction?.cookieHandler}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {testResult.status === "running" && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              {testResult.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {testResult.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
              <span className="font-medium">{testResult.message}</span>
            </div>
            {testResult.data && (
              <div className="mt-2 text-sm">
                <div>Found {testResult.data.urlsFound} URLs</div>
                <div className="mt-2">
                  <button
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {showRawPayload ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    View sample URLs
                  </button>
                  {showRawPayload && (
                    <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                      {JSON.stringify(testResult.data.sample, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ExtractionTab({ source, onTest, testResult }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Extraction Configuration</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              source.extractionTechnique === "api" ? "bg-purple-100 text-purple-700" :
              source.extractionTechnique === "html" ? "bg-blue-100 text-blue-700" :
              "bg-green-100 text-green-700"
            }`}>
              {source.extractionTechnique.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onTest}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TestTube2 className="h-4 w-4" />
            Test Extraction
          </button>
        </div>

        <div className="space-y-6">
          {/* Navigation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Navigation</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="direct">Direct (use discovered URL)</option>
              <option value="transform">Transform URL</option>
            </select>
          </div>

          {/* Rendering Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rendering</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="headless">Headless Browser</option>
                <option value="api">API Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
              <input
                type="number"
                defaultValue={source.config?.details?.timeout}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Wait Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wait For Selector</label>
            <input
              type="text"
              placeholder="CSS selector to wait for"
              defaultValue={source.config?.details?.waitFor}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Content Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Elements</label>
            <textarea
              rows={3}
              defaultValue={source.config?.details?.contentSelection?.targetElements?.join("\n")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="One selector per line"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Elements</label>
              <textarea
                rows={3}
                defaultValue={source.config?.details?.contentSelection?.excludeElements?.join("\n")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="One selector per line"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Word Count Threshold</label>
              <input
                type="number"
                defaultValue={source.config?.details?.contentSelection?.wordCountThreshold}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LLMParsingTab({ source, onTest, testResult }: any) {
  const [showSchema, setShowSchema] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">LLM Parsing Configuration</h3>
          <button
            onClick={onTest}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TestTube2 className="h-4 w-4" />
            Test Parsing
          </button>
        </div>

        <div className="space-y-6">
          {/* Template & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="standard_job">Standard Job</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
          </div>

          {/* Model Parameters */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue={source.config?.llmParsing?.temperature}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
              <input
                type="number"
                defaultValue={source.config?.llmParsing?.maxTokens}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retries</label>
              <input
                type="number"
                defaultValue={source.config?.llmParsing?.retries}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Prompt Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Prompt Template</label>
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showPrompt ? "Hide" : "Edit"} Prompt
              </button>
            </div>
            {showPrompt && (
              <textarea
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                defaultValue={`Extract job information from the following content.
                
Focus on:
- Job title
- Company name
- Location
- Description
- Requirements
- Salary (if available)
- Application deadline

Return as structured JSON.`}
              />
            )}
          </div>

          {/* Schema */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Output Schema</label>
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showSchema ? "Hide" : "View"} Schema
              </button>
            </div>
            {showSchema && (
              <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-auto">
                {JSON.stringify(source.config?.llmParsing?.schema, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveTab({ source }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Database Configuration</h3>

        <div className="space-y-6">
          {/* Upsert Keys */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upsert Keys</label>
            <div className="space-y-2">
              {source.config?.save?.upsertKeys?.map((key: string, i: number) => (
                <input
                  key={i}
                  type="text"
                  defaultValue={key}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ))}
              <button className="text-sm text-blue-600 hover:underline">+ Add key</button>
            </div>
          </div>

          {/* Soft Delete Rules */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Soft Delete Rules</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Matches</label>
                <textarea
                  rows={2}
                  defaultValue={source.config?.save?.softDeleteRules?.textMatches?.join("\n")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="One pattern per line"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={source.config?.save?.softDeleteRules?.missing}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Mark as deleted if missing</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Color change to:</label>
                  <input
                    type="text"
                    defaultValue={source.config?.save?.softDeleteRules?.colorChange}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#999999"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ source }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Schedule Configuration</h3>

        <div className="space-y-6">
          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg">
                Cron
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Interval
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Manual
              </button>
            </div>
          </div>

          {/* Cron Expression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
            <input
              type="text"
              defaultValue={source.config?.schedule?.expression}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">Runs every 6 hours</p>
          </div>

          {/* Rate Limiting */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit</label>
              <input
                type="number"
                defaultValue={source.config?.schedule?.rateLimit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-500">Requests per minute</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concurrency</label>
              <input
                type="number"
                defaultValue={source.config?.schedule?.concurrency}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-500">Parallel requests</p>
            </div>
          </div>

          {/* Next Run Preview */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Next scheduled run:</div>
            <div className="text-lg font-semibold text-blue-900">
              {source.nextRun ? formatTimestamp(source.nextRun) : "Not scheduled"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTab({ runs }: any) {
  const [selectedRun, setSelectedRun] = useState(runs[0]?.id);
  const [logLevel, setLogLevel] = useState("all");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Run Logs</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedRun}
              onChange={(e) => setSelectedRun(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {runs.map((run: any) => (
                <option key={run.id} value={run.id}>
                  {formatTimestamp(run.startTime)} - {run.status}
                </option>
              ))}
            </select>
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors Only</option>
              <option value="warn">Warnings & Errors</option>
              <option value="info">Info & Above</option>
            </select>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <LogEntry
            level="info"
            timestamp="14:23:00"
            step="discovery"
            message="Starting discovery phase"
          />
          <LogEntry
            level="info"
            timestamp="14:23:02"
            step="discovery"
            message="Found 145 job listings"
          />
          <LogEntry
            level="info"
            timestamp="14:23:12"
            step="details"
            message="Processing detail pages"
          />
          <LogEntry
            level="warn"
            timestamp="14:23:25"
            step="details"
            message="Timeout on 2 pages, retrying..."
          />
          <LogEntry
            level="info"
            timestamp="14:23:30"
            step="llm"
            message="Starting LLM parsing"
          />
          <LogEntry
            level="info"
            timestamp="14:23:40"
            step="save"
            message="Saving to database"
          />
          <LogEntry
            level="success"
            timestamp="14:23:45"
            step="save"
            message="Run completed successfully"
          />
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ runs }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Duration
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Found
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Deleted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Errors
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Cost
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {runs.map((run: any) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatTimestamp(run.startTime)}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                    getStatusColor(run.status)
                  )}>
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {run.duration}s
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {run.itemsFound}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {run.itemsUpdated}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {run.itemsDeleted}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  {run.errors?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCost(run.llmCost)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-blue-600 hover:underline text-sm">
                    View Diff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "gray" }: any) {
  const colorClasses: Record<string, string> = {
    gray: "text-gray-900",
    green: "text-green-600",
    red: "text-red-600"
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", colorClasses[color])}>
        {value}
      </div>
    </div>
  );
}

function LogEntry({ level, timestamp, step, message }: any) {
  const levelColors: Record<string, string> = {
    info: "text-blue-600 bg-blue-50",
    warn: "text-yellow-600 bg-yellow-50",
    error: "text-red-600 bg-red-50",
    success: "text-green-600 bg-green-50"
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg font-mono text-sm">
      <span className="text-gray-500 text-xs">{timestamp}</span>
      <span className={cn(
        "px-2 py-0.5 rounded text-xs font-medium",
        levelColors[level]
      )}>
        {level.toUpperCase()}
      </span>
      <span className="text-gray-600">[{step}]</span>
      <span className="text-gray-900 flex-1">{message}</span>
    </div>
  );
}