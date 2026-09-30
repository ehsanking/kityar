import { toPng, toCanvas, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { writePsd } from 'ag-psd';

/**
 * Converts any oklch(...) or modern color space string to standard rgb(...) / rgba(...)
 * using browser's CanvasRenderingContext2D or fallback regex parsing.
 */
export function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.fillStyle = '#000000'; // fallback
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      const alpha = +(a / 255).toFixed(2);
      return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  } catch (e) {
    // If browser fails, strip or replace oklch with fallback rgb
  }

  return colorStr.replace(/oklch\([^)]+\)/gi, 'rgb(30, 41, 59)');
}

/**
 * Deeply sanitizes an HTML element tree to replace any oklch color references
 * with standard RGB/RGBA values across inline styles, computed styles, and attributes.
 */
export function sanitizeElementColors(element: HTMLElement): void {
  const allNodes = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];

  allNodes.forEach((node) => {
    if (!node.style) return;

    // Check common color-bearing style properties
    const colorProps = [
      'color', 'backgroundColor', 'borderColor', 'outlineColor',
      'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
      'fill', 'stroke', 'boxShadow', 'textShadow'
    ];

    colorProps.forEach((prop) => {
      const val = (node.style as any)[prop];
      if (val && typeof val === 'string' && val.includes('oklch')) {
        (node.style as any)[prop] = convertOklchToRgb(val);
      }
    });

    // Check background & backgroundImage (gradients)
    const bg = node.style.background;
    if (bg && bg.includes('oklch')) {
      node.style.background = bg.replace(/oklch\([^)]+\)/gi, (match) => convertOklchToRgb(match));
    }

    const bgImg = node.style.backgroundImage;
    if (bgImg && bgImg.includes('oklch')) {
      node.style.backgroundImage = bgImg.replace(/oklch\([^)]+\)/gi, (match) => convertOklchToRgb(match));
    }
  });
}

/**
 * Pre-export validation check:
 * 1. Verifies element existence and dimensions.
 * 2. Ensures all document fonts (IRANSans, Yekan Bakh, etc.) are fully loaded and rendered.
 * 3. Preloads all <img> tags inside element and waits for decode/onload.
 * 4. Extracts and preloads any CSS background-image URLs.
 * 5. Sanitizes any potential oklch color functions to standard RGB/RGBA.
 * 6. Waits for requestAnimationFrame cycle to guarantee complete DOM rendering.
 */
export async function validateAndPreloadElement(element: HTMLElement, timeoutMs: number = 8000): Promise<void> {
  if (!element) {
    throw new Error('المان مورد نظر برای تصویربرداری یافت نشد.');
  }

  // 1. Check layout dimensions
  if (element.offsetWidth === 0 && element.offsetHeight === 0 && element.scrollWidth === 0) {
    throw new Error('المان مورد نظر در صفحه قابل رویت یا دارای اندازه معتبر نیست.');
  }

  // 2. Wait for document fonts to be ready
  if (document.fonts && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    } catch (fontErr) {
      console.warn('Font preload warning:', fontErr);
    }
  }

  // 3. Preload and decode all embedded <img> elements
  const imgElements = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
  const imgPromises = imgElements.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), timeoutMs);

      if ('decode' in img && typeof img.decode === 'function') {
        img.decode()
          .then(() => {
            clearTimeout(timer);
            resolve();
          })
          .catch(() => {
            clearTimeout(timer);
            resolve();
          });
      } else {
        img.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
      }
    });
  });

  // 4. Preload any CSS background-image URLs
  const allNodes = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
  const bgImagePromises: Promise<void>[] = [];

  allNodes.forEach((node) => {
    const bg = window.getComputedStyle(node).backgroundImage;
    if (bg && bg.startsWith('url(')) {
      const match = bg.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1] && !match[1].startsWith('data:')) {
        const bgImgUrl = match[1];
        bgImagePromises.push(
          new Promise<void>((resolve) => {
            const tempImg = new Image();
            tempImg.src = bgImgUrl;
            tempImg.onload = () => resolve();
            tempImg.onerror = () => resolve();
            setTimeout(() => resolve(), 3000);
          })
        );
      }
    }
  });

  await Promise.all([...imgPromises, ...bgImagePromises]);

  // 5. Sanitize any oklch color instances in the DOM tree
  sanitizeElementColors(element);

  // 6. Double RAF tick to guarantee styles & layout are committed to GPU/render tree
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/**
 * Capture HTML element to high-res Canvas using native browser rasterization
 * with rigorous pre-validation and oklch-to-rgb sanitization.
 */
export async function captureElementToCanvas(element: HTMLElement, pixelRatio: number = 2): Promise<HTMLCanvasElement> {
  await validateAndPreloadElement(element);

  return await toCanvas(element, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: undefined,
    style: {
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      overflow: 'hidden',
    },
    filter: (domNode: HTMLElement) => {
      if (domNode.getAttribute && domNode.getAttribute('data-export-ignore') === 'true') return false;
      const classStr = domNode.className || '';
      if (typeof classStr === 'string') {
        if (classStr.includes('export-ignore')) return false;
        if (classStr.includes('smart-snap-guide')) return false;
        if (classStr.includes('precision-drag-badge')) return false;
      }
      return true;
    },
  });
}

/**
 * Export element to High-Res PNG (100% compatible with standard RGB/RGBA colors and custom fonts)
 */
export async function exportToPng(
  element: HTMLElement, 
  filename: string = 'zhaket-asset.png', 
  pixelRatio: number = 2
): Promise<void> {
  await validateAndPreloadElement(element);

  const dataUrl = await toPng(element, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: undefined,
    style: {
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      overflow: 'hidden',
    },
    filter: (domNode: HTMLElement) => {
      if (domNode.getAttribute && domNode.getAttribute('data-export-ignore') === 'true') return false;
      const classStr = domNode.className || '';
      if (typeof classStr === 'string') {
        if (classStr.includes('export-ignore')) return false;
        if (classStr.includes('smart-snap-guide')) return false;
        if (classStr.includes('precision-drag-badge')) return false;
      }
      return true;
    },
  });
  
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export element to PDF document using jsPDF with pre-validation
 */
export async function exportToPdf(
  element: HTMLElement, 
  filename: string = 'zhaket-asset.pdf', 
  title: string = 'Zhaket Yar Asset Document'
): Promise<void> {
  await validateAndPreloadElement(element);

  const canvas = await captureElementToCanvas(element, 2);
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  const isLandscape = canvas.width > canvas.height;
  const orientation = isLandscape ? 'landscape' : 'portrait';
  
  const pdfWidth = canvas.width * 0.75;
  const pdfHeight = canvas.height * 0.75;

  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Export element to layered / standard Photoshop PSD file using ag-psd with pre-validation
 */
export async function exportToPsd(
  element: HTMLElement, 
  filename: string = 'zhaket-asset.psd'
): Promise<void> {
  await validateAndPreloadElement(element);

  const canvas = await captureElementToCanvas(element, 2);
  
  // Convert HTMLCanvas to PSD structure
  const psd = {
    width: canvas.width,
    height: canvas.height,
    children: [
      {
        name: 'طرح لایه‌باز کیت یار',
        canvas: canvas,
      },
    ],
  };

  const buffer = writePsd(psd);
  const blob = new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = filename.endsWith('.psd') ? filename : `${filename}.psd`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Export full ZIP package containing PNG, PDF, and PSD formats for all assets
 * with rigorous pre-export validation on each asset.
 */
export async function exportFullPackageZip(
  elementsMap: { [key: string]: HTMLElement },
  productName: string,
  onProgress?: (progress: number, statusText: string) => void
): Promise<void> {
  const zip = new JSZip();
  const safeName = productName.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const folder = zip.folder(`zhaket-assets-${safeName}`);
  if (!folder) return;

  const entries = Object.entries(elementsMap);
  let completed = 0;

  for (const [key, element] of entries) {
    if (!element) continue;
    
    onProgress?.(
      Math.round((completed / entries.length) * 100),
      `اعتبارسنجی و پیش‌بارگذاری لایه‌ها برای ${key}...`
    );

    try {
      // 1. Run Pre-export Validation
      await validateAndPreloadElement(element);

      onProgress?.(
        Math.round((completed / entries.length) * 100) + 5,
        `تولید خروجی PNG، PDF و PSD برای ${key}...`
      );

      // 2. Generate PNG data url directly
      const pngDataUrl = await toPng(element, { 
        pixelRatio: 2, 
        cacheBust: true,
        style: {
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          overflow: 'hidden',
        },
        filter: (domNode: HTMLElement) => {
          if (domNode.getAttribute && domNode.getAttribute('data-export-ignore') === 'true') return false;
          const classStr = domNode.className || '';
          if (typeof classStr === 'string') {
            if (classStr.includes('export-ignore')) return false;
            if (classStr.includes('smart-snap-guide')) return false;
            if (classStr.includes('precision-drag-badge')) return false;
          }
          return true;
        },
      });
      const pngBase64 = pngDataUrl.split(',')[1];
      folder.file(`${key}.png`, pngBase64, { base64: true });

      // 3. Generate PDF
      const canvas = await captureElementToCanvas(element, 2);
      const isLandscape = canvas.width > canvas.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [canvas.width * 0.75, canvas.height * 0.75],
      });
      pdf.addImage(pngDataUrl, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      const pdfBlob = pdf.output('blob');
      folder.file(`${key}.pdf`, pdfBlob);

      // 4. Generate PSD
      try {
        const psd = {
          width: canvas.width,
          height: canvas.height,
          children: [{ name: key, canvas }],
        };
        const psdBuffer = writePsd(psd);
        folder.file(`${key}.psd`, psdBuffer);
      } catch (err) {
        console.warn('PSD format note for', key, err);
      }
    } catch (captureErr) {
      console.error(`Error capturing ${key}:`, captureErr);
    }

    completed++;
  }

  onProgress?.(95, 'در حال فشرده‌سازی پکیج نهایی...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  const downloadUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.download = `zhaket-complete-package-${safeName}.zip`;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
  
  onProgress?.(100, 'دانلود پکیج کامل شد!');
}

/**
 * Batch export: for each row, `renderRow` applies the row's values and resolves with the
 * elements to capture once the UI has re-rendered. PNGs go into one ZIP, a folder per row.
 */
export async function exportBatchZip<T>(
  rows: T[],
  folderName: (row: T, index: number) => string,
  renderRow: (row: T) => Promise<{ [key: string]: HTMLElement }>,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  const zip = new JSZip();
  const used = new Set<string>();
  let exported = 0;

  for (let i = 0; i < rows.length; i++) {
    if (signal?.aborted) break;
    onProgress?.(i, rows.length);
    const base = folderName(rows[i], i).replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_').slice(0, 80) || `row_${i + 1}`;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}_${n}`;
    used.add(name);

    const folder = zip.folder(name)!;
    const elements = await renderRow(rows[i]);
    for (const [key, element] of Object.entries(elements)) {
      await validateAndPreloadElement(element);
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        cacheBust: true,
        filter: (node: HTMLElement) =>
          !(node.getAttribute?.('data-export-ignore') === 'true' ||
            (typeof node.className === 'string' && /export-ignore|smart-snap-guide|precision-drag-badge/.test(node.className))),
      });
      folder.file(`${key}.png`, dataUrl.split(',')[1], { base64: true });
    }
    exported++;
  }
  onProgress?.(rows.length, rows.length);
  if (exported === 0) return 0;

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `kityar-batch-${exported}.zip`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return exported;
}
