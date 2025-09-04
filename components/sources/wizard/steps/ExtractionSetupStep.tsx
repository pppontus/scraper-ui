import React, { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";
import { ApiFieldPicker } from "../components/ApiFieldPicker";

interface ExtractionSetupStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function ExtractionSetupStep({ config, setConfig }: ExtractionSetupStepProps) {
  const discoveredUrls = useMemo(() => config.testResults?.discovery?.urls || [], [config.testResults]);
  
  const updateExtractionConfig = (updates: any) => {
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

  // Removed right-side preview box per request

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Extract Details</h2>
        </div>
        
        {/* Configuration Panel */}
        <div className="p-6">
            <p className="text-gray-600 mb-6">
              Configure how to extract job details and generate markdown that will be sent to the LLM for structured parsing.
            </p>
            
            {/* Technique Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Extraction Technique
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="extraction-technique"
                    value="api"
                    checked={config.extraction.technique === "api"}
                    onChange={(e) => setConfig({
                      ...config,
                      extraction: { ...config.extraction, technique: "api" }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">API</div>
                    <div className="text-sm text-gray-500">Extract from JSON API responses</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="extraction-technique"
                    value="html"
                    checked={config.extraction.technique === "html"}
                    onChange={() => setConfig({
                      ...config,
                      extraction: {
                        ...config.extraction,
                        technique: "html",
                        config: {
                          ...config.extraction.config,
                          rendering: {
                            ...(config.extraction.config.rendering || {}),
                            technique: "html",
                          },
                        },
                      },
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">HTML Scraping</div>
                    <div className="text-sm text-gray-500">Extract from HTML with Crawl4AI</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="extraction-technique"
                    value="js"
                    checked={config.extraction.technique === "js"}
                    onChange={() => setConfig({
                      ...config,
                      extraction: {
                        ...config.extraction,
                        technique: "js",
                        config: {
                          ...config.extraction.config,
                          rendering: {
                            ...(config.extraction.config.rendering || {}),
                            technique: "js",
                          },
                        },
                      },
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">JavaScript Rendering</div>
                    <div className="text-sm text-gray-500">Handle dynamic content with JS execution</div>
                  </div>
                </label>
              </div>
            </div>
            
          {/* Dynamic Configuration */}
          <div className="space-y-6">
            {config.extraction.technique === "api" ? (
              <ApiFieldPicker config={config} setConfig={setConfig} />
            ) : (
              <HtmlJsConfiguration
                config={config}
                setConfig={setConfig}
                updateExtractionConfig={updateExtractionConfig}
                discoveredUrls={discoveredUrls}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// HTML/JS Configuration Component (enhanced)
function HtmlJsConfiguration({ config, setConfig, updateExtractionConfig, discoveredUrls }: any) {
  const crawl4aiConfig = config.extraction.config.crawl4ai || {};
  const rendering = config.extraction.config.rendering || { technique: config.extraction.technique };
  const initialUrl = discoveredUrls?.[0] || "";
  const [sampleUrl, setSampleUrl] = useState<string>(initialUrl);
  const [preview, setPreview] = useState<{ request: string; markdown: string } | null>(null);

  const onTestSample = (urlOverride?: string) => {
    const targetUrl = urlOverride || sampleUrl;
    if (!targetUrl) return;
    const req = `${rendering.technique === 'js' ? 'JS render' : 'HTML fetch'} ${targetUrl}` +
      (rendering.waitFor ? ` • waitFor=${rendering.waitFor}` : '') +
      (rendering.timeout ? ` • timeout=${rendering.timeout}ms` : '');
    const md = `# Job Details\n\nURL: ${targetUrl}\n\n**Title:** Example Title\n**Company:** Example Company\n\n## Content\nRendered content extracted from ${crawl4aiConfig.contentSelection?.cssSelector || crawl4aiConfig.contentSelection?.targetElements?.join(', ') || 'main region'}...\n`;
    setPreview({ request: req, markdown: md });
  };

  return (
    <div className="space-y-6">
      {/* Rendering Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wait for selector</label>
          <input
            value={rendering.waitFor || ''}
            onChange={(e) => updateExtractionConfig({ rendering: { ...rendering, waitFor: e.target.value } })}
            className="w-full px-3 py-2 border rounded"
            placeholder=".job-description or #main"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
          <input
            type="number"
            value={rendering.timeout || 30000}
            onChange={(e) => updateExtractionConfig({ rendering: { ...rendering, timeout: Number(e.target.value) } })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Interactions & Custom JS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interactions (one per line)</label>
          <textarea
            rows={3}
            value={(rendering.interactions || []).join('\n')}
            onChange={(e) => updateExtractionConfig({ rendering: { ...rendering, interactions: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) } })}
            className="w-full px-3 py-2 border rounded font-mono text-xs"
            placeholder="click('button.accept-cookies')\nclick('.show-more')\nscroll(2)\nwait(1000)"
          />
          <p className="text-xs text-gray-500 mt-1">Actions to run before extraction (clicks, scrolls, waits).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom JS (optional)</label>
          <textarea
            rows={3}
            value={rendering.customJS || ''}
            onChange={(e) => updateExtractionConfig({ rendering: { ...rendering, customJS: e.target.value } })}
            className="w-full px-3 py-2 border rounded font-mono text-xs"
            placeholder="document.querySelector('.expand').click()"
          />
        </div>
      </div>

      {/* Content Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main region selector</label>
          <input
            value={crawl4aiConfig.contentSelection?.cssSelector || ''}
            onChange={(e) => updateExtractionConfig({
              crawl4ai: {
                ...crawl4aiConfig,
                contentSelection: { ...crawl4aiConfig.contentSelection, cssSelector: e.target.value }
              }
            })}
            className="w-full px-3 py-2 border rounded"
            placeholder="main, article, .job-content"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Excluded selectors</label>
          <input
            value={crawl4aiConfig.contentSelection?.excludedTags?.join(', ') || ''}
            onChange={(e) => updateExtractionConfig({
              crawl4ai: {
                ...crawl4aiConfig,
                contentSelection: {
                  ...crawl4aiConfig.contentSelection,
                  excludedTags: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                }
              }
            })}
            className="w-full px-3 py-2 border rounded"
            placeholder="header, footer, nav, .ads"
          />
        </div>
      </div>

      {/* Content filters and strategy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Markdown strategy</label>
          <select
            value={crawl4aiConfig.markdownStrategy?.type || 'fit'}
            onChange={(e) => updateExtractionConfig({
              crawl4ai: {
                ...crawl4aiConfig,
                markdownStrategy: { ...crawl4aiConfig.markdownStrategy, type: e.target.value }
              }
            })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="raw">Raw</option>
            <option value="fit">Fit</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exclude external links/images</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!crawl4aiConfig.contentSelection?.excludeExternalLinks}
                onChange={(e) => updateExtractionConfig({
                  crawl4ai: {
                    ...crawl4aiConfig,
                    contentSelection: { ...crawl4aiConfig.contentSelection, excludeExternalLinks: e.target.checked }
                  }
                })}
              />
              Links
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!crawl4aiConfig.contentSelection?.excludeExternalImages}
                onChange={(e) => updateExtractionConfig({
                  crawl4ai: {
                    ...crawl4aiConfig,
                    contentSelection: { ...crawl4aiConfig.contentSelection, excludeExternalImages: e.target.checked }
                  }
                })}
              />
              Images
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Word count threshold</label>
          <input
            type="number"
            value={crawl4aiConfig.contentSelection?.wordCountThreshold || 20}
            onChange={(e) => updateExtractionConfig({
              crawl4ai: {
                ...crawl4aiConfig,
                contentSelection: { ...crawl4aiConfig.contentSelection, wordCountThreshold: Number(e.target.value) }
              }
            })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Sample test (inline) */}
      <div className="border rounded p-4 bg-gray-50 space-y-3">
        {discoveredUrls?.length > 0 ? (
          <div>
            <div className="text-sm font-medium text-gray-800 mb-2">Discovered URLs</div>
            <div className="space-y-1">
              {discoveredUrls.map((u: string, i: number) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="truncate font-mono text-sm flex-1">{u}</div>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => onTestSample(u)}
                  >
                    Generate Markdown
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No discovered URLs yet. Run the Find Jobs step to populate sample URLs.</div>
        )}

        {preview && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Markdown Preview</div>
            <div className="bg-white border rounded p-3 font-mono text-[12px] whitespace-pre-wrap max-h-80 overflow-auto">
              {preview.markdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
