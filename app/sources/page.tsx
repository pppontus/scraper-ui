"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Play,
  Pause,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  Copy,
  TestTube2,
  AlertTriangle,
  ChevronDown,
  FileText
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { formatTimestamp, formatCost, getStatusColor, cn } from "@/lib/utils";

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredSources = mockData.sources.filter((source) => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || source.status === statusFilter;
    const matchesType = typeFilter === "all" || 
      source.discoveryTechnique === typeFilter || 
      source.extractionTechnique === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
        <Link
          href="/sources/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Source
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors",
              showFilters 
                ? "bg-blue-50 border-blue-300 text-blue-700" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              showFilters && "rotate-180"
            )} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="API">API</option>
                <option value="HTML">HTML</option>
                <option value="JS">JS (Crawl4AI)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Has Errors
              </label>
              <input
                type="checkbox"
                className="mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Techniques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h +/-
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost 24h
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSources.map((source) => (
                <tr
                  key={source.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/sources/${source.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {source.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                      getStatusColor(source.status)
                    )}>
                      {source.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatTimestamp(source.lastRun)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {source.nextRun ? formatTimestamp(source.nextRun) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {source.activeGigs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <span className="text-green-600">+{source.added24h}</span>
                    {" / "}
                    <span className="text-red-600">-{source.deleted24h}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {source.errorCount > 0 ? (
                      <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {source.errorCount}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCost(source.llmCost24h)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Run now:", source.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Run now"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Dry run:", source.id);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Dry run"
                      >
                        <TestTube2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Clone:", source.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Clone"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Validate selectors
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Test prompt
                          </button>
                          <hr className="my-1" />
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {source.status === "paused" ? "Resume" : "Pause"}
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Disable
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredSources.length} of {mockData.sources.length} sources
        </div>
        <div className="flex gap-4">
          <span>Total active gigs: <strong>{mockData.statistics.dashboard.activeGigs}</strong></span>
          <span>Total cost (24h): <strong>{formatCost(mockData.statistics.dashboard.llmCost24h)}</strong></span>
        </div>
      </div>
    </div>
  );
}