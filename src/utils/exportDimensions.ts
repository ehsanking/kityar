export interface ExportDimensions {
  width: number;
  height: number;
}

export interface ExportTarget {
  element: HTMLElement;
  dimensions?: ExportDimensions;
}

export function getExportAssetKey(prefix: string, dimensions: ExportDimensions): string {
  return `${prefix}_${dimensions.width}x${dimensions.height}`;
}

const isPositiveFinite = (value: number): boolean => Number.isFinite(value) && value > 0;

export function getCapturePixelRatio(
  sourceWidth: number,
  sourceHeight: number,
  target: ExportDimensions,
): number {
  if (
    !isPositiveFinite(sourceWidth) ||
    !isPositiveFinite(sourceHeight) ||
    !isPositiveFinite(target.width) ||
    !isPositiveFinite(target.height)
  ) {
    throw new Error('ابعاد تصویر برای خروجی معتبر نیست.');
  }

  return Math.max(target.width / sourceWidth, target.height / sourceHeight);
}

export function resizeCanvasToDimensions(
  source: HTMLCanvasElement,
  target: ExportDimensions,
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas'),
): HTMLCanvasElement {
  if (
    !Number.isInteger(target.width) ||
    !Number.isInteger(target.height) ||
    !isPositiveFinite(target.width) ||
    !isPositiveFinite(target.height)
  ) {
    throw new Error('ابعاد نهایی تصویر باید اعداد صحیح و مثبت باشند.');
  }

  if (source.width === target.width && source.height === target.height) return source;

  const output = createCanvas();
  output.width = target.width;
  output.height = target.height;
  const context = output.getContext('2d');
  if (!context) throw new Error('ساخت بوم نهایی برای تغییر ابعاد تصویر ممکن نشد.');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, target.width, target.height);
  return output;
}
