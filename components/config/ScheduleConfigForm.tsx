import React, { useState } from "react";
import { SourceConfig } from "@/lib/types";

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
    </div>
  );
}

// Simplified Cron Builder: select days, hours window, and frequency
function SimpleCronBuilder({ value, onChange, disabled }: { value: string; onChange: (expr: string) => void; disabled?: boolean }) {
  const [days, setDays] = React.useState<boolean[]>([true, true, true, true, true, true, true]); // Mon..Sun (7)
  const [startHour, setStartHour] = React.useState<number>(8);
  const [endHour, setEndHour] = React.useState<number>(18);
  const [freq, setFreq] = React.useState<'15'|'30'|'60'|'120'>('60');

  // Naive parse (best effort)
  React.useEffect(() => {
    const parts = (value || '').trim().split(/\s+/);
    if (parts.length >= 5) {
      const m = parts[0];
      const h = parts[1];
      const dow = parts[4];
      // Minutes -> frequency
      if (/^\*\/15$/.test(m)) setFreq('15');
      else if (/^\*\/30$/.test(m)) setFreq('30');
      else if (m === '0' && /\/2$/.test(h)) setFreq('120');
      else if (m === '0') setFreq('60');

      // Hours range
      const hrMatch = h.match(/^(\d{1,2})(?:-(\d{1,2}))?(?:\/\d+)?$/);
      if (hrMatch) {
        const s = parseInt(hrMatch[1] || '0', 10);
        const e = parseInt(hrMatch[2] || hrMatch[1] || '23', 10);
        if (!isNaN(s)) setStartHour(Math.max(0, Math.min(23, s)));
        if (!isNaN(e)) setEndHour(Math.max(0, Math.min(23, e)));
      }

      // Days of week
      const newDays = [false,false,false,false,false,false,false];
      if (dow === '*' || dow === '*/1') {
        for (let i=0;i<7;i++) newDays[i]=true;
      } else {
        dow.split(',').forEach(token => {
          const range = token.split('-');
          const mapNum = (n: number) => (n === 0 ? 7 : n); // 1..7 with 7=Sun
          if (range.length === 2) {
            let a = parseInt(range[0],10); let b = parseInt(range[1],10);
            if (!isNaN(a) && !isNaN(b)) {
              a = mapNum(a); b = mapNum(b);
              for (let x=a; x<=b; x++) newDays[(x-1)%7] = true;
            }
          } else {
            let n = parseInt(token,10);
            if (!isNaN(n)) {
              n = mapNum(n);
              newDays[(n-1)%7] = true;
            }
          }
        });
      }
      if (newDays.some(Boolean)) setDays(newDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildCron = () => {
    // Minutes
    let minute = '0';
    let hour = `${startHour}-${endHour}`;
    if (freq === '15') minute = '*/15';
    else if (freq === '30') minute = '*/30';
    else if (freq === '60') minute = '0';
    else if (freq === '120') { minute = '0'; hour = `${startHour}-${endHour}/2`; }

    // Days
    const dayNums: number[] = [];
    for (let i=0;i<7;i++) if (days[i]) dayNums.push(i+1); // 1..7 (Mon..Sun)
    const dow = dayNums.length === 7 ? '*' : dayNums.join(',');

    return `${minute} ${hour} * * ${dow}`;
  };

  React.useEffect(() => {
    if (startHour > endHour) setEndHour(startHour);
  }, [startHour, endHour]);

  const apply = (expr?: string) => {
    onChange(expr || buildCron());
  };

  const toggleDay = (idx: number) => {
    const next = [...days];
    next[idx] = !next[idx];
    if (!next.some(Boolean)) return; // require at least one day
    setDays(next);
    apply();
  };

  return (
    <div className={`border rounded p-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">Days of week</div>
        <div className="flex flex-wrap gap-2">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
            <button
              key={d}
              type="button"
              className={`px-2 py-1 text-xs rounded border ${days[i] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
              onClick={() => toggleDay(i)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Start hour</label>
          <input type="number" min={0} max={23} value={startHour} onChange={(e) => { setStartHour(parseInt(e.target.value)||0); apply(); }} className="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">End hour</label>
          <input type="number" min={0} max={23} value={endHour} onChange={(e) => { setEndHour(parseInt(e.target.value)||0); apply(); }} className="w-full px-2 py-1 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Frequency</label>
          <select value={freq} onChange={(e) => { setFreq(e.target.value as any); apply(); }} className="w-full px-2 py-1 border rounded">
            <option value="15">Every 15 minutes</option>
            <option value="30">Every 30 minutes</option>
            <option value="60">Every hour</option>
            <option value="120">Every 2 hours</option>
          </select>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-600 font-mono">{buildCron()}</div>
    </div>
  );
}