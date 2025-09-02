"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ChevronRight
} from "lucide-react";
import mockData from "@/lib/mock-data.json";
import { formatTimestamp, formatCost, getStatusColor, cn } from "@/lib/utils";

export default function RunsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allRuns = [...mockData.runs].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const filteredRuns = allRuns.filter((run) => {
    const matchesSearch = run.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || run.status === statusFilter;
    const matchesSource = sourceFilter === "all" || run.sourceId === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Runs & Logs</h1>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search runs..."
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
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                {mockData.sources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Runs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Found
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deleted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRuns.map((run) => (
                <React.Fragment key={run.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/sources/${run.sourceId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {run.sourceName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTimestamp(run.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(run.status)
                      )}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {run.duration}s
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {run.itemsFound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {run.itemsUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {run.itemsDeleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {run.errors && run.errors.length > 0 ? (
                        <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {run.errors.length}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          <CheckCircle className="h-4 w-4 inline" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCost(run.llmCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        {expandedRun === run.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedRun === run.id && (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 bg-gray-50">
                        <RunDetails run={run} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {filteredRuns.length} of {allRuns.length} runs
        </div>
        <div className="flex gap-4">
          <span>Total cost: <strong>{formatCost(
            filteredRuns.reduce((sum, run) => sum + run.llmCost, 0)
          )}</strong></span>
          <span>Avg duration: <strong>{
            Math.round(filteredRuns.reduce((sum, run) => sum + run.duration, 0) / filteredRuns.length)
          }s</strong></span>
        </div>
      </div>
    </div>
  );
}

function RunDetails({ run }: { run: any }) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const steps = run.steps ? Object.entries(run.steps) : [];

  return (
    <div className="space-y-4">
      {/* Step Timeline */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Execution Steps</h4>
        <div className="flex items-center gap-2">
          {steps.map(([stepName, stepData]: [string, any], index) => (
            <React.Fragment key={stepName}>
              <button
                onClick={() => setSelectedStep(stepName)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  selectedStep === stepName
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2">
                  {stepData.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {stepData.status === "failed" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {stepData.status === "running" && (
                    <Clock className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium capitalize">{stepName}</span>
                </div>
                <span className="text-xs text-gray-500">{stepData.duration}s</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Details */}
      {selectedStep && run.steps[selectedStep] && (
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            {selectedStep.charAt(0).toUpperCase() + selectedStep.slice(1)} Details
          </h4>
          <div className="space-y-2">
            {selectedStep === "discovery" && (
              <>
                <div className="text-sm">
                  <span className="text-gray-500">URLs Found:</span>{" "}
                  <span className="font-medium">{run.steps[selectedStep].urlsFound}</span>
                </div>
              </>
            )}
            {selectedStep === "details" && (
              <>
                <div className="text-sm">
                  <span className="text-gray-500">Pages Processed:</span>{" "}
                  <span className="font-medium">{run.steps[selectedStep].pagesProcessed}</span>
                </div>
              </>
            )}
            {selectedStep === "llmParsing" && (
              <>
                <div className="text-sm">
                  <span className="text-gray-500">Items Parsed:</span>{" "}
                  <span className="font-medium">{run.steps[selectedStep].itemsParsed}</span>
                </div>
              </>
            )}
            {selectedStep === "save" && (
              <>
                <div className="text-sm">
                  <span className="text-gray-500">Items Saved:</span>{" "}
                  <span className="font-medium">{run.steps[selectedStep].itemsSaved}</span>
                </div>
              </>
            )}
            {run.steps[selectedStep].errors && run.steps[selectedStep].errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                <div className="font-medium mb-1">Errors:</div>
                {run.steps[selectedStep].errors.map((error: string, i: number) => (
                  <div key={i}>{error}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {run.errors && run.errors.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Errors</h4>
          <div className="space-y-2">
            {run.errors.map((error: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-red-900">[{error.step}]</div>
                    <div className="text-red-700">{error.message}</div>
                    <div className="text-xs text-red-600 mt-1">
                      {formatTimestamp(error.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Eye className="h-3 w-3" />
          View Full Logs
        </button>
        <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Download className="h-3 w-3" />
          Download Payloads
        </button>
      </div>
    </div>
  );
}