import React, { useState } from "react";
import { SourceConfig } from "@/lib/types";
import { DEFAULT_EXTRACTION_SCHEMA } from "../constants";

interface StepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function LLMStep({ config, setConfig }: StepProps) {
  const llmConfig = config.extraction.config.llm;
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  
  const updateLLMConfig = (updates: any) => {
    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            ...updates
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="h-5 w-5 text-blue-600">🤖</div>
          <h2 className="text-lg font-semibold text-gray-900">LLM Parsing</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]">
          {/* Configuration Panel */}
          <div className="p-6 border-r">
            <p className="text-gray-600 mb-6">
              Configure how the LLM should parse the extracted markdown into structured job data.
            </p>
            
            {/* Model Selection */}
            <div className="mb-6">
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
                <optgroup label="Anthropic Claude">
                  <option value="claude-3-haiku">Claude 3 Haiku ($0.25 / $1.25)</option>
                  <option value="claude-3-sonnet">Claude 3.5 Sonnet ($3.00 / $15.00)</option>
                </optgroup>
              </select>
            </div>
            
            {/* System Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={llmConfig.systemPrompt}
                onChange={(e) => updateLLMConfig({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Extract job information from the markdown content. Focus on title, company, location, salary, and description."
              />
            </div>
            
            {/* Output Schema */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Schema
              </label>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                {JSON.stringify({
                  title: "string (required)",
                  company: "string (required)", 
                  location: "string",
                  salary: "string",
                  startDate: "ISO date string",
                  requirements: "array of strings",
                  description: "string"
                }, null, 2)}
              </div>
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className="p-6 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
            
            {/* Input Markdown */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Input (Markdown from extraction)</h4>
              <div className="bg-white rounded border p-3 text-sm font-mono max-h-40 overflow-auto">
{(() => {
  const art = config.testResults?.extraction?.artifacts?.[0];
  if (!art) {
    return `# Job Details\n\n**Title:** Senior Software Engineer\n**Company:** Tech Corp  \n**Location:** San Francisco, CA`;
  }
  if (art.markdown) return art.markdown;
  return JSON.stringify(art.fields, null, 2);
})()}
              </div>
            </div>
            
            {/* Parse to schema */}
            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  setIsRunning(true);
                  await new Promise((r) => setTimeout(r, 800));
                  // Mock response resembling schema
                  setResult({
                    title: "Senior Software Engineer",
                    company: "Tech Corp",
                    location: "San Francisco, CA",
                    salary: "$120k-$150k",
                    startDate: null,
                    requirements: [
                      "5+ years React experience",
                      "Node.js background",
                      "TypeScript proficiency",
                    ],
                    description: "Looking for an experienced senior engineer to join our team...",
                  });
                  setIsRunning(false);
                }}
                className={`px-3 py-2 rounded ${isRunning ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                disabled={isRunning}
              >
                {isRunning ? 'Parsing…' : 'Test Parse to Schema'}
              </button>
              <div className="mt-3 bg-white rounded border p-3 text-sm font-mono max-h-60 overflow-auto">
                {result ? JSON.stringify(result, null, 2) : JSON.stringify(DEFAULT_EXTRACTION_SCHEMA, null, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SaveStep({ config, setConfig }: StepProps) {
  return (
    <div className="text-center py-8">
      Save Step - Coming next...
    </div>
  );
}

export function ScheduleStep({ config, setConfig }: StepProps) {
  return (
    <div className="text-center py-8">
      Schedule Step - Coming next...
    </div>
  );
}

export function ReviewStep({ config }: { config: SourceConfig }) {
  return (
    <div className="text-center py-8">
      Review Step - Coming next...
    </div>
  );
}
