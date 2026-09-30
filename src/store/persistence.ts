import type { StudioDocument } from './studioStore';

export const SCHEMA_VERSION = 3;
/** IndexedDB record key (primary storage: structured clone, no JSON, far larger quota). */
export const DB_KEY = 'studio_document';
/** localStorage keys from earlier releases, migrated on first load then removed. */
export const LOCAL_V3_KEY = 'kityar_studio_document';
export const LEGACY_LAYERS_KEY = 'zhaket_studio_layers_v2';

export interface DocumentStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface PersistedDocument extends StudioDocument {
  version: number;
  savedAt: number;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const isLayersMap = (v: unknown): v is StudioDocument['canvasLayers'] =>
  isPlainObject(v) &&
  Object.values(v).every((list) => Array.isArray(list) && list.every((l) => isPlainObject(l) && typeof l.id === 'string'));

export const isRows = (v: unknown): v is StudioDocument['infographicRows'] =>
  Array.isArray(v) && v.every((r) => isPlainObject(r) && typeof r.id === 'string');

const safeParse = (raw: string | null | undefined): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const fromRecord = (v: unknown, fallback: () => StudioDocument): StudioDocument | null =>
  isPlainObject(v) && v.version === SCHEMA_VERSION && isLayersMap(v.canvasLayers)
    ? { canvasLayers: v.canvasLayers, infographicRows: isRows(v.infographicRows) ? v.infographicRows : fallback().infographicRows }
    : null;

const safeGetLocal = (local: StorageLike | undefined, key: string) => {
  try {
    return local?.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Loads the document: IndexedDB first, then older localStorage schemas (v3 JSON, v2 layers-only).
 * Returns null when nothing valid is stored. Never throws.
 */
export async function loadDocument(
  db: DocumentStore | undefined,
  local: StorageLike | undefined,
  fallback: () => StudioDocument,
): Promise<StudioDocument | null> {
  if (db) {
    try {
      const doc = fromRecord(await db.get(DB_KEY), fallback);
      if (doc) return doc;
    } catch {
      // IndexedDB unavailable (private mode, blocked) – fall through to localStorage.
    }
  }
  const v3 = fromRecord(safeParse(safeGetLocal(local, LOCAL_V3_KEY)), fallback);
  if (v3) return v3;
  const legacy = safeParse(safeGetLocal(local, LEGACY_LAYERS_KEY));
  return isLayersMap(legacy) ? { canvasLayers: legacy, infographicRows: fallback().infographicRows } : null;
}

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

const isQuotaError = (error: unknown) => {
  const name = (error as { name?: string } | null)?.name;
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
};

/** Saves to IndexedDB (localStorage only when IndexedDB is missing) and drops superseded local keys. */
export async function saveDocument(
  db: DocumentStore | undefined,
  local: StorageLike | undefined,
  doc: StudioDocument,
  now: () => number = Date.now,
): Promise<SaveResult> {
  const record: PersistedDocument = { version: SCHEMA_VERSION, savedAt: now(), ...doc };
  try {
    if (db) {
      await db.set(DB_KEY, record);
      try {
        local?.removeItem(LOCAL_V3_KEY);
        local?.removeItem(LEGACY_LAYERS_KEY);
      } catch {
        /* ignore */
      }
    } else if (local) {
      local.setItem(LOCAL_V3_KEY, JSON.stringify(record));
      local.removeItem(LEGACY_LAYERS_KEY);
    } else {
      return { ok: false, reason: 'unavailable' };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : 'unavailable' };
  }
}

/**
 * Debounced autosave; writes are serialized so an older snapshot never lands after a newer one.
 * Flushes on page hide. Returns a stop function that flushes pending changes.
 */
export function startAutosave(
  subscribe: (listener: (doc: StudioDocument, prev: StudioDocument) => void) => () => void,
  getDocument: () => StudioDocument,
  options: {
    save: (doc: StudioDocument) => Promise<SaveResult>;
    delayMs?: number;
    onError?: (result: Extract<SaveResult, { ok: false }>) => void;
  },
): () => Promise<void> {
  const { save, delayMs = 500, onError } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastReportedFailure: string | null = null;
  let chain: Promise<void> = Promise.resolve();

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const doc = getDocument();
    chain = chain.then(async () => {
      const result = await save(doc);
      if (!result.ok) {
        // Report each failure kind once until a save succeeds again, to avoid toast spam.
        if (lastReportedFailure !== result.reason) onError?.(result);
        lastReportedFailure = result.reason;
      } else {
        lastReportedFailure = null;
      }
    });
    return chain;
  };

  const unsubscribe = subscribe((doc, prev) => {
    if (doc.canvasLayers === prev.canvasLayers && doc.infographicRows === prev.infographicRows) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delayMs);
  });

  const onPageHide = () => {
    if (timer) flush();
  };
  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide);

  return async () => {
    unsubscribe();
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
    if (timer) await flush();
    else await chain;
  };
}
