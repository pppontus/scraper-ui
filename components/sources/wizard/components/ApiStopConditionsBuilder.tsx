import React from "react";
import { ApiStopCondition } from "@/lib/types";

type Operator = 'any' | 'all';

interface ApiStopConfigValue {
  operator: Operator;
  conditions: ApiStopCondition[];
}

interface ApiStopConditionsBuilderProps {
  value?: ApiStopConfigValue;
  onChange: (val: ApiStopConfigValue) => void;
}

export function ApiStopConditionsBuilder({ value, onChange }: ApiStopConditionsBuilderProps) {
  const v: ApiStopConfigValue = value || { operator: 'any', conditions: [] };

  const setOperator = (op: Operator) => onChange({ ...v, operator: op });

  const updateCondition = (idx: number, patch: Partial<ApiStopCondition>) => {
    const next = [...v.conditions];
    next[idx] = { ...(next[idx] as any), ...patch } as ApiStopCondition;
    onChange({ ...v, conditions: next });
  };

  const changeType = (idx: number, type: ApiStopCondition["type"]) => {
    // Initialize with minimal fields per type
    let base: ApiStopCondition;
    switch (type) {
      case 'no_next_token': base = { type, nextCursorPath: '' }; break;
      case 'empty_array': base = { type, itemsPath: '' }; break;
      case 'no_new_ids': base = { type, idPath: '', windowPages: 2 }; break;
      case 'http_status': base = { type, statuses: [404] }; break;
      case 'max_age': base = { type, datePath: '', olderThanDays: 30 }; break;
      case 'custom_jsonpath': base = { type, path: '', exists: true }; break;
      default: base = { type } as any;
    }
    const next = [...v.conditions];
    next[idx] = base;
    onChange({ ...v, conditions: next });
  };

  const addCondition = (type: ApiStopCondition["type"]) => {
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
                <option value="no_next_token">No next token</option>
                <option value="empty_array">Items array is empty</option>
                <option value="no_new_ids">No new IDs across pages</option>
                <option value="http_status">HTTP status is one of</option>
                <option value="max_age">Top item older than N days</option>
                <option value="custom_jsonpath">Custom JSONPath check</option>
              </select>
              <button type="button" onClick={() => removeCondition(idx)} className="ml-auto text-xs px-2 py-1 border rounded hover:bg-white">Remove</button>
            </div>

            {c.type === 'no_next_token' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Next cursor JSONPath</label>
                  <input
                    value={(c as any).nextCursorPath || ''}
                    onChange={(e) => updateCondition(idx, { nextCursorPath: e.target.value } as any)}
                    placeholder="$.meta.next_cursor or $.paging.next"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}

            {c.type === 'empty_array' && (
              <div>
                <label className="block text-xs text-gray-700 mb-1">Items JSONPath</label>
                <input
                  value={(c as any).itemsPath || ''}
                  onChange={(e) => updateCondition(idx, { itemsPath: e.target.value } as any)}
                  placeholder="$.items"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            )}

            {c.type === 'no_new_ids' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">ID JSONPath</label>
                  <input
                    value={(c as any).idPath || ''}
                    onChange={(e) => updateCondition(idx, { idPath: e.target.value } as any)}
                    placeholder="$.items[*].id"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Window pages</label>
                  <input
                    type="number"
                    min={1}
                    value={(c as any).windowPages ?? 2}
                    onChange={(e) => updateCondition(idx, { windowPages: parseInt(e.target.value || '0') } as any)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}

            {c.type === 'http_status' && (
              <div>
                <label className="block text-xs text-gray-700 mb-1">Statuses (comma-separated)</label>
                <input
                  value={(c as any).statuses?.join(',') || ''}
                  onChange={(e) => {
                    const nums = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                    updateCondition(idx, { statuses: nums } as any);
                  }}
                  placeholder="404,410"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            )}

            {c.type === 'max_age' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Date JSONPath</label>
                  <input
                    value={(c as any).datePath || ''}
                    onChange={(e) => updateCondition(idx, { datePath: e.target.value } as any)}
                    placeholder="$.items[0].published_at"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Older than (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={(c as any).olderThanDays ?? 30}
                    onChange={(e) => updateCondition(idx, { olderThanDays: parseInt(e.target.value || '0') } as any)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}

            {c.type === 'custom_jsonpath' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-700 mb-1">JSONPath</label>
                  <input
                    value={(c as any).path || ''}
                    onChange={(e) => updateCondition(idx, { path: e.target.value } as any)}
                    placeholder="$.meta.finished"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean((c as any).exists)}
                      onChange={(e) => updateCondition(idx, { exists: e.target.checked } as any)}
                      className="mr-1"
                    />
                    Exists
                  </label>
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
          <option value="no_next_token">No next token</option>
          <option value="empty_array">Items array is empty</option>
          <option value="no_new_ids">No new IDs across pages</option>
          <option value="http_status">HTTP status is one of</option>
          <option value="max_age">Top item older than N days</option>
          <option value="custom_jsonpath">Custom JSONPath check</option>
        </select>
      </div>
    </div>
  );
}

