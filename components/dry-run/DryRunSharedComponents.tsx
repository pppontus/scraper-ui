import React from "react";
import { CheckCircle, AlertCircle, Loader2, Eye, FileText, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type RunStep = "discovering" | "extracting" | "analyzing" | "complete" | "error";

export interface DryRunResults {
  discovery: {
    success: boolean;
    urls: string[];
    duration: number;
    errors?: string[];
  };
  extraction: {
    success: boolean;
    samples: Array<{
      url: string;
      data: Record<string, any>;
      error?: string;
    }>;
    duration: number;
  };
  stats: {
    totalUrls: number;
    successfulExtractions: number;
    totalDuration: number;
  };
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "success";
  message: string;
}

interface ProgressStepsProps {
  currentStep: RunStep;
  variant?: "modal" | "inline";
}

export function ProgressSteps({ currentStep, variant = "modal" }: ProgressStepsProps) {
  const steps = [
    { key: "discovering", label: "Discovering URLs", icon: Eye },
    { key: "extracting", label: "Extracting Data", icon: FileText },
    { key: "analyzing", label: "Analyzing Results", icon: Activity },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  const isStepComplete = (stepKey: string) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = getCurrentStepIndex();
    return currentStep === "complete" || currentIndex > stepIndex;
  };

  if (variant === "inline") {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Running Dry Run...</h3>
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isComplete = isStepComplete(step.key);
            
            return (
              <div key={step.key} className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                isActive && "bg-blue-50 border-blue-200",
                isComplete && "bg-green-50 border-green-200",
                !isActive && !isComplete && "bg-gray-50 border-gray-200"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive && "bg-blue-100",
                  isComplete && "bg-green-100"
                )}>
                  {isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <span className={cn(
                  "font-medium",
                  isActive && "text-blue-900",
                  isComplete && "text-green-900",
                  !isActive && !isComplete && "text-gray-500"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Modal variant (horizontal)
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.key;
        const isComplete = isStepComplete(step.key);
        
        return (
          <div key={step.key} className="flex items-center">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg",
              isActive && "bg-blue-50",
              isComplete && "bg-green-50"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isActive && "bg-blue-100",
                isComplete && "bg-green-100"
              )}>
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Icon className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isActive && "text-blue-900",
                isComplete && "text-green-900",
                !isActive && !isComplete && "text-gray-500"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-200 mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface DiscoveryResultsProps {
  results: DryRunResults;
  variant?: "modal" | "inline";
}

export function DiscoveryResults({ results, variant = "modal" }: DiscoveryResultsProps) {
  return (
    <div className={variant === "inline" ? "mb-6" : ""}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className={variant === "inline" ? "text-lg font-semibold" : "text-lg font-semibold"}>
          Discovered URLs
        </h3>
        <span className="text-sm text-gray-500">({results.discovery.urls.length} found)</span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {results.discovery.urls.map((url, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm font-mono text-gray-700 truncate">{url}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExtractionSamplesProps {
  results: DryRunResults;
  variant?: "modal" | "inline";
}

export function ExtractionSamples({ results, variant = "modal" }: ExtractionSamplesProps) {
  return (
    <div className={variant === "inline" ? "mb-6" : ""}>
      <h3 className={variant === "inline" ? "text-lg font-semibold mb-4" : "text-lg font-semibold mb-4"}>
        Sample Extractions
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {results.extraction.samples.map((sample, index) => (
          <div key={index} className={cn(
            "p-4 rounded-lg border",
            sample.error ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {sample.error ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm font-mono text-gray-600 truncate">{sample.url}</span>
            </div>
            {sample.error ? (
              <p className="text-sm text-red-700">{sample.error}</p>
            ) : (
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify(sample.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExecutionLogsProps {
  logs: LogEntry[];
  variant?: "modal" | "inline";
}

export function ExecutionLogs({ logs, variant = "modal" }: ExecutionLogsProps) {
  return (
    <div className={variant === "inline" ? "mb-6" : ""}>
      <h3 className={variant === "inline" ? "text-lg font-semibold mb-4" : "text-lg font-semibold mb-4"}>
        Execution Logs
      </h3>
      <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
        {logs.map((log, index) => (
          <div key={index} className={cn(
            "flex gap-3 p-2 rounded",
            log.level === "error" && "bg-red-50 text-red-900",
            log.level === "success" && "bg-green-50 text-green-900", 
            log.level === "info" && "bg-blue-50 text-blue-900"
          )}>
            <span className="text-gray-500">{log.timestamp}</span>
            <span className="font-medium">[{log.level.toUpperCase()}]</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatsSummaryProps {
  results: DryRunResults;
  variant?: "modal" | "inline";
}

export function StatsSummary({ results, variant = "modal" }: StatsSummaryProps) {
  return (
    <div className={variant === "inline" ? "mb-6" : ""}>
      <h3 className={variant === "inline" ? "text-lg font-semibold mb-4" : "text-lg font-semibold mb-4"}>
        Run Statistics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{results.stats.totalUrls}</div>
          <div className="text-sm text-blue-700">URLs Discovered</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">{results.stats.successfulExtractions}</div>
          <div className="text-sm text-green-700">Successful Extractions</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">{(results.stats.totalDuration / 1000).toFixed(1)}s</div>
          <div className="text-sm text-purple-700">Total Duration</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-900">{Math.round((results.stats.successfulExtractions / results.stats.totalUrls) * 100)}%</div>
          <div className="text-sm text-orange-700">Success Rate</div>
        </div>
      </div>
    </div>
  );
}