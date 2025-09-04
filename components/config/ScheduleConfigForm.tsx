import React from "react";
import { SourceConfig } from "@/lib/types";
import { Trash2, Plus, X } from "lucide-react";

// Simplified Cron Builder component
function SimpleCronBuilder({ value, onChange, disabled }: { value: string; onChange: (expr: string) => void; disabled?: boolean }) {
  const [days, setDays] = React.useState<boolean[]>([true, true, true, true, true, true, true]); // Mon..Sun (7)
  const [startHour, setStartHour] = React.useState<number>(8);
  const [endHour, setEndHour] = React.useState<number>(18);
  const [frequency, setFrequency] = React.useState<number>(4); // Every 4 hours

  React.useEffect(() => {
    if (disabled) return;
    
    const selectedDays = days.map((selected, i) => selected ? i + 1 : null).filter(Boolean).join(',');
    if (selectedDays) {
      const cronExpr = `0 ${startHour}-${endHour}/${frequency} * * ${selectedDays}`;
      onChange(cronExpr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, startHour, endHour, frequency, disabled]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm font-medium mb-2">Active Days</label>
        <div className="flex gap-2">
          {dayNames.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (disabled) return;
                const newDays = [...days];
                newDays[i] = !newDays[i];
                setDays(newDays);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                days[i] 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Start Hour</label>
          <select
            value={startHour}
            onChange={(e) => !disabled && setStartHour(Number(e.target.value))}
            disabled={disabled}
            className="w-full text-sm border rounded px-2 py-1"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">End Hour</label>
          <select
            value={endHour}
            onChange={(e) => !disabled && setEndHour(Number(e.target.value))}
            disabled={disabled}
            className="w-full text-sm border rounded px-2 py-1"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Every X Hours</label>
          <select
            value={frequency}
            onChange={(e) => !disabled && setFrequency(Number(e.target.value))}
            disabled={disabled}
            className="w-full text-sm border rounded px-2 py-1"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Current: <code className="bg-gray-200 px-1 rounded">{value || 'No schedule'}</code>
      </div>
    </div>
  );
}

interface ScheduleConfigFormProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
  onValidation?: (isValid: boolean) => void;
  variant?: 'wizard' | 'settings';
}

export function ScheduleConfigForm({ 
  config, 
  setConfig, 
  onValidation,
  variant = 'wizard' 
}: ScheduleConfigFormProps) {
  // Initialize deletion config if missing for backward compatibility
  const schedule = {
    ...config.schedule,
    deletion: config.schedule.deletion || {
      regularChecks: {
        enabled: true,
        checkMissingFromList: true,
        maxJobAgedays: 60
      },
      keywordChecks: {
        enabled: false,
        schedule: {
          type: "interval" as const,
          intervalMinutes: 1440
        },
        rules: []
      },
      deadlineChecks: {
        enabled: true,
        gracePeriodDays: 0
      }
    }
  };

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

  const updateDeletion = (updates: Partial<typeof schedule.deletion>) => {
    updateSchedule({ deletion: { ...schedule.deletion, ...updates } });
  };

  const updateRegularChecks = (updates: Partial<typeof schedule.deletion.regularChecks>) => {
    updateDeletion({ regularChecks: { ...schedule.deletion.regularChecks, ...updates } });
  };

  const updateKeywordChecks = (updates: Partial<typeof schedule.deletion.keywordChecks>) => {
    updateDeletion({ keywordChecks: { ...schedule.deletion.keywordChecks, ...updates } });
  };

  const updateDeadlineChecks = (updates: Partial<typeof schedule.deletion.deadlineChecks>) => {
    updateDeletion({ deadlineChecks: { ...schedule.deletion.deadlineChecks, ...updates } });
  };

  const isValid = true;
  
  React.useEffect(() => {
    onValidation?.(isValid);
  }, [isValid, onValidation]);

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

      {/* Job Deletion Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Deletion Rules</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Configure automatic job deletion based on various criteria. Jobs will be marked for deletion, not immediately removed.
        </p>

        {/* Regular Deletion Checks */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedule.deletion.regularChecks.enabled}
                onChange={(e) => updateRegularChecks({ enabled: e.target.checked })}
                className="h-4 w-4 text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">Regular Deletion Checks</span>
            </label>
            <span className="text-xs text-gray-500">Runs with same schedule as discovery</span>
          </div>

          {schedule.deletion.regularChecks.enabled && (
            <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule.deletion.regularChecks.checkMissingFromList}
                  onChange={(e) => updateRegularChecks({ checkMissingFromList: e.target.checked })}
                  className="h-4 w-4 text-red-600"
                />
                <span className="text-sm text-gray-700">Mark for deletion if job is removed from listings</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum job age (days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={schedule.deletion.regularChecks.maxJobAgedays}
                  onChange={(e) => updateRegularChecks({ maxJobAgedays: parseInt(e.target.value) || 60 })}
                  className="w-32 px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Jobs older than this will be marked for deletion</p>
              </div>
            </div>
          )}
        </div>

        {/* Application Deadline Checks */}
        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={schedule.deletion.deadlineChecks.enabled}
              onChange={(e) => updateDeadlineChecks({ enabled: e.target.checked })}
              className="h-4 w-4 text-red-600"
            />
            <span className="text-sm font-medium text-gray-700">Application Deadline Checks</span>
          </label>

          {schedule.deletion.deadlineChecks.enabled && (
            <div className="ml-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grace period after deadline (days)
                </label>
                <input
                  type="number"
                  min={0}
                  value={schedule.deletion.deadlineChecks.gracePeriodDays}
                  onChange={(e) => updateDeadlineChecks({ gracePeriodDays: parseInt(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Extra days to wait after the application deadline before marking for deletion
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Keyword-based Deletion Checks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedule.deletion.keywordChecks.enabled}
                onChange={(e) => updateKeywordChecks({ enabled: e.target.checked })}
                className="h-4 w-4 text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">Keyword Deletion Checks</span>
            </label>
          </div>

          {schedule.deletion.keywordChecks.enabled && (
            <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Schedule for keyword checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Schedule</label>
                  <select
                    value={schedule.deletion.keywordChecks.schedule.type}
                    onChange={(e) => updateKeywordChecks({ 
                      schedule: { 
                        ...schedule.deletion.keywordChecks.schedule, 
                        type: e.target.value as "cron" | "interval" 
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="interval">Interval (minutes)</option>
                    <option value="cron">Cron Expression</option>
                  </select>
                </div>
                <div>
                  {schedule.deletion.keywordChecks.schedule.type === "interval" ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interval (minutes)</label>
                      <input
                        type="number"
                        min={60}
                        value={schedule.deletion.keywordChecks.schedule.intervalMinutes || 1440}
                        onChange={(e) => updateKeywordChecks({ 
                          schedule: { 
                            ...schedule.deletion.keywordChecks.schedule, 
                            intervalMinutes: parseInt(e.target.value) || 1440 
                          } 
                        })}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
                      <input
                        type="text"
                        value={schedule.deletion.keywordChecks.schedule.expression || "0 2 * * *"}
                        onChange={(e) => updateKeywordChecks({ 
                          schedule: { 
                            ...schedule.deletion.keywordChecks.schedule, 
                            expression: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border rounded font-mono text-sm"
                        placeholder="0 2 * * *"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Keyword Rules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Keyword Rules</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newRule = {
                        id: `rule_${Date.now()}`,
                        name: "New Rule",
                        keywords: [],
                        selectors: [],
                        caseSensitive: false
                      };
                      updateKeywordChecks({ 
                        rules: [...schedule.deletion.keywordChecks.rules, newRule] 
                      });
                    }}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Rule
                  </button>
                </div>

                <div className="space-y-3">
                  {schedule.deletion.keywordChecks.rules.map((rule, index) => (
                    <KeywordRuleEditor
                      key={rule.id}
                      rule={rule}
                      onUpdate={(updatedRule) => {
                        const updatedRules = [...schedule.deletion.keywordChecks.rules];
                        updatedRules[index] = updatedRule;
                        updateKeywordChecks({ rules: updatedRules });
                      }}
                      onDelete={() => {
                        const updatedRules = schedule.deletion.keywordChecks.rules.filter(r => r.id !== rule.id);
                        updateKeywordChecks({ rules: updatedRules });
                      }}
                    />
                  ))}

                  {schedule.deletion.keywordChecks.rules.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded">
                      No keyword rules configured. Add a rule to start monitoring for deletion keywords.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Keyword Rule Editor Component
function KeywordRuleEditor({ 
  rule, 
  onUpdate, 
  onDelete 
}: { 
  rule: any; 
  onUpdate: (rule: any) => void; 
  onDelete: () => void; 
}) {
  const updateRule = (updates: Partial<typeof rule>) => {
    onUpdate({ ...rule, ...updates });
  };

  const addKeyword = () => {
    updateRule({ keywords: [...rule.keywords, ""] });
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...rule.keywords];
    updated[index] = value;
    updateRule({ keywords: updated });
  };

  const removeKeyword = (index: number) => {
    updateRule({ keywords: rule.keywords.filter((_: any, i: number) => i !== index) });
  };

  const addSelector = () => {
    updateRule({ selectors: [...rule.selectors, ""] });
  };

  const updateSelector = (index: number, value: string) => {
    const updated = [...rule.selectors];
    updated[index] = value;
    updateRule({ selectors: updated });
  };

  const removeSelector = (index: number) => {
    updateRule({ selectors: rule.selectors.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={rule.name}
            onChange={(e) => updateRule({ name: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium"
            placeholder="Rule name"
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
          title="Delete rule"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keywords */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Keywords to detect</label>
            <button
              type="button"
              onClick={addKeyword}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {rule.keywords.map((keyword: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="e.g., No longer accepting"
                />
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {rule.keywords.length === 0 && (
              <div className="text-xs text-gray-500 italic">No keywords added</div>
            )}
          </div>
        </div>

        {/* Selectors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">CSS Selectors to check</label>
            <button
              type="button"
              onClick={addSelector}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {rule.selectors.map((selector: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={selector}
                  onChange={(e) => updateSelector(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  placeholder="e.g., .job-status, #application-info"
                />
                <button
                  type="button"
                  onClick={() => removeSelector(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {rule.selectors.length === 0 && (
              <div className="text-xs text-gray-500 italic">No selectors added</div>
            )}
          </div>
        </div>
      </div>

      {/* Case sensitivity */}
      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rule.caseSensitive}
            onChange={(e) => updateRule({ caseSensitive: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">Case sensitive matching</span>
        </label>
      </div>
    </div>
  );
}