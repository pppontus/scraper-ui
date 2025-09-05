import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DryRunResults as DryRunResultsType, 
  LogEntry, 
  RunStep,
  ProgressSteps,
  DiscoveryResults,
  ExtractionSamples,
  ExecutionLogs,
  StatsSummary
} from "./DryRunSharedComponents";

interface DryRunResultsProps {
  currentStep: RunStep;
  results: DryRunResultsType | null;
  logs: LogEntry[];
  variant: "modal" | "inline";
  onRestart?: () => void;
  onEditConfig?: () => void;
  className?: string;
}

export function DryRunResultsDisplay({ 
  currentStep, 
  results, 
  logs, 
  variant,
  onRestart,
  onEditConfig,
  className 
}: DryRunResultsProps) {
  // Always declare hooks at the top level - before any early returns
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(variant === "inline" ? ["discovery", "extraction", "stats"] : [])
  );
  const [activeTab, setActiveTab] = useState<"discovery" | "extraction" | "logs" | "stats">("discovery");

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Show progress for running states
  if (currentStep !== "complete" && currentStep !== "error") {
    return (
      <div className={cn("space-y-6", className)}>
        <ProgressSteps currentStep={currentStep} variant={variant} />
        {variant === "inline" && (
          <div className="text-center text-gray-600">
            <p className="text-sm">This may take a few moments...</p>
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (currentStep === "error") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dry Run Failed</h3>
          <p className="text-gray-600 mb-4">There was an error running the dry run. Check the logs for more details.</p>
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
        </div>
        
        {/* Always show logs on error */}
        <ExecutionLogs logs={logs} variant={variant} />
      </div>
    );
  }

  // Show results for completed state
  if (!results) return null;

  if (variant === "modal") {
    // Modal variant - keep existing tabbed interface
    
    return (
      <div className={cn("flex h-full", className)}>
        {/* Tabs */}
        <div className="w-48 border-r border-gray-200 bg-gray-50">
          <div className="p-4 space-y-1">
            {[
              { key: "discovery", label: "Discovery", component: DiscoveryResults },
              { key: "extraction", label: "Extraction", component: ExtractionSamples },
              { key: "logs", label: "Logs", component: ExecutionLogs },
              { key: "stats", label: "Stats", component: StatsSummary },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-white/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === "discovery" && <DiscoveryResults results={results} variant="modal" />}
            {activeTab === "extraction" && <ExtractionSamples results={results} variant="modal" />}
            {activeTab === "logs" && <ExecutionLogs logs={logs} variant="modal" />}
            {activeTab === "stats" && <StatsSummary results={results} variant="modal" />}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant - collapsible sections
  return (
    <div className={cn("space-y-6", className)}>
      {/* Success message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-green-900">Dry Run Completed Successfully!</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your scraper configuration has been tested and is working correctly.
        </p>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-900">{results.stats.totalUrls}</div>
          <div className="text-xs text-blue-700">URLs Found</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-900">{results.stats.successfulExtractions}</div>
          <div className="text-xs text-green-700">Extracted</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-900">{Math.round((results.stats.successfulExtractions / results.stats.totalUrls) * 100)}%</div>
          <div className="text-xs text-purple-700">Success</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-900">{(results.stats.totalDuration / 1000).toFixed(1)}s</div>
          <div className="text-xs text-orange-700">Duration</div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Discovery Results */}
        <CollapsibleSection
          title="Discovery Results"
          isExpanded={expandedSections.has("discovery")}
          onToggle={() => toggleSection("discovery")}
          badge={`${results.discovery.urls.length} URLs`}
        >
          <DiscoveryResults results={results} variant="inline" />
        </CollapsibleSection>

        {/* Extraction Samples */}
        <CollapsibleSection
          title="Sample Extractions"
          isExpanded={expandedSections.has("extraction")}
          onToggle={() => toggleSection("extraction")}
          badge={`${results.extraction.samples.length} samples`}
        >
          <ExtractionSamples results={results} variant="inline" />
        </CollapsibleSection>

        {/* Execution Logs */}
        <CollapsibleSection
          title="Execution Logs"
          isExpanded={expandedSections.has("logs")}
          onToggle={() => toggleSection("logs")}
          badge={`${logs.length} entries`}
        >
          <ExecutionLogs logs={logs} variant="inline" />
        </CollapsibleSection>

        {/* Full Statistics */}
        <CollapsibleSection
          title="Detailed Statistics"
          isExpanded={expandedSections.has("stats")}
          onToggle={() => toggleSection("stats")}
        >
          <StatsSummary results={results} variant="inline" />
        </CollapsibleSection>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Run Again
          </button>
        )}
        {onEditConfig && (
          <button
            onClick={onEditConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Configuration
          </button>
        )}
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isExpanded, onToggle, badge, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {badge && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}