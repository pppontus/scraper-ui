import React from "react";
import { ScrapeStopCondition } from "@/lib/types";

type Operator = 'any' | 'all';

interface ScrapeStopConfigValue {
  operator: Operator;
  conditions: ScrapeStopCondition[];
}

interface ScrapeStopConditionsBuilderProps {
  value?: ScrapeStopConfigValue;
  onChange: (val: ScrapeStopConfigValue) => void;
}

export function ScrapeStopConditionsBuilder({ value, onChange }: ScrapeStopConditionsBuilderProps) {
  const v: ScrapeStopConfigValue = value || { operator: 'any', conditions: [] };

  const setOperator = (op: Operator) => onChange({ ...v, operator: op });

  const updateCondition = (idx: number, patch: Partial<ScrapeStopCondition>) => {
    const next = [...v.conditions];
    next[idx] = { ...(next[idx] as any), ...patch } as ScrapeStopCondition;
    onChange({ ...v, conditions: next });
  };

  const changeType = (idx: number, type: ScrapeStopCondition["type"]) => {
    let base: ScrapeStopCondition;
    switch (type) {
      case 'no_new_links': base = { type, includePatterns: [], checksWithoutChange: 2 }; break;
      case 'selector_present': base = { type, selector: '' }; break;
      case 'selector_missing': base = { type, selector: '' }; break;
      case 'text_present': base = { type, text: '', selector: '' }; break;
      case 'button_missing_or_disabled': base = { type, selector: '' }; break;
      case 'max_scrolls_without_change': base = { type, scrolls: 3 }; break;
      default: base = { type } as any;
    }
    const next = [...v.conditions];
    next[idx] = base;
    onChange({ ...v, conditions: next });
  };

  const addCondition = (type: ScrapeStopCondition["type"]) => {
    changeType(v.conditions.length, type);
  };

  const removeCondition = (idx: number) => {
    const next = v.conditions.filter((_, i) => i !== idx);
    onChange({ ...v, conditions: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Stop when</label>
        <select
          value={v.operator}
          onChange={(e) => setOperator(e.target.value as Operator)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="any">ANY condition matches</option>
          <option value="all">ALL conditions match</option>
        </select>
      </div>

      <div className="space-y-2">
        {v.conditions.map((c, idx) => (
          <div key={idx} className="border rounded p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <select
                value={c.type}
                onChange={(e) => changeType(idx, e.target.value as any)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="no_new_links">No new links discovered</option>
                <option value="selector_present">Selector present</option>
                <option value="selector_missing">Selector missing</option>
                <option value="text_present">Text present</option>
                <option value="button_missing_or_disabled">Button missing/disabled</option>
                <option value="max_scrolls_without_change">Max scrolls without change</option>
              </select>
              <button type="button" onClick={() => removeCondition(idx)} className="ml-auto text-xs px-2 py-1 border rounded hover:bg-white">Remove</button>
            </div>

            {c.type === 'no_new_links' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Include patterns (comma-separated)</label>
                  <input
                    value={(c as any).includePatterns?.join(',') || ''}
                    onChange={(e) => updateCondition(idx, { includePatterns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as any)}
                    placeholder="/jobs/, /uppdrag/"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Checks without change</label>
                  <input
                    type="number"
                    min={1}
                    value={(c as any).checksWithoutChange ?? 2}
                    onChange={(e) => updateCondition(idx, { checksWithoutChange: parseInt(e.target.value || '0') } as any)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}

            {(c.type === 'selector_present' || c.type === 'selector_missing' || c.type === 'button_missing_or_disabled') && (
              <div>
                <label className="block text-xs text-gray-700 mb-1">CSS selector</label>
                <input
                  value={(c as any).selector || ''}
                  onChange={(e) => updateCondition(idx, { selector: e.target.value } as any)}
                  placeholder={c.type === 'button_missing_or_disabled' ? 'button.load-more' : 'a.next'}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            )}

            {c.type === 'text_present' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Scope selector (optional)</label>
                  <input
                    value={(c as any).selector || ''}
                    onChange={(e) => updateCondition(idx, { selector: e.target.value } as any)}
                    placeholder=".list-footer"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Text to match</label>
                  <input
                    value={(c as any).text || ''}
                    onChange={(e) => updateCondition(idx, { text: e.target.value } as any)}
                    placeholder="No more results"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Add condition:</label>
        <select
          onChange={(e) => { if (e.target.value) { addCondition(e.target.value as any); e.currentTarget.selectedIndex = 0; }}}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="">Select…</option>
          <option value="no_new_links">No new links discovered</option>
          <option value="selector_present">Selector present</option>
          <option value="selector_missing">Selector missing</option>
          <option value="text_present">Text present</option>
          <option value="button_missing_or_disabled">Button missing/disabled</option>
          <option value="max_scrolls_without_change">Max scrolls without change</option>
        </select>
      </div>
    </div>
  );
}

