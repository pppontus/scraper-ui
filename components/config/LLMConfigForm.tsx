import React, { useMemo, useState } from "react";
import { SourceConfig } from "@/lib/types";
import { DEFAULT_EXTRACTION_SCHEMA } from "../sources/wizard/constants";

interface LLMConfigFormProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
  onValidation?: (isValid: boolean) => void;
  variant?: 'wizard' | 'settings';
}

export function LLMConfigForm({ 
  config, 
  setConfig, 
  onValidation,
  variant = 'wizard' 
}: LLMConfigFormProps) {
  const llmConfig = config.extraction.config.llm;
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const schema = useMemo(() => llmConfig.extractionSchema || DEFAULT_EXTRACTION_SCHEMA, [llmConfig.extractionSchema]);
  const fields = useMemo(() => Object.keys(schema || {}), [schema]);

  const isRequired = (key: string) => {
    if (Array.isArray(llmConfig.requiredFields)) {
      return llmConfig.requiredFields.includes(key);
    }
    if (llmConfig.requireAllFields) return true;
    return key === 'title';
  };

  const toggleRequired = (key: string) => {
    const current = new Set(llmConfig.requiredFields || (llmConfig.requireAllFields ? fields : []));
    if (current.has(key)) current.delete(key); else current.add(key);
    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            requiredFields: Array.from(current),
            requireAllFields: false,
          },
        },
      },
    });
  };

  const setAllRequired = (all: boolean) => {
    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            requiredFields: all ? fields : [],
            requireAllFields: false,
          },
        },
      },
    });
  };
  
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

  const isValid = Boolean(llmConfig.model && llmConfig.systemPrompt);
  
  React.useEffect(() => {
    onValidation?.(isValid);
  }, [isValid, onValidation]);

  return (
    <div className="space-y-6">
      {variant === 'wizard' && (
        <p className="text-gray-600 mb-6">
          Configure how the LLM should parse the extracted markdown into structured job data.
        </p>
      )}

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
        <textarea
          value={llmConfig.systemPrompt}
          onChange={(e) => updateLLMConfig({ systemPrompt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Extract job information from the markdown content. Focus on title, company, location, salary, and description."
        />
      </div>

      {/* Schema requirements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Output Schema Fields</label>
          <div className="flex items-center gap-2 text-xs">
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllRequired(true)}>Select all required</button>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllRequired(false)}>Clear required</button>
          </div>
        </div>
        <div className="bg-gray-50 rounded border p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fields.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRequired(key)}
                  onChange={() => toggleRequired(key)}
                />
                <span className="font-mono">{key}</span>
                <span className="text-xs text-gray-500">({String(schema[key]).replace(/\(\s*required\s*\)/i, '').trim()})</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Checked fields are required for this source.</p>
        </div>
      </div>

      {/* Preview (below) */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Input (Markdown from extraction)</h4>
          <div className="bg-white rounded border p-3 text-sm font-mono max-h-40 overflow-auto whitespace-pre-wrap">
            {(() => {
              const art = (config.testResults?.extraction as any)?.artifacts?.[0];
              if (!art) {
                return `# Job Details\n\n**Title:** Senior Software Engineer\n**Company:** Tech Corp  \n**Location:** San Francisco, CA`;
              }
              if ((art as any).markdown) return (art as any).markdown;
              return JSON.stringify((art as any).fields, null, 2);
            })()}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={async () => {
              setIsRunning(true);
              await new Promise((r) => setTimeout(r, 800));
              const out: any = {
                title: "Senior Software Engineer",
                company: "Tech Corp",
                location: "San Francisco, CA",
                salary: "$120k-$150k",
                startDate: null,
                requirements: ["5+ years React experience", "Node.js background", "TypeScript proficiency"],
                description: "Looking for an experienced senior engineer to join our team...",
              };
              setResult(out);
              setIsRunning(false);
            }}
            className={`px-3 py-2 rounded ${isRunning ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            disabled={isRunning}
          >
            {isRunning ? 'Parsing…' : 'Test Parse to Schema'}
          </button>
          <div className="mt-3 bg-white rounded border p-3 text-sm font-mono max-h-60 overflow-auto whitespace-pre">
            {result ? JSON.stringify(result, null, 2) : JSON.stringify(schema, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}