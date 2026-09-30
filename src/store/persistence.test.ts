import { afterEach, describe, expect, it, vi } from 'vitest';
import { DB_KEY, LEGACY_LAYERS_KEY, LOCAL_V3_KEY, SCHEMA_VERSION, loadDocument, saveDocument, startAutosave, type DocumentStore, type StorageLike } from './persistence';
import type { StudioDocument } from './studioStore';

const memLocal = (seed: Record<string, string> = {}) => {
  const data = new Map(Object.entries(seed));
  const storage: StorageLike = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
  return { storage, data };
};
const memDb = () => {
  const data = new Map<string, unknown>();
  const db: DocumentStore = { get: async (k) => data.get(k), set: async (k, v) => void data.set(k, v) };
  return { db, data };
};
const quota = () => Object.assign(new Error('full'), { name: 'QuotaExceededError' });

const doc: StudioDocument = { canvasLayers: { cover: [{ id: 'a' } as any] }, infographicRows: [{ id: 'r1', title: '', desc: '', items: [] }] };
const fallback = (): StudioDocument => ({ canvasLayers: { cover: [] }, infographicRows: [{ id: 'default', title: '', desc: '', items: [] }] });

describe('loadDocument', () => {
  it('returns null when nothing is stored', async () => {
    expect(await loadDocument(memDb().db, memLocal().storage, fallback)).toBeNull();
    expect(await loadDocument(undefined, undefined, fallback)).toBeNull();
  });

  it('round-trips through IndexedDB and clears old localStorage keys', async () => {
    const { db } = memDb();
    const { storage, data } = memLocal({ [LEGACY_LAYERS_KEY]: '{}', [LOCAL_V3_KEY]: '{}' });
    expect(await saveDocument(db, storage, doc)).toEqual({ ok: true });
    expect(data.size).toBe(0);
    expect(await loadDocument(db, storage, fallback)).toEqual(doc);
  });

  it('migrates localStorage v3 JSON and legacy v2 layers', async () => {
    const v3 = memLocal({ [LOCAL_V3_KEY]: JSON.stringify({ version: SCHEMA_VERSION, ...doc }) });
    expect(await loadDocument(memDb().db, v3.storage, fallback)).toEqual(doc);
    const v2 = memLocal({ [LEGACY_LAYERS_KEY]: JSON.stringify(doc.canvasLayers) });
    expect(await loadDocument(memDb().db, v2.storage, fallback)).toEqual({ canvasLayers: doc.canvasLayers, infographicRows: fallback().infographicRows });
  });

  it('prefers IndexedDB over localStorage', async () => {
    const { db, data } = memDb();
    data.set(DB_KEY, { version: SCHEMA_VERSION, ...doc });
    const { storage } = memLocal({ [LEGACY_LAYERS_KEY]: JSON.stringify({ other: [] }) });
    expect(await loadDocument(db, storage, fallback)).toEqual(doc);
  });

  it.each([
    ['wrong version', { version: 99, ...doc }],
    ['layers not arrays', { version: SCHEMA_VERSION, canvasLayers: { cover: 'x' } }],
    ['layer without id', { version: SCHEMA_VERSION, canvasLayers: { cover: [{}] } }],
  ])('rejects corrupt records (%s)', async (_l, record) => {
    const { db, data } = memDb();
    data.set(DB_KEY, record);
    expect(await loadDocument(db, memLocal({ [LOCAL_V3_KEY]: '{bad' }).storage, fallback)).toBeNull();
  });

  it('falls back to localStorage when IndexedDB throws, and never throws itself', async () => {
    const db: DocumentStore = { get: async () => { throw new Error('blocked'); }, set: async () => {} };
    const storage: StorageLike = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => {}, removeItem: () => {} };
    expect(await loadDocument(db, storage, fallback)).toBeNull();
    expect(await loadDocument(db, memLocal({ [LEGACY_LAYERS_KEY]: JSON.stringify(doc.canvasLayers) }).storage, fallback)).not.toBeNull();
  });
});

describe('saveDocument', () => {
  it('reports quota and unavailable errors', async () => {
    const db: DocumentStore = { get: async () => undefined, set: async () => { throw quota(); } };
    expect(await saveDocument(db, undefined, doc)).toEqual({ ok: false, reason: 'quota' });
    expect(await saveDocument(undefined, undefined, doc)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('uses localStorage only when IndexedDB is missing', async () => {
    const { storage, data } = memLocal();
    await saveDocument(undefined, storage, doc);
    expect(JSON.parse(data.get(LOCAL_V3_KEY)!).canvasLayers).toEqual(doc.canvasLayers);
  });
});

describe('startAutosave', () => {
  afterEach(() => vi.useRealTimers());

  const harness = (save: (d: StudioDocument) => Promise<any>, onError?: (r: any) => void) => {
    let current = doc;
    const listeners = new Set<(d: StudioDocument, p: StudioDocument) => void>();
    const stop = startAutosave((l) => { listeners.add(l); return () => listeners.delete(l); }, () => current, { save, delayMs: 100, onError });
    const change = (next: StudioDocument) => { const prev = current; current = next; listeners.forEach((l) => l(current, prev)); };
    return { change, stop };
  };

  it('debounces bursts into one write and flushes on stop', async () => {
    vi.useFakeTimers();
    const save = vi.fn(async (_d: StudioDocument) => ({ ok: true }) as const);
    const { change, stop } = harness(save);
    for (let i = 0; i < 10; i++) change({ ...doc, canvasLayers: { [`k${i}`]: [] } });
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(save).toHaveBeenCalledTimes(1);
    change({ ...doc, infographicRows: [] });
    await stop();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1][0].infographicRows).toEqual([]);
  });

  it('serializes writes so the newest snapshot lands last', async () => {
    vi.useFakeTimers();
    const written: StudioDocument[] = [];
    let slow = true;
    const save = async (d: StudioDocument) => {
      if (slow) { slow = false; await new Promise((r) => setTimeout(r, 1000)); }
      written.push(d);
      return { ok: true } as const;
    };
    const { change, stop } = harness(save);
    const first = { ...doc, infographicRows: [] };
    const second = { ...doc, canvasLayers: {} };
    change(first);
    await vi.advanceTimersByTimeAsync(100);
    change(second);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(1000);
    await stop();
    expect(written).toEqual([first, second]);
  });

  it('reports a repeated failure only once until a save succeeds', async () => {
    vi.useFakeTimers();
    let fail = true;
    const onError = vi.fn();
    const { change } = harness(async () => (fail ? { ok: false, reason: 'quota' } : { ok: true }), onError);
    change({ ...doc, infographicRows: [] });
    await vi.advanceTimersByTimeAsync(100);
    change({ ...doc, canvasLayers: {} });
    await vi.advanceTimersByTimeAsync(100);
    expect(onError).toHaveBeenCalledTimes(1);
    fail = false;
    change({ ...doc });
    await vi.advanceTimersByTimeAsync(100);
    fail = true;
    change({ ...doc, infographicRows: [] });
    await vi.advanceTimersByTimeAsync(100);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
