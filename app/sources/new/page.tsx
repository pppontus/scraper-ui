"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Save, Search, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";

// Import constants and types
import { ALL_STEPS, STORAGE_KEY, StepId } from "@/components/sources/wizard/constants";

// Import step components
import { BasicsStep } from "@/components/sources/wizard/steps/BasicsStep";
import { DiscoverySetupStep } from "@/components/sources/wizard/steps/DiscoverySetupStep";
import { ExtractionSetupStep } from "@/components/sources/wizard/steps/ExtractionSetupStep";
import { LLMStep, ScheduleStep, ReviewStep } from "@/components/sources/wizard/steps/PlaceholderSteps";

export default function NewSourcePage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [sourceConfig, setSourceConfig] = useState<SourceConfig>({
    name: "",
    siteUrl: "",
    discovery: {
      enabled: true,
      technique: "html",
      config: {
        scraping: {
          // Modern Crawl4AI-based rendering
          rendering: {
            technique: "html",
            timeout: 30000,
            waitFor: "",
            interactions: [],
            customJS: ""
          },
          
          // Content-aware area detection
          contentArea: {
            strategy: "auto",
            selectors: ["main", "#content", ".listings", ".jobs"],
            excludeRegions: ["header", "footer", "nav", ".ads", ".sidebar"]
          },
          
          // Pattern-based link filtering
          linkFiltering: {
            includePatterns: ["/jobs/", "/uppdrag/", "/karriar/", "\\?id=\\d+"],
            excludePatterns: ["/login", "/register", "#", "javascript:", "/filter"],
            requireText: true,
            minTextLength: 3,
            contextKeywords: ["apply", "view", "details", "ansök", "visa"]
          },
          
          // Pagination handling
          pagination: {
            type: "numbered",
            maxPages: 10
          },
          
          // Deduplication
          deduplication: {
            by: "url_normalized",
            keepFirst: true
          }
        }
      }
    },
    extraction: {
      enabled: true,
      technique: "html",
      config: {
        navigation: {
          type: "direct"
        },
        rendering: {
          technique: "html",
          timeout: 30000
        },
        // Crawl4AI Configuration (default enabled)
        crawl4ai: {
          enabled: true,
          contentSelection: {
            targetElements: ["main", ".job-content", ".content"],
            excludedTags: ["header", "footer", "nav", ".ads"],
            excludeExternalLinks: true,
            excludeExternalImages: true,
            wordCountThreshold: 20
          },
          markdownStrategy: {
            type: "fit",
            contentFilter: {
              type: "pruning",
              threshold: 0.1,
              minWordCount: 15
            }
          }
        },
        // LLM Configuration (per-source)
        llm: {
          enabled: true,
          model: "gpt-4o-mini",
          temperature: 0.1,
          maxTokens: 2000,
          retries: 3,
          systemPrompt: "Extract structured job information from the provided markdown content. Focus on accuracy and consistency.",
          extractionSchema: {
            title: "string (required)",
            company: "string (required)", 
            location: "string",
            salary: "string",
            startDate: "ISO date string",
            requirements: "array of strings",
            description: "string"
          },
          outputFormat: "json",
          requireAllFields: false,
          confidenceThreshold: 0.7
        },
        // Legacy selectors (for backwards compatibility)
        selectors: {
          title: "",
          description: ""
        },
        parallelism: {
          maxConcurrent: 5,
          delayBetween: 1000,
          retryCount: 3
        }
      }
    },
    save: {
      upsertKeys: ["siteUrl", "jobUrl"],
      softDeleteRules: {
        missing: true
      },
      validation: {
        requireTitle: true,
        requireUrl: true,
        skipEmptyDescription: false
      }
    },
    schedule: {
      discovery: {
        enabled: true,
        type: "cron",
        expression: "0 */2 * * *" // Every 2 hours
      },
      extraction: {
        enabled: true,
        trigger: "on_discovery"
      },
      rateLimit: {
        maxRequestsPerMinute: 30,
        concurrency: 5
      }
    }
  });

  // Helper functions for URL and localStorage management
  const getStepIndexFromUrl = (): number => {
    // Use window.location directly for immediate access (especially for popstate)
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam) {
      const stepIndex = ALL_STEPS.findIndex(step => step.id === stepParam);
      return stepIndex >= 0 ? stepIndex : 0;
    }
    return 0;
  };

  const updateUrl = (stepIndex: number, replace: boolean = false) => {
    const step = ALL_STEPS[stepIndex];
    if (step) {
      const url = new URL(window.location.href);
      url.searchParams.set('step', step.id);
      
      if (replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    }
  };

  const saveToLocalStorage = (config: SourceConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromLocalStorage = (): SourceConfig | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  };

  // Initialize from URL and localStorage on mount
  useEffect(() => {
    if (!isInitialized) {
      // Load saved config from localStorage
      const savedConfig = loadFromLocalStorage();
      if (savedConfig) {
        setSourceConfig(savedConfig);
      }

      // Set step from URL
      const urlStepIndex = getStepIndexFromUrl();
      setCurrentStepIndex(urlStepIndex);
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage(sourceConfig);
    }
  }, [sourceConfig, isInitialized]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlStepIndex = getStepIndexFromUrl();
      setCurrentStepIndex(urlStepIndex);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // All steps are always available
  const steps = ALL_STEPS;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStep) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep.id);
      setCompletedSteps(newCompleted);
    }

    if (currentStepIndex < steps.length - 1) {
      const newStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(newStepIndex);
      updateUrl(newStepIndex);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const newStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(newStepIndex);
      updateUrl(newStepIndex);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStepIndex || (stepIndex > 0 && completedSteps.has(steps[stepIndex - 1].id))) {
      setCurrentStepIndex(stepIndex);
      updateUrl(stepIndex);
    }
  };

  const handleFinish = () => {
    console.log("Creating source:", sourceConfig);
    router.push("/sources");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link
            href="/sources"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">New Source</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Discovery:</span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                sourceConfig.discovery.technique === "api" && "bg-purple-100 text-purple-700",
                sourceConfig.discovery.technique === "html" && "bg-blue-100 text-blue-700",
                sourceConfig.discovery.technique === "js" && "bg-green-100 text-green-700",
                (sourceConfig.discovery.technique === "rss" || sourceConfig.discovery.technique === "sitemap") && "bg-orange-100 text-orange-700"
              )}>
                {sourceConfig.discovery.technique === "js" ? "JS" : sourceConfig.discovery.technique.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Extraction:</span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                sourceConfig.extraction.technique === "api" && "bg-purple-100 text-purple-700",
                sourceConfig.extraction.technique === "html" && "bg-blue-100 text-blue-700",
                sourceConfig.extraction.technique === "js" && "bg-green-100 text-green-700"
              )}>
                {sourceConfig.extraction.technique === "js" ? "JS" : sourceConfig.extraction.technique.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Step Progress Indicator */}
      <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2",
              (currentStep?.id.includes("discovery") || currentStep?.id === "basics") 
                ? "text-blue-700 font-medium" 
                : "text-blue-600"
            )}>
              <Search className="h-4 w-4" />
              <span>Step 1: Find Jobs</span>
              {sourceConfig.testResults?.discovery && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-blue-400" />
            <div className={cn(
              "flex items-center gap-2",
              currentStep?.id.includes("extraction") 
                ? "text-blue-700 font-medium" 
                : "text-blue-600"
            )}>
              <FileText className="h-4 w-4" />
              <span>Step 2: Extract Details</span>
              {sourceConfig.testResults?.extraction && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
          <span className="text-blue-600">{currentStep?.description}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = completedSteps.has(step.id);
            const isClickable = index <= currentStepIndex || (index > 0 && completedSteps.has(steps[index - 1].id));

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap",
                    isActive && "bg-blue-50 text-blue-600",
                    isCompleted && !isActive && "text-green-600",
                    !isActive && !isCompleted && isClickable && "text-gray-700 hover:bg-gray-50",
                    !isClickable && "text-gray-400 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive && "bg-blue-600 text-white",
                    isCompleted && !isActive && "bg-green-100",
                    !isActive && !isCompleted && "bg-gray-100"
                  )}>
                    {isCompleted && !isActive ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 min-w-[2rem]",
                    completedSteps.has(step.id) ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6 max-w-5xl mx-auto">
          {currentStep?.id === "basics" && (
            <BasicsStep 
              config={sourceConfig} 
              setConfig={setSourceConfig}
            />
          )}
          {currentStep?.id === "discovery_setup" && (
            <DiscoverySetupStep config={sourceConfig} setConfig={setSourceConfig} />
          )}
          {currentStep?.id === "extraction_setup" && (
            <ExtractionSetupStep config={sourceConfig} setConfig={setSourceConfig} />
          )}
          
          {currentStep?.id === "llm" && (
            <LLMStep config={sourceConfig} setConfig={setSourceConfig} />
          )}
          {currentStep?.id === "schedule" && (
            <ScheduleStep config={sourceConfig} setConfig={setSourceConfig} />
          )}
          {currentStep?.id === "review" && (
            <ReviewStep config={sourceConfig} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={cn(
              "px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-colors",
              currentStepIndex === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep?.id === "review" ? (
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Create Source
              </button>
            ) : (
              <button
                onClick={handleNext}
                
                className={cn(
                  "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2",
                  
                )}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
