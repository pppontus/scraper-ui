import React from "react";
import { Globe, CheckCircle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";
import { getLinkMatchType, getMatchReason } from "../../utils/pattern-matching";
import { PopupAndCookieForm } from "../../components/PopupAndCookieForm";
import { ScrapeStopConditionsBuilder } from "../../components/ScrapeStopConditionsBuilder";

interface HtmlJsDiscoveryConfigProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
  technique: "html" | "js";
  updateDiscoveryConfig: (updates: any) => void;
}

export function HtmlJsDiscoveryConfig({ 
  config, 
  setConfig, 
  technique,
  updateDiscoveryConfig 
}: HtmlJsDiscoveryConfigProps) {
  
  // Provide safe defaults for scraping config
  const getSafeScrapingConfig = () => {
    const current = config.discovery.config.scraping;
    return {
      rendering: current?.rendering || { technique: "html" },
      contentArea: current?.contentArea || { strategy: "auto" },
      linkFiltering: current?.linkFiltering || { includePatterns: [] },
      pagination: {
        type: current?.pagination?.type || "numbered" as const,
        maxPages: current?.pagination?.maxPages || 10,
        ...current?.pagination
      },
      deduplication: current?.deduplication || { by: "url_normalized", keepFirst: true },
      ...current
    };
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">Web Scraping Configuration</span>
        </div>
        <p className="text-sm text-blue-700">
          {technique === "js" ? "Using Crawl4AI with JavaScript rendering" : "Using static HTML parsing"}
        </p>
      </div>
      
      {/* Pagination Settings */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Pagination</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strategy</label>
            <select
              value={getSafeScrapingConfig().pagination.type}
              onChange={(e) => {
                const safe = getSafeScrapingConfig();
                updateDiscoveryConfig({
                  scraping: {
                    ...safe,
                    pagination: { ...safe.pagination, type: e.target.value as any }
                  }
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="numbered">Numbered pages</option>
              <option value="next-link">Next link</option>
              <option value="load-more">Load more button</option>
              <option value="infinite">Infinite scroll</option>
              <option value="virtual">Virtual list</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max pages</label>
            <input
              type="number"
              value={getSafeScrapingConfig().pagination.maxPages || 10}
              onChange={(e) => {
                const safe = getSafeScrapingConfig();
                updateDiscoveryConfig({
                  scraping: {
                    ...safe,
                    pagination: { ...safe.pagination, maxPages: parseInt(e.target.value) || 0 }
                  }
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stop conditions</label>
            {getSafeScrapingConfig().pagination.stopCondition && (
              <div className="mb-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                Legacy stop condition detected: "{getSafeScrapingConfig().pagination.stopCondition}". This free-text field is deprecated; please re-create it using the structured builder below.
              </div>
            )}
            <ScrapeStopConditionsBuilder
              value={getSafeScrapingConfig().pagination.stop}
              onChange={(val) => {
                const safe = getSafeScrapingConfig();
                updateDiscoveryConfig({
                  scraping: {
                    ...safe,
                    pagination: { ...safe.pagination, stop: val }
                  }
                });
              }}
            />
          </div>
        </div>

        {/* Strategy-specific fields */}
        {(() => {
          const p = getSafeScrapingConfig().pagination;
          if (p.type === 'next-link' || p.type === 'numbered') {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next link selector</label>
                  <input
                    type="text"
                    value={p.nextSelector || ''}
                    onChange={(e) => updateDiscoveryConfig({ scraping: { ...getSafeScrapingConfig(), pagination: { ...p, nextSelector: e.target.value } } })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="a.next, button.next"
                  />
                </div>
              </div>
            );
          }
          if (p.type === 'load-more') {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Load more selector</label>
                  <input
                    type="text"
                    value={p.loadMoreSelector || ''}
                    onChange={(e) => updateDiscoveryConfig({ scraping: { ...getSafeScrapingConfig(), pagination: { ...p, loadMoreSelector: e.target.value } } })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="button.load-more"
                  />
                </div>
              </div>
            );
          }
          if (p.type === 'infinite' || p.type === 'virtual') {
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scroll count</label>
                  <input
                    type="number"
                    value={p.scrollCount || 5}
                    onChange={(e) => updateDiscoveryConfig({ scraping: { ...getSafeScrapingConfig(), pagination: { ...p, scrollCount: parseInt(e.target.value) || 0 } } })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scroll delay (ms)</label>
                  <input
                    type="number"
                    value={p.scrollDelay || 800}
                    onChange={(e) => updateDiscoveryConfig({ scraping: { ...getSafeScrapingConfig(), pagination: { ...p, scrollDelay: parseInt(e.target.value) || 0 } } })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
      
      {/* Page Prep: Cookies & Popups (JS-only, optional) */}
      {technique === 'js' && (
        <div>
          <PopupAndCookieForm
            technique={technique}
            value={getSafeScrapingConfig().popupHandling}
            existingInteractions={getSafeScrapingConfig().rendering?.interactions || []}
            existingCustomJS={getSafeScrapingConfig().rendering?.customJS || ''}
            onUpdate={({ popupHandling, interactions, customJS }) => {
              const safe = getSafeScrapingConfig();
              updateDiscoveryConfig({
                scraping: {
                  ...safe,
                  popupHandling,
                  rendering: {
                    ...(safe.rendering || { technique: 'js' }),
                    interactions,
                    customJS,
                  },
                }
              });
            }}
          />
        </div>
      )}

      {/* Step 1: Content Area Detection & Link Discovery */}
      <ContentAreaDetection 
        config={config}
        setConfig={setConfig}
        getSafeScrapingConfig={getSafeScrapingConfig}
        updateDiscoveryConfig={updateDiscoveryConfig}
      />
      
      {/* Step 2: Pattern Filtering (only show after links are discovered) */}
      {(config.testResults?.discovery as any)?.allLinks && (
        <PatternFiltering 
          config={config}
          getSafeScrapingConfig={getSafeScrapingConfig}
          updateDiscoveryConfig={updateDiscoveryConfig}
        />
      )}
    </div>
  );
}

function ContentAreaDetection({ config, setConfig, getSafeScrapingConfig, updateDiscoveryConfig }: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
        <h3 className="font-medium text-gray-900">Content Area Detection</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detection Strategy
          </label>
          <select
            value={getSafeScrapingConfig().contentArea?.strategy || "auto"}
            onChange={(e) => {
              const safe = getSafeScrapingConfig();
              updateDiscoveryConfig({
                scraping: {
                  ...safe,
                  contentArea: {
                    ...safe.contentArea,
                    strategy: e.target.value as "auto" | "selector" | "largest_content"
                  }
                }
              });
              // Clear discovered links when strategy changes
              setConfig((prev: SourceConfig) => ({
                ...prev,
                testResults: prev.testResults ? {
                  ...prev.testResults,
                  discovery: undefined
                } : undefined
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="auto">Auto-detect main content area</option>
            <option value="selector">Use fallback selectors</option>
            <option value="largest_content">Largest content block</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">How Crawl4AI should find the main content area</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fallback Selectors
          </label>
          <input
            type="text"
            value={getSafeScrapingConfig().contentArea?.selectors?.join(", ") || ""}
            onChange={(e) => {
              const safe = getSafeScrapingConfig();
              updateDiscoveryConfig({
                scraping: {
                  ...safe,
                  contentArea: {
                    ...safe.contentArea,
                    strategy: safe.contentArea?.strategy || "auto",
                    selectors: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="main, #content, .listings, .jobs"
          />
          <p className="text-xs text-gray-500 mt-1">
            {getSafeScrapingConfig().contentArea?.strategy === "auto" 
              ? "Used if auto-detection fails"
              : "Primary selectors to check for content"
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exclude Regions
          </label>
          <input
            type="text"
            value={getSafeScrapingConfig().contentArea?.excludeRegions?.join(", ") || ""}
            onChange={(e) => {
              const safe = getSafeScrapingConfig();
              updateDiscoveryConfig({
                scraping: {
                  ...safe,
                  contentArea: {
                    ...safe.contentArea,
                    strategy: safe.contentArea?.strategy || "auto",
                    excludeRegions: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="header, footer, nav, .ads, .sidebar"
          />
          <p className="text-xs text-gray-500 mt-1">Selectors for regions to exclude from content</p>
        </div>
        
        {/* Find Links Button */}
        <div className="border-t pt-4">
          <button
            onClick={() => {
              // Mock link discovery - in real implementation this would call the backend
              const mockLinks = [
                { url: "https://example.com/jobs/senior-developer-123", text: "Senior Developer", matches: [] },
                { url: "/careers/frontend-engineer", text: "Frontend Engineer", matches: [] },
                { url: "/uppdrag/backend-konsult-456", text: "Backend Konsult", matches: [] },
                { url: "/jobs/fullstack-developer", text: "Fullstack Developer", matches: [] },
                { url: "/login", text: "Login", matches: [] },
                { url: "/register", text: "Create Account", matches: [] },
                { url: "#search-filters", text: "Filter Results", matches: [] },
                { url: "/jobs/data-scientist-789", text: "Data Scientist", matches: [] },
                { url: "/karriar/projektledare", text: "Projektledare", matches: [] },
                { url: "/contact", text: "Contact Us", matches: [] }
              ];
              
              setConfig((prev: SourceConfig) => ({
                ...prev,
                testResults: {
                  ...prev.testResults,
                  discovery: {
                    success: true,
                    urls: mockLinks.map(l => l.url),
                    metadata: mockLinks.map(l => ({
                      url: l.url,
                      title: l.text,
                      linkText: l.text
                    })),
                    duration: 1200,
                    timestamp: new Date(),
                    allLinks: mockLinks
                  } as any
                }
              }));
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            🔍 Find Links in Content Area
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Crawl4AI will extract all links from the detected content area
          </p>
        </div>
      </div>
    </div>
  );
}

function PatternFiltering({ config, getSafeScrapingConfig, updateDiscoveryConfig }: any) {
  return (
    <div className="border-t pt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
        <h3 className="font-medium text-gray-900">Pattern Filtering</h3>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-900">
            Found {(config.testResults.discovery as any).allLinks.length} links
          </span>
        </div>
        <p className="text-sm text-green-700">
          Now refine which links should be considered job listings using patterns
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Patterns (one per line)
            </label>
            <textarea
              value={getSafeScrapingConfig().linkFiltering?.includePatterns?.join("\n") || "/jobs/\n/uppdrag/\n/karriar/"}
              onChange={(e) => {
                const safe = getSafeScrapingConfig();
                const patterns = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                updateDiscoveryConfig({
                  scraping: {
                    ...safe,
                    linkFiltering: {
                      ...safe.linkFiltering,
                      includePatterns: patterns
                    }
                  }
                });
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="/jobs/\n/uppdrag/\n/karriar/\n\\?id=\\d+"
            />
            <p className="text-xs text-gray-500 mt-1">Regex patterns for job link URLs</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclude Patterns (one per line)
            </label>
            <textarea
              value={getSafeScrapingConfig().linkFiltering?.excludePatterns?.join("\n") || "/login\n/register\n#"}
              onChange={(e) => {
                const safe = getSafeScrapingConfig();
                const patterns = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
                updateDiscoveryConfig({
                  scraping: {
                    ...safe,
                    linkFiltering: {
                      ...safe.linkFiltering,
                      includePatterns: safe.linkFiltering?.includePatterns || [],
                      excludePatterns: patterns
                    }
                  }
                });
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="/login\n/register\n#\njavascript:"
            />
            <p className="text-xs text-gray-500 mt-1">Patterns to exclude from results</p>
          </div>
        </div>
        
        {/* Live Visual Feedback */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Live Pattern Results</h4>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {(config.testResults?.discovery as any)?.allLinks?.map((link: any, index: number) => {
              const linkFiltering = config.discovery.config.scraping?.linkFiltering;
              const matchType = getLinkMatchType(link.url, linkFiltering);
              
              return (
                <div
                  key={index}
                  className={`p-3 border-b border-gray-100 ${
                    matchType === 'included' ? 'bg-green-50 border-l-4 border-l-green-500' :
                    matchType === 'excluded' ? 'bg-red-50 border-l-4 border-l-red-500' :
                    'bg-gray-50 border-l-4 border-l-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {matchType === 'included' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                        {matchType === 'excluded' && <X className="h-4 w-4 text-red-600 flex-shrink-0" />}
                        {matchType === 'unmatched' && <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                        <span className={`text-sm font-medium truncate ${
                          matchType === 'included' ? 'text-green-900' :
                          matchType === 'excluded' ? 'text-red-900' :
                          'text-gray-600'
                        }`}>
                          {link.text}
                        </span>
                      </div>
                      <div className={`text-xs font-mono truncate ${
                        matchType === 'included' ? 'text-green-700' :
                        matchType === 'excluded' ? 'text-red-700' :
                        'text-gray-500'
                      }`}>
                        {link.url}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getMatchReason(link.url, linkFiltering)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 font-medium">Pattern Results:</span>
              <div className="flex gap-4">
                <span className="text-green-700">
                  ✅ {(config.testResults?.discovery as any)?.allLinks?.filter((l: any) => getLinkMatchType(l.url, config.discovery.config.scraping?.linkFiltering) === 'included').length || 0} included
                </span>
                <span className="text-red-700">
                  ❌ {(config.testResults?.discovery as any)?.allLinks?.filter((l: any) => getLinkMatchType(l.url, config.discovery.config.scraping?.linkFiltering) === 'excluded').length || 0} excluded
                </span>
                <span className="text-gray-600">
                  ⚪ {(config.testResults?.discovery as any)?.allLinks?.filter((l: any) => getLinkMatchType(l.url, config.discovery.config.scraping?.linkFiltering) === 'unmatched').length || 0} unmatched
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
