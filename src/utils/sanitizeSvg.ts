import DOMPurify from 'dompurify';

/**
 * Sanitizes untrusted SVG markup (AI output, persisted layers, imports) before it is
 * injected with dangerouslySetInnerHTML. Strips scripts, event handlers, foreignObject
 * and javascript: URLs; returns '' when no <svg> root survives.
 */
export function sanitizeSvg(markup: string | null | undefined): string {
  if (!markup) return '';
  const clean = DOMPurify.sanitize(markup, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['foreignObject', 'script', 'style'],
  });
  return /^\s*<svg[\s>]/i.test(clean) ? clean : '';
}
