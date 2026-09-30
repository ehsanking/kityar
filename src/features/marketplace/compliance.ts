import type { AssetSpec } from './specs';

/** A rendered layer, measured in canvas-relative coordinates (0..1) and exported pixels. */
export interface LayerMeasure {
  id: string;
  name: string;
  type: string;
  /** Bounding box as fractions of canvas width/height. */
  rect: { left: number; top: number; right: number; bottom: number };
  /** Smallest font size of visible text inside the layer, in exported pixels (null if no text). */
  minFontPx: number | null;
}

export type Severity = 'error' | 'warning';
export interface ComplianceIssue {
  severity: Severity;
  code: 'empty' | 'out-of-canvas' | 'safe-area' | 'small-text' | 'text-on-icon' | 'too-many-pills';
  message: string;
  layerId?: string;
}

export interface ComplianceReport {
  issues: ComplianceIssue[];
  /** 0–100: errors cost 25, warnings 8. */
  score: number;
  passed: boolean;
}

const fmt = (n: number) => Math.round(n).toLocaleString('fa-IR');
const EPS = 0.002;

export function checkCompliance(spec: AssetSpec, layers: LayerMeasure[]): ComplianceReport {
  const issues: ComplianceIssue[] = [];
  const content = layers.filter((l) => l.type !== 'background');

  if (content.length === 0) {
    issues.push({ severity: 'error', code: 'empty', message: 'بوم به‌جز پس‌زمینه هیچ محتوایی ندارد.' });
  }

  for (const l of content) {
    const { left, top, right, bottom } = l.rect;
    const outside = right <= EPS || bottom <= EPS || left >= 1 - EPS || top >= 1 - EPS;
    const clipped = left < -EPS || top < -EPS || right > 1 + EPS || bottom > 1 + EPS;
    const m = spec.safeArea;
    const unsafe = left < m - EPS || top < m - EPS || right > 1 - m + EPS || bottom > 1 - m + EPS;

    if (outside) {
      issues.push({ severity: 'error', code: 'out-of-canvas', layerId: l.id, message: `لایهٔ «${l.name}» کاملاً بیرون از بوم است و در خروجی دیده نمی‌شود.` });
      continue;
    }
    if (clipped) {
      issues.push({ severity: 'warning', code: 'out-of-canvas', layerId: l.id, message: `بخشی از لایهٔ «${l.name}» از لبهٔ بوم بیرون زده و بریده می‌شود.` });
    } else if (unsafe && l.minFontPx !== null) {
      issues.push({ severity: 'warning', code: 'safe-area', layerId: l.id, message: `متن «${l.name}» خارج از حاشیهٔ امن (${fmt(m * 100)}٪) است و ممکن است در پیش‌نمایش مارکت‌پلیس بریده شود.` });
    }

    if (l.minFontPx !== null) {
      if (spec.allowText === false) {
        issues.push({ severity: 'warning', code: 'text-on-icon', layerId: l.id, message: `لایهٔ «${l.name}» متن دارد؛ متن روی آیکون/لوگوی کوچک خوانا نیست.` });
      } else if (l.minFontPx < spec.minFontPx) {
        issues.push({
          severity: l.minFontPx < spec.minFontPx * 0.7 ? 'error' : 'warning',
          code: 'small-text',
          layerId: l.id,
          message: `متن «${l.name}» در خروجی ${fmt(l.minFontPx)} پیکسل است؛ حداقل ${fmt(spec.minFontPx)} پیکسل توصیه می‌شود.`,
        });
      }
    }
  }

  if (spec.maxFeaturePills !== undefined) {
    const pills = content.filter((l) => l.type === 'feature-pills').length;
    if (pills > spec.maxFeaturePills) {
      issues.push({ severity: 'warning', code: 'too-many-pills', message: `${fmt(pills)} کپسول ویژگی روی بوم است؛ حداکثر ${fmt(spec.maxFeaturePills)} مورد توصیه می‌شود.` });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;
  return { issues, score: Math.max(0, 100 - errors * 25 - warnings * 8), passed: errors === 0 };
}
