import React, { useState } from "react";
import { Eye, PlayCircle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";

interface TestExtractionStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function TestExtractionStep({ config, setConfig }: TestExtractionStepProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const discoveredUrls = config.testResults?.discovery?.urls || [];
  const testResults = config.testResults?.extraction;

  const runTest = async () => {
    setIsRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const artifacts = selectedUrls.slice(0, 3).map((url) => {
      if (config.extraction.technique === "api") {
        const fields = Object.fromEntries(
          (config.extraction.config.api?.responseFields || []).map((f: any) => [
            f.key,
            `<value from ${f.path}>`,
          ])
        );
        const request = `curl -X ${config.extraction.config.api?.method || "GET"} '${
          config.extraction.config.api?.endpoint || "https://api.example.com/jobs"
        }'`;
        return {
          url,
          request,
          responsePreview: `HTTP 200 • JSON body with ${Object.keys(fields).length} selected fields`,
          fields,
        };
      } else {
        const request = `GET ${url}`;
        const markdown = `# Job Details\n\nURL: ${url}\n\n**Title:** Example Title\n**Company:** Example Company\n\n## Description\nRendered content from main content area...`;
        return {
          url,
          request,
          responsePreview: `HTTP 200 • 25KB HTML • rendered 2.1s`,
          markdown,
        };
      }
    });

    setConfig({
      ...config,
      testResults: {
        ...config.testResults,
        extraction: {
          success: true,
          artifacts,
          duration: 1200,
          timestamp: new Date(),
        },
      },
    });
    setIsRunning(false);
  };

  const handleUrlToggle = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  if (!config.testResults?.discovery) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Discovery Test Required</h3>
            <p className="text-gray-600">
              Please complete the Discovery test first to get URLs for extraction testing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Test Extraction</h2>
          </div>

          <button
            onClick={runTest}
            disabled={isRunning || selectedUrls.length === 0}
            className={cn(
              "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
              isRunning || selectedUrls.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Test Selected ({selectedUrls.length})
              </>
            )}
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Select URLs from your discovery test to fetch detail pages (HTML/JS) or relevant API fields (API).
        </p>

        {!testResults && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Test Required</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Select some URLs and run extraction test to validate your configuration.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Select URLs to Test</h3>
                <p className="text-sm text-gray-600">Choose 2-5 URLs from your discovery results</p>
              </div>
              <div className="divide-y divide-gray-100">
                {discoveredUrls.slice(0, 10).map((url, index) => {
                  const metadata = config.testResults?.discovery?.metadata?.[index];
                  return (
                    <label key={url} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUrls.includes(url)}
                        onChange={() => handleUrlToggle(url)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {metadata?.title || `Job ${index + 1}`}
                        </p>
                        <p className="text-xs text-blue-600 hover:text-blue-800 truncate">{url}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{metadata?.date}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {testResults && (
          <div className="space-y-4">
            <div
              className={cn(
                "border rounded-lg p-4",
                testResults.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    testResults.success ? "text-green-800" : "text-red-800"
                  )}
                >
                  Extraction {testResults.success ? "Successful" : "Failed"}
                </span>
                <span className="text-xs text-gray-600 ml-auto">
                  {new Date(testResults.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {testResults.artifacts.map((a, i) => (
                <div key={i} className="border rounded p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate">{a.url}</div>
                    <div className="text-xs text-gray-500">{a.responsePreview}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Request</div>
                      <div className="bg-gray-50 border rounded p-2 font-mono text-[11px] whitespace-pre-wrap break-all">{a.request}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Artifact</div>
                      {a.markdown ? (
                        <div className="bg-gray-50 border rounded p-2 font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-auto">{a.markdown}</div>
                      ) : (
                        <div className="bg-gray-50 border rounded p-2 font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-auto">{JSON.stringify(a.fields, null, 2)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
