import React, { useMemo, useState } from "react";
import { SourceConfig } from "@/lib/types";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTimestamp } from "@/lib/utils";
import { Calendar, Clock, FileText, List, Link as LinkIcon, ChevronDown, ChevronRight, Code, Table as TableIcon, Eye } from "lucide-react";
import { DEFAULT_EXTRACTION_SCHEMA } from "../constants";

interface StepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function LLMStep({ config, setConfig }: StepProps) {
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
    // Default: only 'title' is required unless explicitly changed
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="h-5 w-5 text-blue-600">🤖</div>
          <h2 className="text-lg font-semibold text-gray-900">LLM Parsing</h2>
        </div>
        {/* Single-column layout: settings then preview */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            Configure how the LLM should parse the extracted markdown into structured job data.
          </p>

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
                  // Mock response resembling schema
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
  const schedule = config.schedule;

  const updateSchedule = (updates: Partial<typeof schedule>) => {
    setConfig({
      ...config,
      schedule: {
        ...config.schedule,
        ...updates,
      },
    });
  };

  const updateDiscovery = (updates: Partial<typeof schedule.discovery>) => {
    updateSchedule({ discovery: { ...schedule.discovery, ...updates } });
  };


  const updateRateLimit = (updates: Partial<typeof schedule.rateLimit>) => {
    updateSchedule({ rateLimit: { ...schedule.rateLimit, ...updates } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Discovery Schedule</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={schedule.discovery.enabled}
              onChange={(e) => updateDiscovery({ enabled: e.target.checked, type: e.target.checked ? 'cron' : 'manual' })}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">Enable discovery scheduling</span>
          </label>

          {schedule.discovery.enabled ? (
            <div>
              <SimpleCronBuilder
                value={schedule.discovery.expression || ''}
                onChange={(expr) => updateDiscovery({ expression: expr, type: 'cron' })}
              />
              <p className="text-xs text-gray-500 mt-2">Timezone: Europe/Stockholm</p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Scheduling disabled — discovery runs manually.</div>
          )}
        </div>
      </div>

      {/** Extraction scheduling removed: extraction runs automatically for new jobs */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Rate Limit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max requests per minute</label>
            <input
              type="number"
              min={1}
              value={schedule.rateLimit.maxRequestsPerMinute}
              onChange={(e) => updateRateLimit({ maxRequestsPerMinute: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concurrency</label>
            <input
              type="number"
              min={1}
              value={schedule.rateLimit.concurrency}
              onChange={(e) => updateRateLimit({ concurrency: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">These limits apply per source when running discovery and extraction.</p>
      </div>
    </div>
  );
}


export function ReviewStep({ config }: { config: SourceConfig }) {
  const discoveryRes = config.testResults?.discovery;
  const extractionRes = config.testResults?.extraction;

  const jobs = useMemo(() => {
    const discovered: Array<{ url: string; id?: string; title?: string; date?: string }> = [];
    if (discoveryRes?.metadata?.length) {
      for (const m of discoveryRes.metadata) {
        if (m?.url) discovered.push({ url: m.url, id: m.id, title: m.title, date: m.date });
      }
    } else if (discoveryRes?.urls?.length) {
      for (const u of discoveryRes.urls) discovered.push({ url: u });
    }

    const extracted = new Map<string, (typeof extractionRes extends any ? any : never)>();
    if (extractionRes?.artifacts?.length) {
      for (const art of extractionRes.artifacts as any[]) {
        if (art?.url) extracted.set(art.url, art);
      }
    }

    return discovered.map((d) => ({
      ...d,
      extracted: extracted.get(d.url) || null,
    }));
  }, [discoveryRes, extractionRes]);

  const jobsFound = discoveryRes?.urls?.length || discoveryRes?.metadata?.length || 0;
  const extractedCount = extractionRes?.artifacts?.length || 0;
  const discoveryDuration = discoveryRes?.duration ?? null;
  const extractionDuration = extractionRes?.duration ?? null;

  const [limit, setLimit] = useState(10);
  const displayed = jobs.slice(0, limit);

  const humanizeSchedule = () => {
    const tz = "Europe/Stockholm"; // aligns with constants
    if (!config.schedule?.discovery?.enabled) return `Manual: run on demand`;
    const expr = config.schedule.discovery.expression || "";
    if (!expr) return `Manual: run on demand`;
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return `Custom schedule (${expr})`;
    const [m, h, , , dow] = parts;

    let freq = "";
    if (/^\*\/\d+$/.test(m)) {
      freq = `Every ${m.split('/')[1]} minutes`;
    } else if (m === '0' && /\/2$/.test(h)) {
      freq = `Every 2 hours`;
    } else if (m === '0') {
      freq = `Hourly`;
    } else {
      freq = `Custom`;
    }

    let startHour = 0, endHour = 23;
    const hrMatch = h.match(/^(\d{1,2})(?:-(\d{1,2}))(?:\/\d+)?$/);
    if (hrMatch) {
      startHour = Math.max(0, Math.min(23, parseInt(hrMatch[1] || '0', 10)));
      endHour = Math.max(0, Math.min(23, parseInt(hrMatch[2] || hrMatch[1] || '23', 10)));
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const hourPart = `between ${pad(startHour)}:00–${pad(endHour)}:00`;

    const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    let daysPart = '';
    if (dow === '*' || dow === '*/1') {
      daysPart = 'Mon–Sun';
    } else {
      const nums = dow.split(',').map((t) => {
        const n = parseInt(t, 10);
        return isNaN(n) ? null : (n === 0 ? 7 : n);
      }).filter((n): n is number => n !== null).sort((a,b)=>a-b);
      const range = (arr: number[]) => {
        const out: string[] = [];
        let i = 0;
        while (i < arr.length) {
          const start = arr[i];
          let j = i;
          while (j + 1 < arr.length && arr[j + 1] === arr[j] + 1) j++;
          const end = arr[j];
          if (start === end) out.push(dayNames[start-1]);
          else out.push(`${dayNames[start-1]}–${dayNames[end-1]}`);
          i = j + 1;
        }
        return out.join(', ');
      };
      daysPart = range(nums);
    }

    return `${freq} ${hourPart} on ${daysPart} (Europe/Stockholm)`;
  };

  return (
    <div className="space-y-6">
      {/* Source summary */}
      <Card>
        <CardHeader>
          <CardTitle>Source Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="font-medium text-gray-900">{config.name || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Site URL</div>
              <a className="font-medium text-blue-700 hover:underline break-all" href={config.siteUrl || '#'} target="_blank" rel="noreferrer">
                {config.siteUrl || '—'}
              </a>
            </div>
            <div>
              <div className="text-gray-500">Discovery</div>
              <div className="font-medium text-gray-900">{config.discovery?.technique?.toUpperCase?.() || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Extraction</div>
              <div className="font-medium text-gray-900">{config.extraction?.technique?.toUpperCase?.() || '—'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-500">LLM Model</div>
              <div className="font-medium text-gray-900">{config.extraction?.config?.llm?.model || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Jobs Found" value={jobsFound} icon={List} color="blue" />
        <KpiCard title="Extracted" value={extractedCount} icon={FileText} color="green" />
        <KpiCard
          title="Duration"
          value={
            discoveryDuration != null || extractionDuration != null
              ? `${discoveryDuration ?? 0}s disc / ${extractionDuration ?? 0}s ext`
              : '—'
          }
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Schedule summary */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Schedule</CardTitle>
          <Calendar className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-gray-800">{humanizeSchedule()}</div>
          <div className="text-sm text-gray-500 mt-1">
            Rate limit: {config.schedule?.rateLimit?.maxRequestsPerMinute ?? 0} rpm · Concurrency: {config.schedule?.rateLimit?.concurrency ?? 1}
          </div>
        </CardContent>
      </Card>

      {/* Parsed structured results */}
      <ParsedResultsTable config={config} jobs={jobs as any} />

      {/* Found jobs + details */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Found Jobs and Details</CardTitle>
          <div className="text-sm text-gray-600">{jobs.length} total</div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-gray-500">No discovery results yet. Run discovery in the previous steps.</div>
          ) : (
            <div className="space-y-2">
              {displayed.map((job, idx) => (
                <JobRow key={`${job.url}-${idx}`} job={job as any} />
              ))}

              {limit < jobs.length && (
                <div className="pt-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                    onClick={() => setLimit((l) => Math.min(jobs.length, l + 10))}
                  >
                    Show 10 more ({jobs.length - limit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JobRow({ job }: { job: { url: string; id?: string; title?: string; date?: string; extracted?: any } }) {
  const [open, setOpen] = useState(false);
  const extracted = job.extracted;
  const hasJson = !!extracted?.fields && typeof extracted.fields === 'object';
  const hasMarkdown = !!extracted?.markdown && typeof extracted.markdown === 'string';

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="w-full flex items-start justify-between p-3 text-left hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-gray-500">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline break-all">
                {job.title || job.url}
              </a>
              <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="text-xs text-gray-600 mt-1 flex gap-3 flex-wrap">
              {job.id && <span>ID: {job.id}</span>}
              {job.date && <span>Date: {formatTimestamp(job.date)}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          {hasJson && (
            <span className="inline-flex items-center gap-1 px-2 py-1 border rounded">
              <Code className="h-3.5 w-3.5" /> JSON
            </span>
          )}
          {hasMarkdown && (
            <span className="inline-flex items-center gap-1 px-2 py-1 border rounded">
              <FileText className="h-3.5 w-3.5" /> Markdown
            </span>
          )}
          {!hasJson && !hasMarkdown && (
            <span className="inline-flex items-center gap-1 px-2 py-1 border rounded text-gray-500">No details</span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t p-3 bg-gray-50">
          {hasJson && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1">Extracted Fields (JSON)</div>
              <div className="bg-white rounded border p-3 text-sm font-mono whitespace-pre max-h-72 overflow-auto">
                {JSON.stringify(extracted.fields, null, 2)}
              </div>
            </div>
          )}

          {hasMarkdown && (
            <div className="mb-1">
              <div className="text-xs font-medium text-gray-700 mb-1">Markdown Preview</div>
              <div className="bg-white rounded border p-3 text-sm font-mono whitespace-pre-wrap max-h-72 overflow-auto">
                {extracted.markdown}
              </div>
            </div>
          )}

          {!hasJson && !hasMarkdown && (
            <div className="text-sm text-gray-600">No extraction details available for this URL.</div>
          )}

          {(extracted?.request || extracted?.responsePreview) && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {extracted?.request && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Request</div>
                  <div className="bg-white rounded border p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto text-gray-700">
                    {extracted.request}
                  </div>
                </div>
              )}
              {extracted?.responsePreview && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Response Preview</div>
                  <div className="bg-white rounded border p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto text-gray-700">
                    {extracted.responsePreview}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ParsedResultsTable({ config, jobs }: { config: SourceConfig; jobs: Array<{ url: string; extracted?: any }> }) {
  const schema = useMemo(() => config.extraction?.config?.llm?.extractionSchema || {}, [config]);
  const required = useMemo(() => new Set(config.extraction?.config?.llm?.requiredFields || (config.extraction?.config?.llm?.requireAllFields ? Object.keys(schema) : ['title'])), [config, schema]);

  // Select default columns (excluding very long ones by default)
  const defaultCols = useMemo(() => {
    const keys = Object.keys(schema);
    const preferred = ['title', 'company', 'location', 'salary', 'startDate'];
    const present = preferred.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !preferred.includes(k) && k !== 'description');
    return ['url', ...present, ...rest];
  }, [schema]);

  const [showDescription, setShowDescription] = useState(false);
  const [wrapCells, setWrapCells] = useState(false);

  const columns = showDescription ? [...defaultCols, 'description'] : defaultCols;

  const getValue = (row: any, key: string) => {
    const f = row?.extracted?.fields;
    if (!f) return '';
    const v = f[key];
    if (Array.isArray(v)) return v.join(', ');
    if (v == null) return '';
    return String(v);
  };

  const isMissing = (row: any, key: string) => {
    if (!required.has(key)) return false;
    const v = row?.extracted?.fields?.[key];
    if (v == null) return true;
    if (typeof v === 'string') return v.trim().length === 0;
    if (Array.isArray(v)) return v.length === 0;
    return false;
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-blue-600" />
          <CardTitle>Parsed Results (Structured)</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={wrapCells} onChange={(e) => setWrapCells(e.target.checked)} />
            <span>Wrap cells</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
            <span>Show description</span>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-gray-500">No items to display.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 font-medium sticky top-0 bg-white">
                      {col}
                      {required.has(col) && <span className="text-red-500 ml-1">*</span>}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-medium sticky top-0 bg-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((row, idx) => (
                  <tr key={row.url + idx} className="border-b hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className={`px-3 py-2 ${wrapCells ? 'whitespace-pre-wrap break-words' : 'truncate max-w-[22ch]'} ${isMissing(row, col) ? 'text-red-600' : 'text-gray-900'}`}>
                        {col === 'url' ? (
                          <a href={row.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline break-all">
                            {row.url}
                          </a>
                        ) : (
                          getValue(row, col) || '—'
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <a href={row.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 border rounded text-xs hover:bg-gray-50">
                        <Eye className="h-3.5 w-3.5" /> View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">* Required fields. Missing values are highlighted in red.</div>
      </CardContent>
    </Card>
  );
}
