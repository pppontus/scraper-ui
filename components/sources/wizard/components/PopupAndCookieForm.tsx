import React from "react";
import { ShieldCheck, XCircle } from "lucide-react";

type KeyOption = 'None' | 'Escape';

export interface PopupHandlingState {
  enabled: boolean;
  cookies?: {
    selectors?: string[];
    preWaitMs?: number;
    waitMs?: number;
    attempts?: number;
  };
  popups?: {
    closeSelectors?: string[];
    removeSelectors?: string[];
    key?: KeyOption;
    preWaitMs?: number;
    waitMs?: number;
    attempts?: number;
  };
}

interface PopupAndCookieFormProps {
  technique: 'html' | 'js';
  value?: PopupHandlingState;
  existingInteractions?: string[];
  existingCustomJS?: string;
  onUpdate: (payload: {
    popupHandling: PopupHandlingState;
    interactions: string[];
    customJS?: string;
  }) => void;
}

function toArray(input?: string): string[] {
  return (input || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function arrToCsv(arr?: string[]): string {
  return (arr || []).join(', ');
}

function compileInteractions(state: PopupHandlingState): { interactions: string[]; customJS?: string } {
  if (!state?.enabled) return { interactions: [] };

  const interactions: string[] = [];
  const custom: string[] = [];

  const cookieAttempts = Math.max(1, state.cookies?.attempts || 1);
  const cookieWait = Math.max(0, state.cookies?.waitMs || 500);
  const cookiePreWait = Math.max(0, state.cookies?.preWaitMs || 0);
  const popupAttempts = Math.max(1, state.popups?.attempts || 1);
  const popupWait = Math.max(0, state.popups?.waitMs || 500);
  const popupPreWait = Math.max(0, state.popups?.preWaitMs || 0);

  const cookieSelectors = state.cookies?.selectors || [];

  if (cookieSelectors.length && cookiePreWait > 0) interactions.push(`wait(${cookiePreWait})`);
  for (let i = 0; i < cookieAttempts; i++) {
    for (const sel of cookieSelectors) {
      interactions.push(`click('${sel}')`);
      if (cookieWait > 0) interactions.push(`wait(${cookieWait})`);
    }
  }

  if ((state.popups?.closeSelectors?.length || state.popups?.key === 'Escape') && popupPreWait > 0) interactions.push(`wait(${popupPreWait})`);
  for (let i = 0; i < popupAttempts; i++) {
    for (const sel of (state.popups?.closeSelectors || [])) {
      interactions.push(`click('${sel}')`);
      if (popupWait > 0) interactions.push(`wait(${popupWait})`);
    }
    if ((state.popups?.key || 'None') === 'Escape') {
      interactions.push(`press('Escape')`);
      if (popupWait > 0) interactions.push(`wait(${popupWait})`);
    }
  }

  if (state.popups?.removeSelectors && state.popups.removeSelectors.length > 0) {
    const selectorList = state.popups.removeSelectors.join(', ');
    custom.push(`try { document.querySelectorAll('${selectorList}').forEach(el => el.remove()); } catch (e) {}`);
  }

  const customJS = custom.length ? custom.join('\n') : undefined;
  return { interactions, customJS };
}

export function PopupAndCookieForm({ technique, value, existingInteractions = [], existingCustomJS = '', onUpdate }: PopupAndCookieFormProps) {
  const state: PopupHandlingState = {
    enabled: value?.enabled ?? false,
    cookies: {
      selectors: value?.cookies?.selectors || [],
      preWaitMs: value?.cookies?.preWaitMs ?? 1000,
      waitMs: value?.cookies?.waitMs ?? 500,
      attempts: value?.cookies?.attempts ?? 1,
    },
    popups: {
      closeSelectors: value?.popups?.closeSelectors || [],
      removeSelectors: value?.popups?.removeSelectors || [],
      key: value?.popups?.key || 'None',
      preWaitMs: value?.popups?.preWaitMs ?? 1000,
      waitMs: value?.popups?.waitMs ?? 500,
      attempts: value?.popups?.attempts ?? 1,
    }
  };

  const [selectedCookiePreset, setSelectedCookiePreset] = React.useState<string | null>(null);
  const [selectedModalPreset,   setSelectedModalPreset]   = React.useState<string | null>(null);

  // Common cookie CMP presets
  const COOKIE_PRESETS: Array<{
    id: string;
    name: string;
    accept?: string[];
    remove?: string[];
  }> = [
    {
      id: 'onetrust',
      name: 'OneTrust',
      accept: ['#onetrust-accept-btn-handler', 'button#onetrust-accept-btn-handler'],
      remove: ['#onetrust-consent-sdk', '#onetrust-banner-sdk']
    },
    {
      id: 'cookiebot',
      name: 'Cookiebot',
      accept: ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', '#CybotCookiebotDialogBodyButtonAccept'],
      remove: ['#CybotCookiebotDialog', '#CybotCookiebotDialogBodyUnderlay']
    },
    {
      id: 'usercentrics',
      name: 'Usercentrics',
      accept: ['button[data-testid="uc-accept-all-button"]', '#uc-btn-accept-banner'],
      remove: ['#usercentrics-root']
    },
    {
      id: 'didomi',
      name: 'Didomi',
      accept: ['#didomi-notice-agree-button', 'button[data-testid="accept-all"]'],
      remove: ['#didomi-host', '#didomi-notice']
    },
    {
      id: 'quantcast',
      name: 'Quantcast',
      accept: ['.qc-cmp2-summary-buttons .qc-cmp2-summary-buttons-accept', 'button[mode="primary"][data-action="save"]'],
      remove: ['#qc-cmp2-container']
    },
    {
      id: 'trustarc',
      name: 'TrustArc',
      accept: ['#truste-consent-button', '.trustarc-accept'],
      remove: ['#teconsent', '.trustarc-modal']
    },
    {
      id: 'cookieyes',
      name: 'CookieYes',
      accept: ['#cky-btn-accept', '#cookie_action_close_header'],
      remove: ['#cookie-law-info-bar', '#cky-consent']
    },
  ];

  // Common modal/backdrop presets
  const MODAL_PRESETS: Array<{
    id: string;
    name: string;
    close?: string[];
    remove?: string[];
  }> = [
    {
      id: 'generic',
      name: 'Generic',
      close: ['button[aria-label*="close"]', '[data-testid*="close"]', '.close', '.btn-close'],
      remove: ['.modal-backdrop', '.overlay', '.backdrop']
    },
    {
      id: 'bootstrap',
      name: 'Bootstrap',
      close: ['[data-bs-dismiss="modal"]', '[data-dismiss="modal"]', '.modal .close'],
      remove: ['.modal-backdrop', '.offcanvas-backdrop']
    },
    {
      id: 'reactmodal',
      name: 'ReactModal',
      close: ['.ReactModal__Content [aria-label*="close"]'],
      remove: ['.ReactModal__Overlay']
    },
    {
      id: 'chakra',
      name: 'Chakra UI',
      close: ['.chakra-modal__close-btn'],
      remove: ['.chakra-modal__overlay']
    },
    {
      id: 'mui',
      name: 'MUI',
      close: ['[aria-label="Close"]', '[data-testid="CloseIcon"]'],
      remove: ['.MuiBackdrop-root']
    },
  ];

  const mergeUnique = (base: string[] = [], add: string[] = []) => {
    const set = new Set(base.map(s => s.trim()).filter(Boolean));
    add.forEach(s => set.add(s.trim()));
    return Array.from(set);
  };

  const applyCookiePreset = (presetId: string) => {
    const preset = COOKIE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    // Replace current cookie selectors with chosen preset (cycle behavior)
    update({
      enabled: true,
      cookies: {
        selectors: preset.accept || [],
        waitMs: state.cookies?.waitMs,
        attempts: state.cookies?.attempts,
        preWaitMs: state.cookies?.preWaitMs,
      },
      popups: {
        ...state.popups,
        // Keep existing modal removals and add CMP removals
        removeSelectors: mergeUnique(state.popups?.removeSelectors, preset.remove || []),
      }
    });
    setSelectedCookiePreset(presetId);
  };

  const applyModalPreset = (presetId: string) => {
    const preset = MODAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    // Replace current modal close selectors; keep/remove overlays merged
    update({
      enabled: true,
      popups: {
        ...state.popups,
        closeSelectors: preset.close || [],
        removeSelectors: mergeUnique(state.popups?.removeSelectors, preset.remove || []),
      }
    });
    setSelectedModalPreset(presetId);
  };

  const update = (partial: Partial<PopupHandlingState>) => {
    const next: PopupHandlingState = {
      ...state,
      ...partial,
      cookies: { ...state.cookies, ...(partial.cookies || {}) },
      popups: { ...state.popups, ...(partial.popups || {}) },
    };

    // Remove previously generated interactions/customJS (based on prior state)
    const prevCompiled = compileInteractions(state);
    const baseInteractions = existingInteractions.filter(line => !prevCompiled.interactions.includes(line));
    const baseCustom = existingCustomJS
      ? existingCustomJS
          .split('\n')
          .filter(line => !(prevCompiled.customJS || '').split('\n').includes(line))
          .join('\n')
      : '';

    const compiled = compileInteractions(next);
    const mergedInteractions = [...compiled.interactions, ...baseInteractions];
    const mergedCustomJS = [compiled.customJS, baseCustom].filter(Boolean).join('\n');

    onUpdate({
      popupHandling: next,
      interactions: mergedInteractions,
      customJS: mergedCustomJS || undefined,
    });
  };

  if (technique !== 'js') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Page Prep: Cookies & Popups</div>
          <div className="text-sm text-gray-500">Optional actions to accept cookies and dismiss popups before discovery</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {state.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cookies */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="font-medium text-gray-900">Cookie Consent</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accept button selectors</label>
              <input
                value={arrToCsv(state.cookies?.selectors)}
                onChange={(e) => update({ cookies: { selectors: toArray(e.target.value) } })}
                className="w-full px-3 py-2 border rounded"
                placeholder="#onetrust-accept-btn-handler, button.accept"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Quick presets</div>
              <div className="flex flex-wrap gap-2">
                {COOKIE_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyCookiePreset(p.id)}
                    className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 ${
                      selectedCookiePreset === p.id
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-300'
                    }`}
                    title={`Add ${p.name} selectors`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Applies common selectors for the chosen CMP (replaces current preset selectors).</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pre-wait (ms)</label>
                <input
                  type="number"
                  min={0}
                  value={state.cookies?.preWaitMs || 0}
                  onChange={(e) => update({ cookies: { preWaitMs: Math.max(0, Number(e.target.value) || 0) } })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
                <input
                  type="number"
                  min={1}
                  value={state.cookies?.attempts || 1}
                  onChange={(e) => update({ cookies: { attempts: Math.max(1, Number(e.target.value) || 1) } })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wait after click (ms)</label>
                <input
                  type="number"
                  min={0}
                  value={state.cookies?.waitMs || 500}
                  onChange={(e) => update({ cookies: { waitMs: Math.max(0, Number(e.target.value) || 0) } })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Popups */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="font-medium text-gray-900 flex items-center gap-2">
              Popups/Modals
              <XCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close/dismiss selectors</label>
              <input
                value={arrToCsv(state.popups?.closeSelectors)}
                onChange={(e) => update({ popups: { closeSelectors: toArray(e.target.value) } })}
                className="w-full px-3 py-2 border rounded"
                placeholder="button[aria-label*=close], .modal .close, .newsletter .dismiss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remove overlays (CSS selectors)</label>
              <input
                value={arrToCsv(state.popups?.removeSelectors)}
                onChange={(e) => update({ popups: { removeSelectors: toArray(e.target.value) } })}
                className="w-full px-3 py-2 border rounded"
                placeholder=".backdrop, .overlay, .modal-backdrop"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Common modal presets</div>
              <div className="flex flex-wrap gap-2">
                {MODAL_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyModalPreset(p.id)}
                    className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 ${
                      selectedModalPreset === p.id
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-300'
                    }`}
                    title={`Add ${p.name} selectors`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key press</label>
                <select
                  value={state.popups?.key || 'None'}
                  onChange={(e) => update({ popups: { key: e.target.value as KeyOption } })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="None">None</option>
                  <option value="Escape">Escape</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pre-wait (ms)</label>
                <input
                  type="number"
                  min={0}
                  value={state.popups?.preWaitMs || 0}
                  onChange={(e) => update({ popups: { preWaitMs: Math.max(0, Number(e.target.value) || 0) } })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post-action wait (ms)</label>
                <input
                  type="number"
                  min={0}
                  value={state.popups?.waitMs || 500}
                  onChange={(e) => update({ popups: { waitMs: Math.max(0, Number(e.target.value) || 0) } })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
              <input
                type="number"
                min={1}
                value={state.popups?.attempts || 1}
                onChange={(e) => update({ popups: { attempts: Math.max(1, Number(e.target.value) || 1) } })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Generated script preview</div>
            {(() => {
              const compiled = compileInteractions(state);
              return (
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">{
                  [...compiled.interactions, compiled.customJS ? `// customJS\n${compiled.customJS}` : ''].filter(Boolean).join('\n')
                }</pre>
              );
            })()}
            <p className="text-xs text-gray-500 mt-2">This compiles into discovery rendering interactions and custom JS.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PopupAndCookieForm;
