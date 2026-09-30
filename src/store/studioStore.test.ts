import { describe, expect, it } from 'vitest';
import { COALESCE_WINDOW_MS, HISTORY_LIMIT, createStudioStore, type StudioDocument } from './studioStore';
import type { CanvasLayerItem } from '../types/canvasLayers';

const layer = (id: string, extra: Partial<CanvasLayerItem> = {}): CanvasLayerItem =>
  ({ id, name: id, type: 'text', visible: true, locked: false, zIndex: 10, scale: 1, rotation: 0, opacity: 100, x: 0, y: 0, data: {}, ...extra }) as CanvasLayerItem;

const initialDoc = (): StudioDocument => ({
  canvasLayers: { cover: [layer('a')] },
  infographicRows: [{ id: 'r1', title: 't', desc: 'd', items: [] }],
});

const setup = () => {
  let clock = 1_000;
  const store = createStudioStore(initialDoc(), () => clock);
  const advance = (ms: number) => {
    clock += ms;
  };
  return { store, advance, s: () => store.getState() };
};

const setX = (x: number) => (prev: StudioDocument['canvasLayers']) => ({ ...prev, cover: [{ ...prev.cover[0], x }] });

describe('studio store history', () => {
  it('records each commit and undoes/redoes it', () => {
    const { s } = setup();
    s().setCanvasLayers(setX(10));
    s().setCanvasLayers(setX(20));
    expect(s().past).toHaveLength(2);

    expect(s().undo()).toBe(true);
    expect(s().canvasLayers.cover[0].x).toBe(10);
    expect(s().undo()).toBe(true);
    expect(s().canvasLayers.cover[0].x).toBe(0);
    expect(s().undo()).toBe(false);

    expect(s().redo()).toBe(true);
    expect(s().redo()).toBe(true);
    expect(s().canvasLayers.cover[0].x).toBe(20);
    expect(s().redo()).toBe(false);
  });

  it('keeps structural sharing: snapshots are the previous objects, not clones', () => {
    const { s } = setup();
    const before = s().canvasLayers;
    s().setCanvasLayers(setX(5));
    expect(s().past[0].canvasLayers).toBe(before);
  });

  it('ignores no-op updates (same reference)', () => {
    const { s } = setup();
    s().setCanvasLayers((prev) => prev);
    expect(s().past).toHaveLength(0);
  });

  it('clears the redo stack on a new commit', () => {
    const { s } = setup();
    s().setCanvasLayers(setX(1));
    s().undo();
    expect(s().future).toHaveLength(1);
    s().setCanvasLayers(setX(2));
    expect(s().future).toHaveLength(0);
  });

  it('coalesces same-key commits within the window into one step', () => {
    const { s, advance } = setup();
    for (let i = 1; i <= 20; i++) {
      s().setCanvasLayers(setX(i), { coalesceKey: 'drag:a' });
      advance(50);
    }
    expect(s().past).toHaveLength(1);
    s().undo();
    expect(s().canvasLayers.cover[0].x).toBe(0);
  });

  it('starts a new step when the key changes or the window elapses', () => {
    const { s, advance } = setup();
    s().setCanvasLayers(setX(1), { coalesceKey: 'k1' });
    s().setCanvasLayers(setX(2), { coalesceKey: 'k2' });
    advance(COALESCE_WINDOW_MS + 1);
    s().setCanvasLayers(setX(3), { coalesceKey: 'k2' });
    expect(s().past).toHaveLength(3);
  });

  it('does not coalesce across an undo', () => {
    const { s } = setup();
    s().setCanvasLayers(setX(1), { coalesceKey: 'k' });
    s().undo();
    s().setCanvasLayers(setX(2), { coalesceKey: 'k' });
    expect(s().past).toHaveLength(1);
    s().undo();
    expect(s().canvasLayers.cover[0].x).toBe(0);
  });

  it('groups a transaction into a single undo step across both slices', () => {
    const { s } = setup();
    s().transaction(() => {
      s().setCanvasLayers({ cover: [] });
      s().setInfographicRows([]);
      s().transaction(() => s().setCanvasLayers({ cover: [], logo: [] }));
    });
    expect(s().past).toHaveLength(1);
    s().undo();
    expect(s().canvasLayers.cover).toHaveLength(1);
    expect(s().infographicRows).toHaveLength(1);
  });

  it('records nothing for an empty transaction and survives a throwing one', () => {
    const { s } = setup();
    s().transaction(() => {});
    expect(s().past).toHaveLength(0);
    expect(() =>
      s().transaction(() => {
        s().setInfographicRows([]);
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(s().past).toHaveLength(1);
    s().setCanvasLayers(setX(9));
    expect(s().past).toHaveLength(2);
  });

  it('skips history when asked', () => {
    const { s } = setup();
    s().setCanvasLayers(setX(1), { history: false });
    expect(s().past).toHaveLength(0);
    expect(s().canvasLayers.cover[0].x).toBe(1);
  });

  it('caps history at HISTORY_LIMIT, dropping the oldest steps', () => {
    const { s } = setup();
    for (let i = 1; i <= HISTORY_LIMIT + 25; i++) s().setCanvasLayers(setX(i));
    expect(s().past).toHaveLength(HISTORY_LIMIT);
    while (s().undo());
    expect(s().canvasLayers.cover[0].x).toBe(25);
  });

  it('resetDocument replaces state and wipes history', () => {
    const { s } = setup();
    s().setCanvasLayers(setX(1));
    s().resetDocument({ canvasLayers: {}, infographicRows: [] });
    expect(s().past).toHaveLength(0);
    expect(s().future).toHaveLength(0);
    expect(s().canvasLayers).toEqual({});
  });
});
