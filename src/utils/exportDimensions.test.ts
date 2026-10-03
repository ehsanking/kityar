import { describe, expect, it, vi } from 'vitest';
import { getCapturePixelRatio, resizeCanvasToDimensions, type ExportDimensions } from './exportDimensions';

describe('export dimensions', () => {
  it('calculates the scale needed to reach the requested pixel dimensions', () => {
    expect(getCapturePixelRatio(380, 380, { width: 400, height: 400 })).toBeCloseTo(400 / 380);
    expect(getCapturePixelRatio(380, 279, { width: 450, height: 330 })).toBeCloseTo(450 / 380);
  });

  it('normalizes the rendered canvas to the exact requested dimensions', () => {
    const source = { width: 800, height: 600 } as HTMLCanvasElement;
    const drawImage = vi.fn();
    const context = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      drawImage,
    } as unknown as CanvasRenderingContext2D;
    const output = {
      width: 0,
      height: 0,
      getContext: () => context,
    } as unknown as HTMLCanvasElement;
    const target: ExportDimensions = { width: 450, height: 330 };

    expect(resizeCanvasToDimensions(source, target, () => output)).toBe(output);
    expect(output).toMatchObject({ width: 450, height: 330 });
    expect(context.imageSmoothingEnabled).toBe(true);
    expect(context.imageSmoothingQuality).toBe('high');
    expect(drawImage).toHaveBeenCalledWith(source, 0, 0, 450, 330);
  });

  it('keeps a canvas that already matches the target dimensions', () => {
    const source = { width: 80, height: 80 } as HTMLCanvasElement;
    const createCanvas = vi.fn();

    expect(resizeCanvasToDimensions(source, { width: 80, height: 80 }, createCanvas)).toBe(source);
    expect(createCanvas).not.toHaveBeenCalled();
  });

  it('rejects invalid source or target dimensions', () => {
    expect(() => getCapturePixelRatio(0, 80, { width: 80, height: 80 })).toThrow();
    expect(() => resizeCanvasToDimensions({ width: 80, height: 80 } as HTMLCanvasElement, { width: 0, height: 80 })).toThrow();
  });
});
