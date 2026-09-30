import { create } from 'zustand';

export type TemplateVars = Record<string, string>;

const TOKEN = /\{\{\s*([\p{L}\p{N}_-]+)\s*\}\}/gu;

/** Replaces {{key}} tokens (Persian or Latin keys, case-insensitive). Unknown tokens are kept. */
export function fillTemplate(text: string, vars: TemplateVars): string {
  if (!text.includes('{{')) return text;
  const lower: TemplateVars = {};
  for (const [k, v] of Object.entries(vars)) lower[k.toLowerCase()] = v;
  return text.replace(TOKEN, (match, key: string) => lower[key.toLowerCase()] ?? match);
}

interface TemplateVarsState {
  /** Always-available values (product name/subtitle from the studio). */
  base: TemplateVars;
  /** Per-row values while a batch export is rendering; null otherwise. */
  override: TemplateVars | null;
  setBase: (vars: TemplateVars) => void;
  setOverride: (vars: TemplateVars | null) => void;
}

export const useTemplateVars = create<TemplateVarsState>()((set) => ({
  base: {},
  override: null,
  setBase: (base) => set({ base }),
  setOverride: (override) => set({ override }),
}));

/**
 * Merged variables with a stable identity: recomputed only when base/override change.
 * (Returning a fresh object from a Zustand selector on every call loops React renders.)
 */
let memo: { base: TemplateVars; override: TemplateVars | null; merged: TemplateVars } | null = null;
export const selectVars = (s: TemplateVarsState): TemplateVars => {
  if (!s.override) return s.base;
  if (!memo || memo.base !== s.base || memo.override !== s.override) {
    memo = { base: s.base, override: s.override, merged: { ...s.base, ...s.override } };
  }
  return memo.merged;
};
