"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  TestTube2, 
  Settings, 
  Eye,
  Download,
  Globe,
  FileText,
  History
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { formatTimestamp, formatCost, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TabId = "overview" | "logs" | "history";

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
                <StatusBadge status={source.status} className="py-0.5" />
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
                <StatusBadge status={run.status} />
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
                  <StatusBadge status={run.status} />
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
