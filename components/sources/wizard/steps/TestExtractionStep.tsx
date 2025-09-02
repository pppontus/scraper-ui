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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockResults = {
      success: true,
      samples: selectedUrls.slice(0, 3).map((url, index) => ({
        url,
        data: {
          title: `Senior ${index === 0 ? 'Frontend' : index === 1 ? 'Backend' : 'Full Stack'} Developer`,
          company: index === 0 ? 'TechCorp AB' : index === 1 ? 'DevStudio' : 'StartupXYZ',
          location: 'Stockholm, Sweden',
          description: `Exciting opportunity for a ${index === 0 ? 'frontend' : index === 1 ? 'backend' : 'full stack'} developer to join our growing team. We offer competitive salary, flexible working hours, and great benefits.`,
          requirements: [
            `5+ years ${index === 0 ? 'React' : index === 1 ? 'Node.js' : 'JavaScript'} experience`,
            'Strong problem-solving skills',
            'Team player with good communication'
          ],
          salary: index === 0 ? '45000-55000 SEK' : index === 1 ? '50000-60000 SEK' : '40000-50000 SEK',
          deadline: '2024-09-30'
        },
        errors: []
      })),
      duration: 3000,
      timestamp: new Date(),
      fieldCompleteness: {
        title: 1.0,
        company: 1.0,
        location: 1.0,
        description: 1.0,
        requirements: 0.8,
        salary: 0.6,
        deadline: 0.4
      }
    };
    
    setConfig({
      ...config,
      testResults: {
        ...config.testResults,
        extraction: mockResults
      }
    });
    
    setIsRunning(false);
  };
  
  const handleUrlToggle = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
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
          Select URLs from your discovery test to validate data extraction.
        </p>
        
        {!testResults && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Test Required
                </span>
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
                        <p className="text-xs text-blue-600 hover:text-blue-800 truncate">
                          {url}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {metadata?.date}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {testResults && (
          <div className="space-y-4">
            <div className={cn(
              "border rounded-lg p-4",
              testResults.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {testResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  testResults.success ? "text-green-800" : "text-red-800"
                )}>
                  {testResults.success ? "Extraction Successful" : "Extraction Failed"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Samples:</span>
                  <div className="font-medium">{testResults.samples.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <div className="font-medium">{testResults.duration}ms</div>
                </div>
                <div>
                  <span className="text-gray-600">Avg Fields:</span>
                  <div className="font-medium">
                    {Math.round(Object.values(testResults.fieldCompleteness).reduce((a: number, b: number) => a + b, 0) / Object.keys(testResults.fieldCompleteness).length * 100)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <div className="font-medium">{new Date(testResults.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
            
            {/* Field Completeness */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Field Completeness</h3>
              <div className="space-y-2">
                {Object.entries(testResults.fieldCompleteness).map(([field, completeness]) => (
                  <div key={field} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-24 capitalize">{field}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          completeness >= 0.8 ? "bg-green-500" :
                          completeness >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${completeness * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {Math.round(completeness * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sample Results */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Extracted Samples</h3>
                <p className="text-sm text-gray-600">Preview of extracted job data</p>
              </div>
              <div className="divide-y divide-gray-100">
                {testResults.samples.map((sample: any, index: number) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{sample.data.title}</h4>
                      <span className="text-xs text-gray-500">{sample.data.company}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <div className="font-medium">{sample.data.location || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Salary:</span>
                        <div className="font-medium">{sample.data.salary || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Requirements:</span>
                        <div className="font-medium">{sample.data.requirements?.length || 0} items</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <div className="font-medium">{sample.data.deadline || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-gray-600">Description:</span>
                      <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                        {sample.data.description}
                      </p>
                    </div>
                    
                    <p className="text-xs text-blue-600 hover:text-blue-800 mt-2 truncate">
                      <a href={sample.url} target="_blank" rel="noopener noreferrer">
                        {sample.url}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}