import React, { useState } from "react";
import { TestTube2, PlayCircle, AlertCircle, CheckCircle, Database, FileText, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";

interface ApiTestAndSelectionProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function ApiTestAndSelection({ config, setConfig }: ApiTestAndSelectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<string>("");
  
  const generateJsonPath = (obj: any, targetValue: any, currentPath = "$"): string | null => {
    if (obj === targetValue) return currentPath;
    
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = generateJsonPath(obj[i], targetValue, `${currentPath}[${i}]`);
        if (result) {
          // Convert specific array index to wildcard pattern
          return result.replace(/\[\d+\]/g, '[*]');
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const result = generateJsonPath(obj[key], targetValue, currentPath === "$" ? `$.${key}` : `${currentPath}.${key}`);
        if (result) return result;
      }
    }
    
    return null;
  };
  
  const combineUrls = (baseUrl: string, relativeUrl: string): string => {
    if (!baseUrl || relativeUrl.startsWith('http')) {
      return relativeUrl; // Already absolute or no base URL
    }
    
    // Remove trailing slash from base, ensure relative starts with slash
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    
    return `${cleanBase}${cleanRelative}`;
  };

  const extractUrlsFromPath = (data: any, jsonPath: string): string[] => {
    const baseUrl = config.discovery.config.api?.baseUrl || '';
    
    try {
      // Parse JSONPath like $.data.jobs[*].url
      const pathParts = jsonPath.replace('$', '').split('.');
      let current = data;
      
      for (const part of pathParts) {
        if (!part) continue;
        
        if (part.includes('[*]')) {
          const arrayKey = part.replace('[*]', '');
          if (current[arrayKey] && Array.isArray(current[arrayKey])) {
            // Extract the final field from array items
            const remainingPath = pathParts.slice(pathParts.indexOf(part) + 1).join('.');
            if (remainingPath) {
              return current[arrayKey].map((item: any) => {
                let value = item;
                for (const subPart of remainingPath.split('.')) {
                  value = value?.[subPart];
                }
                return value && typeof value === 'string' ? combineUrls(baseUrl, value) : null;
              }).filter((url): url is string => url !== null);
            }
            return current[arrayKey];
          }
        } else {
          current = current[part];
        }
        
        if (current === undefined) return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting URLs:', error);
      return [];
    }
  };

  const renderValueOnly = (value: any): JSX.Element => {
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    } else if (typeof value === 'number') {
      return <span className="text-purple-600">{value}</span>;
    } else if (typeof value === 'boolean') {
      return <span className="text-orange-600">{value.toString()}</span>;
    } else if (value === null) {
      return <span className="text-gray-400">null</span>;
    }
    return <span>{String(value)}</span>;
  };
  
  const renderJsonValue = (value: any, path: string, key?: string): JSX.Element => {
    const isUrlField = key && (key.toLowerCase().includes('url') || key.toLowerCase().includes('link'));
    
    // Handle object properties (when key is provided)
    if (key) {
      if (isUrlField) {
        // URL field - make the field name clickable  
        return (
          <div className="flex items-start">
            <span 
              onClick={() => {
                const jsonPath = path;
                const wildcardPath = jsonPath.replace(/\[\d+\]/g, '[*]');
                setSelectedPath(wildcardPath);
                // Auto-populate the URL path field
                setConfig({
                  ...config,
                  discovery: {
                    ...config.discovery,
                    config: {
                      ...config.discovery.config,
                      api: {
                        ...config.discovery.config.api,
                        endpoint: config.discovery.config.api?.endpoint || "",
                        method: config.discovery.config.api?.method || "GET",
                        headers: config.discovery.config.api?.headers || {},
                        auth: config.discovery.config.api?.auth || { type: "none" },
                        pagination: config.discovery.config.api?.pagination || { type: "none" },
                        responseMapping: {
                          urlPath: wildcardPath
                        }
                      }
                    }
                  }
                });
              }}
              className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              "{key}":
            </span>
            <span className="ml-2 text-green-600">"{value}"</span>
          </div>
        );
      } else {
        // Non-URL field - display normally with nested rendering
        return (
          <div>
            <span className="text-blue-800">"{key}":</span>
            <span className="ml-2">
              {typeof value === 'object' && value !== null ? (
                renderNestedValue(value, path)
              ) : (
                renderValueOnly(value)
              )}
            </span>
          </div>
        );
      }
    } else {
      // Handle array items or other values without keys
      return renderNestedValue(value, path);
    }
  };

  const renderNestedValue = (value: any, path: string): JSX.Element => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div className="ml-4">
            <span className="text-gray-600">[</span>
            {value.slice(0, 3).map((item, index) => (
              <div key={index} className="ml-4">
                {renderJsonValue(item, `${path}[${index}]`)}
                {index < Math.min(2, value.length - 1) && <span className="text-gray-600">,</span>}
              </div>
            ))}
            {value.length > 3 && (
              <div className="ml-4 text-gray-500">
                ... {value.length - 3} more items
              </div>
            )}
            <span className="text-gray-600">]</span>
          </div>
        );
      } else {
        return (
          <div className="ml-4">
            <span className="text-gray-600">{"{"}</span>
            {Object.entries(value).map(([k, v], index, arr) => (
              <div key={k} className="ml-4">
                {renderJsonValue(v, `${path}.${k}`, k)}
                {index < arr.length - 1 && <span className="text-gray-600">,</span>}
              </div>
            ))}
            <span className="text-gray-600">{"}"}</span>
          </div>
        );
      }
    } else {
      return renderValueOnly(value);
    }
  };

  // Calculate current URLs based on selected path
  const getCurrentUrls = (): string[] => {
    if (!rawResponse || !config.discovery.config.api?.responseMapping.urlPath) {
      return [];
    }
    return extractUrlsFromPath(rawResponse, config.discovery.config.api.responseMapping.urlPath);
  };

  const runTest = async () => {
    if (!config.discovery.config.api?.endpoint) {
      alert('Please configure the API endpoint first');
      return;
    }

    setIsRunning(true);
    try {
      // Mock API response based on the endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = {
        success: true,
        data: {
          jobs: [
            {
              id: "1",
              title: "Senior Fullstack Developer",
              company: "Tech Corp",
              location: "Stockholm",
              url: "/jobs/senior-fullstack-developer",
              fullUrl: "https://consultancy.se/jobs/senior-fullstack-developer",
              detailUrl: "/assignment/1234",
              fullAssignmentUrl: "https://consultancy.se/assignment/1234",
              published: "2024-01-15T09:00:00Z",
              salary: "60000-80000 SEK",
              type: "permanent",
              description: "We are looking for a senior developer...",
              duration: "Permanent"
            },
            {
              id: "2", 
              title: "Data Scientist",
              company: "AI Solutions",
              location: "Gothenburg",
              url: "/jobs/data-scientist-2",
              fullUrl: "https://consultancy.se/jobs/data-scientist-2",
              detailUrl: "/assignment/5678",
              fullAssignmentUrl: "https://consultancy.se/assignment/5678",
              published: "2024-01-14T14:30:00Z",
              salary: "55000-75000 SEK",
              type: "contract",
              description: "Join our data science team...",
              duration: "6 months"
            }
          ],
          pagination: {
            total: 25,
            page: 1,
            pages: 3,
            hasNext: true
          },
          metadata: {
            timestamp: new Date().toISOString(),
            count: 2
          }
        }
      };

      const urls = config.discovery.config.api?.responseMapping.urlPath 
        ? extractUrlsFromPath(mockResponse, config.discovery.config.api.responseMapping.urlPath)
        : [];

      setRawResponse(mockResponse);
      setTestResults({
        success: true,
        urls,
        rawResponse: mockResponse,
        duration: 2000,
        timestamp: new Date()
      });
    } catch (error) {
      setTestResults({
        success: false,
        urls: [],
        rawResponse: null,
        errors: [(error as Error).message],
        duration: 2000,
        timestamp: new Date()
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Only show this section if API technique is selected
  if (config.discovery.technique !== 'api') {
    return null;
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TestTube2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Test API & Select Job URLs</h3>
        </div>
        
        <button
          onClick={runTest}
          disabled={isRunning || !config.discovery.config.api?.endpoint}
          className={cn(
            "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
            isRunning || !config.discovery.config.api?.endpoint
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isRunning ? (
            <>
              <span className="animate-spin">⚪</span>
              Testing...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Test API
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <p className="text-sm text-gray-600">
          <strong>Step 1:</strong> Test your API to see the JSON response.<br/>
          <strong>Step 2:</strong> Click on any URL field in the response below to set it as your job URL path.
        </p>

        {!config.discovery.config.api?.endpoint ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Configure API endpoint first</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Please fill in the API endpoint above before testing.
            </p>
          </div>
        ) : testResults && (
          <div className="space-y-4">
            {testResults.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Test successful!</span>
                  <span className="text-sm text-gray-600">
                    Found {getCurrentUrls().length} job URLs
                  </span>
                </div>

                {/* API Response - moved up for better UX */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">API Response</span>
                    <span className="text-xs text-gray-500">(Click on URL fields to select them)</span>
                  </div>
                  <div className="bg-white border rounded-lg p-4 font-mono text-xs max-h-96 overflow-auto">
                    {rawResponse && (
                      <div>
                        {Object.entries(rawResponse).map(([key, value]) => (
                          <div key={key}>
                            {renderJsonValue(value, `$.${key}`, key)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Current URL Path Selection */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">URL Path (JSONPath):</span>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={config.discovery.config.api?.responseMapping.urlPath || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        discovery: {
                          ...config.discovery,
                          config: {
                            ...config.discovery.config,
                            api: {
                              ...config.discovery.config.api,
                              endpoint: config.discovery.config.api?.endpoint || "",
                              method: config.discovery.config.api?.method || "GET",
                              headers: config.discovery.config.api?.headers || {},
                              auth: config.discovery.config.api?.auth || { type: "none" },
                              pagination: config.discovery.config.api?.pagination || { type: "none" },
                              responseMapping: {
                                urlPath: e.target.value
                              }
                            }
                          }
                        }
                      })}
                      placeholder="Click URL fields in the API response above to auto-fill this path"
                      className="w-full px-3 py-2 border border-blue-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    
                    {config.discovery.config.api?.responseMapping.urlPath && (
                      <div className="text-sm text-blue-700">
                        Will extract <strong>{getCurrentUrls().length} URLs</strong> from the API response
                      </div>
                    )}
                    
                    {!config.discovery.config.api?.responseMapping.urlPath && (
                      <div className="text-xs text-blue-600">
                        💡 Tip: Click on any URL field in the JSON response above to auto-fill this path
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample URLs extracted */}
                {(() => {
                  const currentUrls = getCurrentUrls();
                  return currentUrls.length > 0 && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Sample URLs found:</span>
                        </div>
                        <div className="space-y-1">
                          {currentUrls.slice(0, 3).map((url: string, index: number) => (
                            <div key={index} className="text-sm font-mono text-green-800 break-all">
                              {url}
                            </div>
                          ))}
                          {currentUrls.length > 3 && (
                            <div className="text-sm text-green-700">
                              ... and {currentUrls.length - 3} more URLs
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Base URL Setting - moved here for better UX */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Base URL for Relative URLs</span>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          If sample URLs above look incomplete (e.g., "/jobs/123"), provide the base URL to complete them:
                        </p>
                        <input
                          type="url"
                          value={config.discovery.config.api?.baseUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            discovery: {
                              ...config.discovery,
                              config: {
                                ...config.discovery.config,
                                api: {
                                  ...config.discovery.config.api,
                                  endpoint: config.discovery.config.api?.endpoint || "",
                                  method: config.discovery.config.api?.method || "GET",
                                  headers: config.discovery.config.api?.headers || {},
                                  auth: config.discovery.config.api?.auth || { type: "none" },
                                  pagination: config.discovery.config.api?.pagination || { type: "none" },
                                  responseMapping: config.discovery.config.api?.responseMapping || { urlPath: "" },
                                  baseUrl: e.target.value
                                }
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="https://example.com"
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          💡 Example: "/jobs/123" + "https://example.com" = "https://example.com/jobs/123"
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Test failed</span>
                </div>
                {testResults.errors?.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 rounded p-2">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}