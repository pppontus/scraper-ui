"use client";

import React, { useMemo, useState } from "react";
import { Network, TestTube2, Database, FileText, Trash2, PlusCircle } from "lucide-react";
import { cn, parseCurl } from "@/lib/utils";

export function ApiFieldPicker({ config, setConfig }: any) {
  const [isRunning, setIsRunning] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [generatedMd, setGeneratedMd] = useState<string>("");
  const extractionApi = config.extraction.config.api || {};

  const reuseDiscoveryApi = useMemo(() => config.discovery.technique === "api" && !!config.discovery.config.api, [config]);

  const onReuse = () => {
    if (reuseDiscoveryApi) {
      const d = config.discovery.config.api;
      setConfig({
        ...config,
        extraction: {
          ...config.extraction,
          technique: "api",
          config: {
            ...config.extraction.config,
            api: {
              endpoint: d.endpoint,
              method: d.method,
              headers: d.headers,
              auth: d.auth,
              baseUrl: d.baseUrl,
              responseFields: config.extraction.config.api?.responseFields || []
            }
          }
        }
      });
    }
  };

  const setApi = (updates: any) => {
    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          api: {
            ...config.extraction.config.api,
            ...updates
          }
        }
      }
    });
  };

  const generateJsonPath = (obj: any, targetValue: any, currentPath = "$"): string | null => {
    if (obj === targetValue) return currentPath;
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = generateJsonPath(obj[i], targetValue, `${currentPath}[${i}]`);
        if (result) return result.replace(/\[\d+\]/g, "[*]");
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        const result = generateJsonPath(obj[key], targetValue, currentPath === "$" ? `$.${key}` : `${currentPath}.${key}`);
        if (result) return result;
      }
    }
    return null;
  };

  const extractValueFromPath = (data: any, jsonPath: string): any => {
    try {
      const parts = jsonPath.replace("$", "").split(".").filter(Boolean);
      let current: any = data;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes("[*]")) {
          const key = part.replace("[*]", "");
          current = current?.[key];
          if (!Array.isArray(current) || current.length === 0) return undefined;
          // If more parts remain, walk into first element
          current = current[0];
        } else {
          current = current?.[part];
        }
      }
      return current;
    } catch {
      return undefined;
    }
  };

  const runTest = async () => {
    if (!extractionApi.endpoint) {
      alert("Please configure the API endpoint first");
      return;
    }
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 1000));
    // Mock a response similar to discovery
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
            published: "2024-01-15T09:00:00Z",
            salary: "60000-80000 SEK",
            type: "permanent",
            description: "We are looking for a senior developer...",
          },
          {
            id: "2",
            title: "Data Scientist",
            company: "AI Solutions",
            location: "Gothenburg",
            url: "/jobs/data-scientist-2",
            published: "2024-01-14T14:30:00Z",
            salary: "55000-75000 SEK",
            type: "contract",
            description: "Join our data science team...",
          },
        ],
        page: 1,
        pages: 3,
      },
    };
    setRawResponse(mockResponse);
    setIsRunning(false);
  };

  const addFieldSelection = (key: string, path: string) => {
    const existing = extractionApi.responseFields || [];
    if (existing.find((f: any) => f.path === path)) return; // avoid duplicates
    setApi({ responseFields: [...existing, { key, path }] });
  };

  const removeFieldSelection = (path: string) => {
    const existing = extractionApi.responseFields || [];
    setApi({ responseFields: existing.filter((f: any) => f.path !== path) });
  };

  const getKeyFromPath = (path: string): string => {
    // Derive a reasonable key from the last property in the path
    const noIndex = path.replace(/\[\*\]|\[\d+\]/g, "");
    const parts = noIndex.split(".").filter(Boolean);
    const last = parts[parts.length - 1] || "field";
    return last.replace(/^\$\/?/, "") || "field";
  };

  const renderValue = (value: any, path: string, key?: string) => {
    const isPrimitive = typeof value !== "object" || value === null;
    const wildcardPath = path.replace(/\[\d+\]/g, "[*]");

    return (
      <div className="flex items-start gap-2">
        {key && (
          <div className="flex items-center gap-1">
            <span
              title={isPrimitive ? "Click to select this field" : "Add this path"}
              className={cn(
                "mr-1",
                isPrimitive ? "text-blue-700 cursor-pointer hover:underline" : "text-gray-700"
              )}
              onClick={() => {
                if (isPrimitive) {
                  addFieldSelection(key, wildcardPath);
                } else {
                  // For arrays/objects, allow adding the container path (e.g., $.data.jobs[*])
                  addFieldSelection(key, wildcardPath);
                }
              }}
            >
              "{key}":
            </span>
            {!isPrimitive && (
              <button
                type="button"
                title="Select this path"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => addFieldSelection(key, wildcardPath)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        <span
          className={cn("text-green-700 text-xs break-all", isPrimitive && "cursor-pointer")}
          title={isPrimitive ? "Click to select this field" : undefined}
          onClick={() => {
            if (!isPrimitive) return;
            const derivedKey = key || getKeyFromPath(path);
            addFieldSelection(derivedKey, wildcardPath);
          }}
        >
          {JSON.stringify(value)}
        </span>
      </div>
    );
  };

  const renderJson = (val: any, path: string): JSX.Element => {
    if (Array.isArray(val)) {
      return (
        <div className="ml-4">
          <span className="text-gray-600">[</span>
          {val.slice(0, 3).map((item, i) => (
            <div key={i} className="ml-4">
              {renderJson(item, `${path}[${i}]`)}
            </div>
          ))}
          {val.length > 3 && <div className="ml-4 text-gray-500">... {val.length - 3} more</div>}
          <span className="text-gray-600">]</span>
        </div>
      );
    }
    if (typeof val === "object" && val !== null) {
      return (
        <div className="ml-4">
          <span className="text-gray-600">{"{"}</span>
          {Object.entries(val).map(([k, v], idx, arr) => (
            <div key={k} className="ml-4">
              {renderValue(v, `${path}.${k}`, k)}
              {idx < arr.length - 1 && <span className="text-gray-600">,</span>}
            </div>
          ))}
          <span className="text-gray-600">{"}"}</span>
        </div>
      );
    }
    return renderValue(val, path);
  };

  const markdownPreview = useMemo(() => {
    if (!rawResponse || !extractionApi.responseFields?.length) return "";
    const lines: string[] = [];
    lines.push(`# Job Details (Selected Fields)`);
    extractionApi.responseFields.forEach((f: any) => {
      const val = extractValueFromPath(rawResponse, f.path);
      const printVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      lines.push(`- ${f.key}: ${printVal}`);
    });
    return lines.join("\n");
  }, [rawResponse, extractionApi.responseFields]);

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Network className="h-4 w-4 text-purple-600" />
          <span className="font-medium text-purple-900">API Extraction</span>
        </div>
        <p className="text-sm text-purple-700">Reuse discovery API settings or paste a cURL to configure extraction.</p>
      </div>

      {reuseDiscoveryApi && (
        <button
          type="button"
          onClick={onReuse}
          className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50"
        >
          Reuse discovery API configuration
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
          <input
            type="url"
            value={extractionApi.endpoint || ""}
            onChange={(e) => setApi({ endpoint: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="https://api.example.com/jobs"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select
            value={extractionApi.method || "GET"}
            onChange={(e) => setApi({ method: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>

      {/* cURL import */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste cURL (optional)</label>
        <textarea
          rows={3}
          placeholder={`curl 'https://api.example.com/jobs' -H 'accept: application/json'`}
          className="w-full px-3 py-2 border rounded font-mono text-xs"
          onChange={(e) => {
            const parsed = parseCurl(e.target.value);
            if (parsed) {
              setApi({
                endpoint: parsed.url,
                method: parsed.method,
                headers: parsed.headers || {},
              });
            }
          }}
        />
      </div>

      {/* Headers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
        <textarea
          className="w-full px-3 py-2 border rounded font-mono text-xs"
          rows={3}
          value={Object.entries(extractionApi.headers || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")}
          onChange={(e) => {
            const headers: Record<string, string> = {};
            e.target.value.split("\n").forEach((line) => {
              const [k, ...rest] = line.split(":");
              if (k?.trim() && rest.length) headers[k.trim()] = rest.join(":").trim();
            });
            setApi({ headers });
          }}
          placeholder={`Accept: application/json\nUser-Agent: MyBot/1.0`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Click any field in the response to add it as a selected extraction field.
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={isRunning || !extractionApi.endpoint}
          className={cn(
            "px-4 py-2 rounded flex items-center gap-2",
            isRunning || !extractionApi.endpoint ? "bg-gray-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <TestTube2 className="h-4 w-4" />
          {isRunning ? "Testing..." : "Test API"}
        </button>
      </div>

      {/* Response & selection */}
      {rawResponse && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">API Response (click a field name to select)</span>
            </div>
            <div className="bg-white border rounded p-3 font-mono text-xs max-h-96 overflow-auto">
              {Object.entries(rawResponse).map(([k, v]) => (
                <div key={k}>{renderJson(v, `$.${k}`)}</div>
              ))}
            </div>
          </div>

          {/* Selected fields */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-700" />
              <span className="font-medium text-blue-900">Selected Fields</span>
            </div>
            {(extractionApi.responseFields || []).length === 0 ? (
              <div className="text-sm text-blue-800">No fields selected yet</div>
            ) : (
              <div className="space-y-2">
                {(extractionApi.responseFields || []).map((f: any) => (
                  <div key={f.path} className="flex items-center gap-2">
                    <input
                      value={f.key}
                      onChange={(e) => {
                        const updated = (extractionApi.responseFields || []).map((x: any) =>
                          x.path === f.path ? { ...x, key: e.target.value } : x
                        );
                        setApi({ responseFields: updated });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <span className="font-mono text-xs text-blue-900">{f.path}</span>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => removeFieldSelection(f.path)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Markdown preview from selected fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Markdown Preview</span>
              </div>
              <button
                type="button"
                className={cn(
                  "px-3 py-1.5 text-sm rounded",
                  !rawResponse || !(extractionApi.responseFields || []).length
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => setGeneratedMd(markdownPreview)}
                disabled={!rawResponse || !(extractionApi.responseFields || []).length}
              >
                Generate Markdown Preview
              </button>
            </div>
            <div className="bg-white border rounded p-3 font-mono text-xs max-h-60 overflow-auto whitespace-pre-wrap">
              {generatedMd || "Select fields above, test the API, then click \"Generate Markdown Preview\""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
