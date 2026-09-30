import type { LayerMeasure } from './compliance';

/**
 * Measures rendered layers ([data-layer-id]) inside a canvas element. Uses the canvas'
 * on-screen rect, so CSS transforms/zoom are accounted for; font sizes are converted
 * to exported pixels via exportWidth / on-screen width.
 */
export function measureLayers(
  canvas: HTMLElement,
  exportWidth: number,
  layers: { id: string; name: string; type: string; visible?: boolean }[],
): LayerMeasure[] {
  const box = canvas.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return [];
  const toExportPx = exportWidth / box.width;
  const out: LayerMeasure[] = [];

  for (const layer of layers) {
    if (layer.visible === false) continue;
    const el = canvas.querySelector<HTMLElement>(`[data-layer-id="${CSS.escape(layer.id)}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    let minFont: number | null = null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim() || !node.parentElement) continue;
      const style = getComputedStyle(node.parentElement);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      // Scale by the element's on-screen/CSS size ratio to include transforms (layer scale).
      const parentBox = node.parentElement.getBoundingClientRect();
      const cssH = node.parentElement.offsetHeight || parentBox.height;
      const transformScale = cssH > 0 ? parentBox.height / cssH : 1;
      const px = parseFloat(style.fontSize) * transformScale * toExportPx;
      if (Number.isFinite(px) && (minFont === null || px < minFont)) minFont = px;
    }

    out.push({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      rect: {
        left: (r.left - box.left) / box.width,
        top: (r.top - box.top) / box.height,
        right: (r.right - box.left) / box.width,
        bottom: (r.bottom - box.top) / box.height,
      },
      minFontPx: minFont,
    });
  }
  return out;
}
