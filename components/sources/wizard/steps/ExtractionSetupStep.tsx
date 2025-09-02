import React, { useState } from "react";
import { FileText, Network, Globe, Code, Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig, ExtractionTechnique, ExtractionConfig } from "@/lib/types";

interface ExtractionSetupStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function ExtractionSetupStep({ config, setConfig }: ExtractionSetupStepProps) {
  const [activeSection, setActiveSection] = useState<string>("content-selection");
  const technique = config.extraction.technique;
  const crawl4aiConfig = config.extraction.config.crawl4ai;
  const llmConfig = config.extraction.config.llm;
  
  const updateExtractionConfig = (updates: Partial<ExtractionConfig>) => {
    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          ...updates
        }
      }
    });
  };
  
  const updateCrawl4AIConfig = (updates: any) => {
    updateExtractionConfig({
      crawl4ai: {
        ...crawl4aiConfig,
        ...updates
      }
    });
  };
  
  const updateLLMConfig = (updates: any) => {
    updateExtractionConfig({
      llm: {
        ...llmConfig,
        ...updates
      }
    });
  };
  
  const addTargetElement = (element: string) => {
    if (!element.trim()) return;
    const current = crawl4aiConfig.contentSelection.targetElements || [];
    if (!current.includes(element)) {
      updateCrawl4AIConfig({
        contentSelection: {
          ...crawl4aiConfig.contentSelection,
          targetElements: [...current, element]
        }
      });
    }
  };
  
  const addExcludedElement = (element: string) => {
    if (!element.trim()) return;
    const current = crawl4aiConfig.contentSelection.excludedTags || [];
    if (!current.includes(element)) {
      updateCrawl4AIConfig({
        contentSelection: {
          ...crawl4aiConfig.contentSelection,
          excludedTags: [...current, element]
        }
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Extract Details</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[600px]">
          {/* Configuration Panel */}
          <div className="p-6 border-r">
            <p className="text-gray-600 mb-6">
              Configure how to extract job details and generate markdown for LLM processing.
            </p>
            
            {/* Technique Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Extraction Technique
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(["api", "html", "js"] as ExtractionTechnique[]).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setConfig({
                      ...config,
                      extraction: { ...config.extraction, technique: tech }
                    })}
                    className={cn(
                      "p-4 border-2 rounded-lg text-left transition-colors",
                      technique === tech
                        ? tech === "api" ? "border-purple-500 bg-purple-50 text-purple-700" :
                          tech === "html" ? "border-blue-500 bg-blue-50 text-blue-700" :
                          "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {tech === "api" ? <Network className="h-5 w-5" /> :
                       tech === "html" ? <Globe className="h-5 w-5" /> :
                       <Code className="h-5 w-5" />}
                      <span className="font-medium">{tech.toUpperCase()}</span>
                    </div>
                    <p className="text-sm">
                      {tech === "api" ? "Direct API calls for job data" :
                       tech === "html" ? "Content-aware HTML extraction with Crawl4AI" :
                       "JavaScript rendering with Crawl4AI (for dynamic sites)"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          
          {/* Preview Panel */}
          <div className="p-6 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
            
            {/* Simple markdown preview */}
            <div className="bg-white rounded-lg border h-96 overflow-auto">
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Generated Markdown</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap">
# Sample Job Details

**Title:** Senior Software Engineer
**Company:** Tech Corp
**Location:** San Francisco, CA
**Salary:** $120k-$150k

## Requirements
- React experience
- Node.js background
- TypeScript knowledge
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for better organization  
function ContentSelectionSection({ crawl4aiConfig, updateCrawl4AIConfig, addTargetElement, addExcludedElement }: any) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Content Selection Strategy</h3>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navigation Type
                </label>
                <select
                  value={config.extraction.config.navigation.type}
                  onChange={(e) => updateExtractionConfig({
                    navigation: {
                      ...config.extraction.config.navigation,
                      type: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="direct">Direct (use discovered URLs)</option>
                  <option value="transform">Transform URLs</option>
                  <option value="api">API Lookup</option>
                </select>
              </div>
              
              {config.extraction.config.navigation.type === "transform" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Transform Pattern
                  </label>
                  <input
                    type="text"
                    value={config.extraction.config.navigation.urlTransform || ""}
                    onChange={(e) => updateExtractionConfig({
                      navigation: {
                        ...config.extraction.config.navigation,
                        urlTransform: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/job/{id} -> /api/job/{id}"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Rendering Settings */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Rendering</h3>
            <div className={cn(
              "border rounded-lg p-4 mb-4",
              technique === "js" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {technique === "js" ? (
                  <Code className="h-4 w-4 text-green-600" />
                ) : (
                  <Globe className="h-4 w-4 text-blue-600" />
                )}
                <span className={cn(
                  "font-medium",
                  technique === "js" ? "text-green-900" : "text-blue-900"
                )}>
                  {technique === "js" ? "JavaScript Rendering (Crawl4AI)" : "Static HTML Parsing"}
                </span>
              </div>
              <p className={cn(
                "text-sm",
                technique === "js" ? "text-green-700" : "text-blue-700"
              )}>
                {technique === "js" 
                  ? "Full browser rendering with Playwright for dynamic content"
                  : "Fast HTML parsing for static content"
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={config.extraction.config.rendering.timeout || 30000}
                  onChange={(e) => updateExtractionConfig({
                    rendering: {
                      ...config.extraction.config.rendering,
                      timeout: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="5000"
                  max="120000"
                  step="1000"
                />
              </div>
              
              {technique === "js" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wait For Element
                  </label>
                  <input
                    type="text"
                    value={config.extraction.config.rendering.waitFor || ""}
                    onChange={(e) => updateExtractionConfig({
                      rendering: {
                        ...config.extraction.config.rendering,
                        waitFor: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=".job-description, #content"
                  />
                  <p className="text-xs text-gray-500 mt-1">Wait for this element before extracting</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Content Selection Strategy */}
          <ContentSelectionSection 
            crawl4aiConfig={crawl4aiConfig}
            updateCrawl4AIConfig={updateCrawl4AIConfig}
            addTargetElement={addTargetElement}
            addExcludedElement={addExcludedElement}
          />
          
          {/* Markdown Processing */}
          <MarkdownProcessingSection 
            crawl4aiConfig={crawl4aiConfig}
            updateCrawl4AIConfig={updateCrawl4AIConfig}
          />
          
          {/* LLM Configuration */}
          <LLMConfigurationSection 
            llmConfig={llmConfig}
            updateLLMConfig={updateLLMConfig}
          />
          
          {/* Performance Settings */}
          <PerformanceSection 
            config={config}
            updateExtractionConfig={updateExtractionConfig}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-components for better organization
function ContentSelectionSection({ crawl4aiConfig, updateCrawl4AIConfig, addTargetElement, addExcludedElement }: any) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Content Selection Strategy</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Smart Content Extraction</h4>
            <p className="text-sm text-blue-700">
              Crawl4AI will scrape content broadly, convert it to clean markdown, then use AI to extract structured job data.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Target Elements to Include */}
        <ElementSelector 
          title="Elements to Include"
          description="CSS selectors for content areas that likely contain job information"
          elements={crawl4aiConfig.contentSelection.targetElements}
          onAdd={addTargetElement}
          onRemove={(index: number) => {
            const updated = crawl4aiConfig.contentSelection.targetElements?.filter((_: any, i: number) => i !== index) || [];
            updateCrawl4AIConfig({
              contentSelection: {
                ...crawl4aiConfig.contentSelection,
                targetElements: updated
              }
            });
          }}
          placeholder="main, .job-content, .description, article"
          buttonColor="blue"
        />
        
        {/* Elements to Exclude */}
        <ElementSelector 
          title="Elements to Exclude"
          description="CSS selectors for content areas to ignore (navigation, ads, etc.)"
          elements={crawl4aiConfig.contentSelection.excludedTags}
          onAdd={addExcludedElement}
          onRemove={(index: number) => {
            const updated = crawl4aiConfig.contentSelection.excludedTags?.filter((_: any, i: number) => i !== index) || [];
            updateCrawl4AIConfig({
              contentSelection: {
                ...crawl4aiConfig.contentSelection,
                excludedTags: updated
              }
            });
          }}
          placeholder="header, footer, nav, .ads, .related-jobs"
          buttonColor="red"
        />
        
        {/* Content Quality Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={crawl4aiConfig.contentSelection.excludeExternalLinks}
                onChange={(e) => updateCrawl4AIConfig({
                  contentSelection: {
                    ...crawl4aiConfig.contentSelection,
                    excludeExternalLinks: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Exclude external links</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min words per block
            </label>
            <input
              type="number"
              value={crawl4aiConfig.contentSelection.wordCountThreshold || 20}
              onChange={(e) => updateCrawl4AIConfig({
                contentSelection: {
                  ...crawl4aiConfig.contentSelection,
                  wordCountThreshold: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ElementSelector({ title, description, elements, onAdd, onRemove, placeholder, buttonColor }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      <p className="text-xs text-gray-500 mb-3">
        {description}
      </p>
      <div className="space-y-2">
        {elements?.map((element: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <code className={cn(
              "flex-1 px-3 py-2 border rounded text-sm",
              buttonColor === "red" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
            )}>
              {element}
            </code>
            <button
              onClick={() => onRemove(index)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAdd(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
              onAdd(input.value);
              input.value = "";
            }}
            className={cn(
              "px-3 py-2 text-white rounded-lg text-sm",
              buttonColor === "red" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkdownProcessingSection({ crawl4aiConfig, updateCrawl4AIConfig }: any) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Markdown Processing</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markdown Strategy
          </label>
          <select
            value={crawl4aiConfig.markdownStrategy.type}
            onChange={(e) => updateCrawl4AIConfig({
              markdownStrategy: {
                ...crawl4aiConfig.markdownStrategy,
                type: e.target.value as "raw" | "fit" | "custom"
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="raw">Raw (include all content)</option>
            <option value="fit">Fit (optimize for LLM processing)</option>
            <option value="custom">Custom filtering</option>
          </select>
        </div>
        
        {crawl4aiConfig.markdownStrategy.type !== "raw" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Content Filter</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Type
                </label>
                <select
                  value={crawl4aiConfig.markdownStrategy.contentFilter?.type || "pruning"}
                  onChange={(e) => updateCrawl4AIConfig({
                    markdownStrategy: {
                      ...crawl4aiConfig.markdownStrategy,
                      contentFilter: {
                        ...crawl4aiConfig.markdownStrategy.contentFilter,
                        type: e.target.value as "pruning" | "bm25" | "llm"
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pruning">Pruning (remove low-quality content)</option>
                  <option value="bm25">BM25 (relevance-based filtering)</option>
                  <option value="llm">LLM (AI-powered filtering)</option>
                </select>
              </div>
              
              {crawl4aiConfig.markdownStrategy.contentFilter?.type === "bm25" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={crawl4aiConfig.markdownStrategy.contentFilter.query || ""}
                    onChange={(e) => updateCrawl4AIConfig({
                      markdownStrategy: {
                        ...crawl4aiConfig.markdownStrategy,
                        contentFilter: {
                          ...crawl4aiConfig.markdownStrategy.contentFilter,
                          query: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="job requirements salary benefits"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LLMConfigurationSection({ llmConfig, updateLLMConfig }: any) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">AI Extraction Configuration</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={llmConfig.model}
              onChange={(e) => updateLLMConfig({ model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <optgroup label="OpenAI GPT-4">
                <option value="gpt-4o">GPT-4o ($2.50 / $10.00)</option>
                <option value="gpt-4o-mini">GPT-4o-mini ($0.15 / $0.60)</option>
              </optgroup>
              <optgroup label="OpenAI GPT-5 (Preview)">
                <option value="gpt-5-turbo">GPT-5 Turbo ($3.00 / $15.00) 🔄</option>
                <option value="gpt-5-turbo-reasoning">GPT-5 Turbo Reasoning ($5.00 / $20.00) 🔄</option>
              </optgroup>
              <optgroup label="Anthropic Claude">
                <option value="claude-3-haiku">Claude 3 Haiku ($0.25 / $1.25)</option>
                <option value="claude-3-sonnet">Claude 3.5 Sonnet ($3.00 / $15.00)</option>
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature
            </label>
            <input
              type="number"
              value={llmConfig.temperature}
              onChange={(e) => updateLLMConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="1"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">0 = consistent, 1 = creative</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            value={llmConfig.systemPrompt}
            onChange={(e) => updateLLMConfig({ systemPrompt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Extract job information from the markdown content. Focus on title, company, location, salary, and description."
          />
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={llmConfig.requireAllFields}
              onChange={(e) => updateLLMConfig({ requireAllFields: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Require all fields</span>
          </label>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Max tokens:</label>
            <input
              type="number"
              value={llmConfig.maxTokens}
              onChange={(e) => updateLLMConfig({ maxTokens: parseInt(e.target.value) })}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min="100"
              max="4000"
              step="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceSection({ config, updateExtractionConfig }: any) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Performance & Reliability</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Concurrent
          </label>
          <input
            type="number"
            value={config.extraction.config.parallelism.maxConcurrent}
            onChange={(e) => updateExtractionConfig({
              parallelism: {
                ...config.extraction.config.parallelism,
                maxConcurrent: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="20"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delay Between (ms)
          </label>
          <input
            type="number"
            value={config.extraction.config.parallelism.delayBetween}
            onChange={(e) => updateExtractionConfig({
              parallelism: {
                ...config.extraction.config.parallelism,
                delayBetween: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="10000"
            step="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retry Count
          </label>
          <input
            type="number"
            value={config.extraction.config.parallelism.retryCount}
            onChange={(e) => updateExtractionConfig({
              parallelism: {
                ...config.extraction.config.parallelism,
                retryCount: parseInt(e.target.value)
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="10"
          />
        </div>
      </div>
    </div>
  );
}