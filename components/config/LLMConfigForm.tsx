import React, { useMemo, useState } from "react";
import { SourceConfig } from "@/lib/types";
import mockData from "@/lib/mock-data.json";
import { DEFAULT_EXTRACTION_SCHEMA, FULL_JOB_SCHEMA, SchemaFieldConfig, SYSTEM_DATABASE_FIELDS } from "../sources/wizard/constants";

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showDbFields, setShowDbFields] = useState<boolean>(false);

  // LLM models from mock data (single source of truth)
  const llmModels: { id: string; label?: string; name?: string }[] =
    (mockData as any)?.settings?.llmModels || [
      { id: "gpt-4o", label: "GPT-4o ($2.50/$10.00)" },
      { id: "gpt-4o-mini", label: "GPT-4o-mini ($0.15/$0.60)" },
      { id: "claude-3-haiku", label: "Claude 3 Haiku ($0.25/$1.25)" },
      { id: "claude-3-sonnet", label: "Claude 3.5 Sonnet ($3.00/$15.00)" },
    ];

  // Use enhanced schema config or fallback to FULL_JOB_SCHEMA
  const schemaConfig = useMemo(() => 
    llmConfig.schemaConfig || FULL_JOB_SCHEMA, 
    [llmConfig.schemaConfig]
  );
  
  // Exclude system-managed URL from LLM schema table; shown in DB section below
  const fields = useMemo(() => Object.keys(schemaConfig).filter(k => k !== 'detailsLink'), [schemaConfig]);

  const updateFieldConfig = (fieldKey: string, updates: Partial<SchemaFieldConfig>) => {
    const updatedSchemaConfig = {
      ...schemaConfig,
      [fieldKey]: {
        ...schemaConfig[fieldKey],
        ...updates
      }
    };

    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            schemaConfig: updatedSchemaConfig
          },
        },
      },
    });
  };

  const setAllUsed = (used: boolean) => {
    const updatedSchemaConfig = Object.keys(schemaConfig).reduce((acc, key) => ({
      ...acc,
      [key]: { ...schemaConfig[key], used }
    }), {});

    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            schemaConfig: updatedSchemaConfig
          },
        },
      },
    });
  };

  const setAllMandatory = (mandatory: boolean) => {
    const updatedSchemaConfig = Object.keys(schemaConfig).reduce((acc, key) => ({
      ...acc,
      [key]: { ...schemaConfig[key], mandatory: schemaConfig[key].used ? mandatory : false }
    }), {});

    setConfig({
      ...config,
      extraction: {
        ...config.extraction,
        config: {
          ...config.extraction.config,
          llm: {
            ...llmConfig,
            schemaConfig: updatedSchemaConfig
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
          {llmModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label || m.name || m.id}
            </option>
          ))}
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

      {/* Enhanced Schema Configuration */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Output Schema Fields</label>
          <div className="flex items-center gap-2 text-xs">
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllUsed(true)}>Select all</button>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllUsed(false)}>Clear all</button>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllMandatory(true)}>All mandatory</button>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setAllMandatory(false)}>None mandatory</button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded border p-3 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-4">Used</th>
                <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-4">Req</th>
                <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-32">Field</th>
                <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-20">Type</th>
                <th className="text-left py-2 px-2 font-medium text-sm text-gray-700">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((key) => {
                const fieldConfig = schemaConfig[key];
                return (
                  <tr key={key} className="border-b border-gray-200 hover:bg-white">
                    <td className="py-2 px-2">
                      <input
                        type="checkbox"
                        checked={fieldConfig.used}
                        onChange={(e) => updateFieldConfig(key, { used: e.target.checked, mandatory: e.target.checked ? fieldConfig.mandatory : false })}
                        className="rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="checkbox"
                        checked={fieldConfig.mandatory && fieldConfig.used}
                        disabled={!fieldConfig.used}
                        onChange={(e) => updateFieldConfig(key, { mandatory: e.target.checked })}
                        className="rounded"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-medium text-sm text-gray-900">{key}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-mono text-xs text-gray-600">{fieldConfig.dataType}</span>
                    </td>
                    <td className="py-2 px-2">
                      <textarea
                        value={fieldConfig.instructions}
                        onChange={(e) => updateFieldConfig(key, { instructions: e.target.value })}
                        onFocus={() => setFocusedField(key)}
                        onBlur={() => setFocusedField(null)}
                        disabled={!fieldConfig.used}
                        className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden ${
                          !fieldConfig.used ? 'bg-gray-100 text-gray-500' : 'bg-white'
                        }`}
                        rows={focusedField === key ? 3 : 1}
                        placeholder="Instructions for LLM extraction..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          <strong>Used:</strong> Include this field in the LLM output schema. 
          <strong>Mandatory:</strong> LLM must provide this field (validation will fail if missing).
        </p>
      </div>

      {/* Collapsible: System / Database Fields (hidden by default) */}
      <div className="border rounded bg-white">
        <button
          type="button"
          onClick={() => setShowDbFields(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-medium text-gray-700">Database Fields (auto-managed)</span>
          <span className="text-xs text-gray-500">{showDbFields ? 'Hide' : 'Show'}</span>
        </button>
        {showDbFields && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 mb-3">
              These fields are populated by the system (no LLM parsing). Includes the original job URL and operational metadata.
            </p>
            <div className="bg-gray-50 rounded border p-3 overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-40">Field</th>
                    <th className="text-left py-2 px-2 font-medium text-sm text-gray-700 w-48">Type</th>
                    <th className="text-left py-2 px-2 font-medium text-sm text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SYSTEM_DATABASE_FIELDS).map(([key, def]) => (
                    <tr key={key} className="border-b border-gray-200 hover:bg-white">
                      <td className="py-2 px-2 font-medium text-sm text-gray-900">{key}</td>
                      <td className="py-2 px-2 font-mono text-xs text-gray-600">{def.dataType}</td>
                      <td className="py-2 px-2 text-sm text-gray-700">{def.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
            {result ? JSON.stringify(result, null, 2) : 
              JSON.stringify(
                Object.keys(schemaConfig)
                  .filter(key => schemaConfig[key].used)
                  .reduce((acc, key) => ({ 
                    ...acc, 
                    [key]: `${schemaConfig[key].dataType}${schemaConfig[key].mandatory ? ' (required)' : ''}` 
                  }), {}), 
                null, 2
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
