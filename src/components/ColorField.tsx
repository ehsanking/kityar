import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RgbaColorPicker } from 'react-colorful';
import { formatRgba, parseColor, type Rgba } from '../utils/color';

interface ColorFieldProps {
  value: string | undefined;
  onChange: (rgba: string) => void;
  /** Accessible name; also shown as a tooltip on the swatch. */
  label: string;
  /** Show the editable rgba(...) text next to the swatch. */
  showText?: boolean;
  className?: string;
}

const CHECKERBOARD =
  'repeating-conic-gradient(#94a3b8 0% 25%, #e2e8f0 0% 50%) 50% / 8px 8px';

/**
 * Colour input with transparency. Always emits `rgba(r, g, b, a)`; accepts hex/rgb/rgba
 * values for backwards compatibility with existing projects.
 */
const ColorField: React.FC<ColorFieldProps> = ({ value, onChange, label, showText = false, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? '');
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popoverId = useId();
  const rgba: Rgba = parseColor(value) ?? { r: 0, g: 0, b: 0, a: 1 };

  useEffect(() => setText(value ?? ''), [value]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    // The popover is fixed-positioned; close it rather than let it drift when the page scrolls.
    const onScroll = (e: Event) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  // Place the popover below the swatch (or above when there is no room), inside the viewport.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    const w = 200, h = 210, m = 8;
    const left = Math.min(Math.max(m, r.right - w), window.innerWidth - w - m);
    const top = r.bottom + m + h > window.innerHeight ? Math.max(m, r.top - h - m) : r.bottom + m;
    setPos({ top, left });
  }, [open]);

  const commitText = () => {
    const parsed = parseColor(text);
    if (parsed) onChange(formatRgba(parsed));
    else setText(value ?? '');
  };

  return (
    <div ref={rootRef} className={`relative inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={popoverId}
        title={label}
        className="w-8 h-7 shrink-0 rounded-lg border border-slate-600 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        style={{ background: CHECKERBOARD }}
      >
        <span className="block w-full h-full" style={{ background: formatRgba(rgba) }} />
      </button>

      {showText && (
        <input
          type="text"
          dir="ltr"
          value={text}
          aria-label={`${label} (rgba)`}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => e.key === 'Enter' && commitText()}
          className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-200 focus:border-amber-400 outline-none"
        />
      )}

      {open && pos &&
        // Portal: ancestors with backdrop-filter/transform create stacking contexts that
        // would otherwise trap the popover underneath neighbouring panels.
        createPortal(
          <div
            ref={popRef}
            id={popoverId}
            role="dialog"
            aria-label={label}
            className="fixed z-[1000] p-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl space-y-2"
            style={{ top: pos.top, left: pos.left }}
            dir="ltr"
          >
            <RgbaColorPicker color={rgba} onChange={(c) => onChange(formatRgba(c))} style={{ width: 180, height: 160 }} />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span>{formatRgba(rgba)}</span>
              <span>{Math.round(rgba.a * 100)}%</span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ColorField;
