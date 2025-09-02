import React from "react";
import { Search, Globe, Network } from "lucide-react";
import { cn, parseCurl } from "@/lib/utils";
import { SourceConfig, DiscoveryTechnique, DiscoveryConfig } from "@/lib/types";
import { ApiTestAndSelection } from "../../components/ApiTestAndSelection";
import { HtmlJsDiscoveryConfig } from "./HtmlJsDiscoveryConfig";

interface DiscoverySetupStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function DiscoverySetupStep({ config, setConfig }: DiscoverySetupStepProps) {
  const technique = config.discovery.technique;
  
  const updateDiscoveryConfig = (updates: Partial<DiscoveryConfig>) => {
    setConfig({
      ...config,
      discovery: {
        ...config.discovery,
        config: {
          ...config.discovery.config,
          ...updates
        }
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Discovery Configuration</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Configure how to find job listing URLs. This step discovers all available job postings.
        </p>
        
        {/* Technique Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Discovery Technique
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(["api", "rss", "sitemap", "html", "js"] as DiscoveryTechnique[]).map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => setConfig({
                  ...config,
                  discovery: { ...config.discovery, technique: tech }
                })}
                className={cn(
                  "p-3 border-2 rounded-lg text-center transition-colors",
                  technique === tech
                    ? tech === "api" ? "border-purple-500 bg-purple-50 text-purple-700" :
                      tech === "html" ? "border-blue-500 bg-blue-50 text-blue-700" :
                      tech === "js" ? "border-green-500 bg-green-50 text-green-700" :
                      "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="font-medium">{tech.toUpperCase()}</div>
                <div className="text-xs mt-1">
                  {tech === "api" ? "API calls" :
                   tech === "rss" ? "RSS feeds" :
                   tech === "sitemap" ? "XML sitemaps" :
                   tech === "html" ? "Static HTML" :
                   "JS rendering"}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Technique-specific configuration */}
        {technique === "html" || technique === "js" ? (
          <HtmlJsDiscoveryConfig 
            config={config}
            setConfig={setConfig}
            technique={technique}
            updateDiscoveryConfig={updateDiscoveryConfig}
          />
        ) : technique === "api" ? (
          <ApiDiscoveryConfig 
            config={config}
            setConfig={setConfig}
            updateDiscoveryConfig={updateDiscoveryConfig}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Configuration for {technique} discovery coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

function ApiDiscoveryConfig({ config, setConfig, updateDiscoveryConfig }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Network className="h-4 w-4 text-purple-600" />
          <span className="font-medium text-purple-900">API Configuration</span>
        </div>
        <p className="text-sm text-purple-700">Configure API endpoints and authentication</p>
      </div>
      
      {/* cURL Import Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Quick Setup from cURL</h3>
        <p className="text-sm text-gray-600 mb-3">
          Paste a cURL command from Chrome DevTools to automatically fill in the API configuration:
        </p>
        <textarea
          placeholder={`curl 'https://api.example.com/jobs' \\
  -H 'accept: application/json' \\
  -H 'user-agent: Mozilla/5.0...' \\
  -H 'referer: https://example.com'`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          rows={4}
          onChange={(e) => {
            const curlCommand = e.target.value;
            if (curlCommand.trim()) {
              const parsed = parseCurl(curlCommand);
              if (parsed) {
                // Auto-fill the API configuration
                const extractBaseUrl = (url: string) => {
                  try {
                    const urlObj = new URL(url);
                    return `${urlObj.protocol}//${urlObj.host}`;
                  } catch {
                    return "";
                  }
                };

                updateDiscoveryConfig({
                  api: {
                    endpoint: parsed.url,
                    method: parsed.method,
                    headers: parsed.headers,
                    auth: { type: "none" },
                    pagination: { type: "none" },
                    responseMapping: { urlPath: "" },
                    baseUrl: extractBaseUrl(parsed.url)
                  }
                });
              }
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Right-click on a network request in Chrome DevTools → Copy → Copy as cURL
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Endpoint
          </label>
          <input
            type="url"
            value={config.discovery.config.api?.endpoint || ""}
            onChange={(e) => {
              const extractBaseUrl = (url: string) => {
                try {
                  const urlObj = new URL(url);
                  return `${urlObj.protocol}//${urlObj.host}`;
                } catch {
                  return "";
                }
              };

              updateDiscoveryConfig({
                api: {
                  ...config.discovery.config.api,
                  endpoint: e.target.value,
                  method: config.discovery.config.api?.method || "GET",
                  headers: config.discovery.config.api?.headers || {},
                  auth: config.discovery.config.api?.auth || { type: "none" },
                  pagination: config.discovery.config.api?.pagination || { type: "none" },
                  responseMapping: config.discovery.config.api?.responseMapping || { urlPath: "" },
                  baseUrl: e.target.value ? extractBaseUrl(e.target.value) : (config.discovery.config.api?.baseUrl || "")
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://api.example.com/jobs"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTTP Method
          </label>
          <select
            value={config.discovery.config.api?.method || "GET"}
            onChange={(e) => updateDiscoveryConfig({
              api: {
                ...config.discovery.config.api,
                endpoint: config.discovery.config.api?.endpoint || "",
                method: e.target.value,
                headers: config.discovery.config.api?.headers || {},
                auth: config.discovery.config.api?.auth || { type: "none" },
                pagination: config.discovery.config.api?.pagination || { type: "none" },
                responseMapping: config.discovery.config.api?.responseMapping || { urlPath: "" }
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>
      
      {/* Custom Headers */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Custom Headers</h3>
        <p className="text-sm text-gray-600 mb-3">
          Additional headers beyond those auto-filled from cURL (optional):
        </p>
        <textarea
          value={Object.entries(config.discovery.config.api?.headers || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}
          onChange={(e) => {
            const headers: Record<string, string> = {};
            e.target.value.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key?.trim() && valueParts.length > 0) {
                headers[key.trim()] = valueParts.join(':').trim();
              }
            });
            updateDiscoveryConfig({
              api: {
                ...config.discovery.config.api,
                endpoint: config.discovery.config.api?.endpoint || "",
                method: config.discovery.config.api?.method || "GET",
                headers,
                auth: config.discovery.config.api?.auth || { type: "none" },
                pagination: config.discovery.config.api?.pagination || { type: "none" },
                responseMapping: config.discovery.config.api?.responseMapping || { urlPath: "" }
              }
            });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          rows={3}
          placeholder={`Accept: application/json\nUser-Agent: CustomBot/1.0\nX-Custom-Header: value`}
        />
        <p className="text-xs text-gray-500 mt-1">One header per line in format: Header-Name: value</p>
      </div>

      {/* Test API and Select Job URLs */}
      <ApiTestAndSelection config={config} setConfig={setConfig} />
    </div>
  );
}