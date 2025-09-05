import React, { useState } from "react";
import { X, Download, Search, Filter, AlertCircle, CheckCircle, Clock, Info } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "success" | "debug";
  step: "discovery" | "details" | "llmParsing" | "save" | "system";
  message: string;
  details?: string;
  url?: string;
  duration?: number;
}

interface FullLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: {
    id: string;
    sourceName: string;
    startTime: string;
    duration: number;
    status: string;
  };
}

export function FullLogsModal({ isOpen, onClose, run }: FullLogsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  if (!isOpen) return null;

  // Mock detailed logs for the run
  const mockLogs: LogEntry[] = [
    {
      timestamp: run.startTime,
      level: "info",
      step: "system",
      message: "Starting scraper run for " + run.sourceName,
      details: "Run ID: " + run.id + "\nScheduled execution started"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 1000).toISOString(),
      level: "info", 
      step: "discovery",
      message: "Initiating URL discovery phase",
      details: "Using API endpoint to fetch job listings"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 2500).toISOString(),
      level: "success",
      step: "discovery",
      message: "API request completed successfully",
      details: "Retrieved 127 job URLs from API endpoint\nResponse time: 1.2s",
      duration: 1200
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 3000).toISOString(),
      level: "info",
      step: "discovery", 
      message: "Filtering duplicate and invalid URLs",
      details: "127 URLs found, 89 unique URLs after deduplication"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 5000).toISOString(),
      level: "info",
      step: "details",
      message: "Starting content extraction phase",
      details: "Processing 89 URLs with Crawl4AI"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 8000).toISOString(),
      level: "success",
      step: "details",
      message: "Extracted content from job page",
      url: "https://example.com/jobs/senior-developer-123",
      details: "Successfully extracted 2.3KB of content\nProcessing time: 0.8s",
      duration: 800
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 12000).toISOString(),
      level: "warning",
      step: "details", 
      message: "Content extraction partially failed",
      url: "https://example.com/jobs/frontend-engineer-456",
      details: "Page loaded but target selectors not found\nFalling back to full page content"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 15000).toISOString(),
      level: "error",
      step: "details",
      message: "Failed to load page after 3 retries", 
      url: "https://example.com/jobs/data-scientist-789",
      details: "HTTP 404: Page not found\nURL may have been removed or changed"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 35000).toISOString(),
      level: "info",
      step: "llmParsing",
      message: "Starting LLM parsing phase",
      details: "Processing 78 successfully extracted pages with GPT-4"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 38000).toISOString(),
      level: "success",
      step: "llmParsing", 
      message: "Parsed job details successfully",
      details: "Title: Senior Developer\nCompany: TechCorp AB\nLocation: Stockholm\nSalary: 45000-55000 SEK\nTokens used: 1,234",
      duration: 2100
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 42000).toISOString(),
      level: "warning",
      step: "llmParsing",
      message: "LLM extraction incomplete",
      details: "Could not extract salary information\nJob description too brief for reliable parsing\nTokens used: 892"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 65000).toISOString(),
      level: "info",
      step: "save",
      message: "Saving extracted data to database",
      details: "Processed 78 jobs, 72 successfully parsed"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 67000).toISOString(),
      level: "success",
      step: "save",
      message: "Database save completed", 
      details: "Saved 72 new jobs\nUpdated 5 existing jobs\nMarked 3 as deleted\nTotal processing time: " + run.duration + "s"
    },
    {
      timestamp: new Date(new Date(run.startTime).getTime() + 67500).toISOString(),
      level: "success",
      step: "system",
      message: "Scraper run completed successfully",
      details: "Run ID: " + run.id + "\nTotal duration: " + run.duration + "s\nStatus: " + run.status
    }
  ];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesStep = stepFilter === "all" || log.step === stepFilter;
    return matchesSearch && matchesLevel && matchesStep;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "debug": return <Info className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-600 bg-red-50 border-red-200";
      case "warning": return "text-amber-600 bg-amber-50 border-amber-200"; 
      case "success": return "text-green-600 bg-green-50 border-green-200";
      case "debug": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const downloadLogs = () => {
    const logsText = filteredLogs.map(log => 
      `${log.timestamp} [${log.level.toUpperCase()}] [${log.step}] ${log.message}${log.details ? '\n  ' + log.details.replace(/\n/g, '\n  ') : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${run.sourceName}-${run.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Full Execution Logs</h2>
            <p className="text-sm text-gray-500">
              {run.sourceName} • {formatTimestamp(run.startTime)} • {run.duration}s duration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadLogs}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Logs
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
            <select
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Steps</option>
              <option value="discovery">Discovery</option>
              <option value="details">Extraction</option>
              <option value="llmParsing">LLM Parsing</option>
              <option value="save">Save</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Logs List */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedLog(log)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50",
                    selectedLog === log ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide",
                          getLevelColor(log.level)
                        )}>
                          {log.level}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {log.step}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 mb-1">
                        {log.message}
                      </div>
                      {log.url && (
                        <div className="text-xs text-blue-600 truncate">
                          {log.url}
                        </div>
                      )}
                      {log.duration && (
                        <div className="text-xs text-gray-500">
                          Duration: {log.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Details Panel */}
          {selectedLog && (
            <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  {getLevelIcon(selectedLog.level)}
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
                    getLevelColor(selectedLog.level)
                  )}>
                    {selectedLog.level}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Timestamp
                    </label>
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTimestamp(selectedLog.timestamp)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Step
                    </label>
                    <div className="text-sm text-gray-900 capitalize">
                      {selectedLog.step}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Message
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedLog.message}
                    </div>
                  </div>

                  {selectedLog.url && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        URL
                      </label>
                      <div className="text-sm text-blue-600 break-all">
                        {selectedLog.url}
                      </div>
                    </div>
                  )}

                  {selectedLog.duration && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Duration
                      </label>
                      <div className="text-sm text-gray-900">
                        {selectedLog.duration}ms
                      </div>
                    </div>
                  )}

                  {selectedLog.details && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Details
                      </label>
                      <div className="text-sm text-gray-900 bg-white p-3 rounded border whitespace-pre-wrap font-mono">
                        {selectedLog.details}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredLogs.length} of {mockLogs.length} log entries
            </div>
            <div className="flex gap-4">
              <span>Errors: <strong className="text-red-600">{mockLogs.filter(l => l.level === 'error').length}</strong></span>
              <span>Warnings: <strong className="text-amber-600">{mockLogs.filter(l => l.level === 'warning').length}</strong></span>
              <span>Success: <strong className="text-green-600">{mockLogs.filter(l => l.level === 'success').length}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}