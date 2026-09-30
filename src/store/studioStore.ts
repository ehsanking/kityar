import { create } from 'zustand';
import type { CanvasLayerItem } from '../types/canvasLayers';
import type { InfographicRowData } from '../components/SortableInfographicRow';

export type CanvasLayersMap = Record<string, CanvasLayerItem[]>;

/** The undoable part of the studio: everything that makes up the user's design. */
export interface StudioDocument {
  canvasLayers: CanvasLayersMap;
  infographicRows: InfographicRowData[];
}

export type Updater<T> = T | ((prev: T) => T);

export interface CommitOptions {
  /**
   * Consecutive commits with the same key inside COALESCE_WINDOW_MS collapse into one
   * history entry (slider drags, typing, nudging with arrow keys).
   */
  coalesceKey?: string;
  /** Set false for changes that must not be undoable (e.g. restoring a saved project). */
  history?: boolean;
}

export const HISTORY_LIMIT = 100;
export const COALESCE_WINDOW_MS = 800;

interface StudioState extends StudioDocument {
  past: StudioDocument[];
  future: StudioDocument[];
  setCanvasLayers: (updater: Updater<CanvasLayersMap>, options?: CommitOptions) => void;
  setInfographicRows: (updater: Updater<InfographicRowData[]>, options?: CommitOptions) => void;
  /** Runs several commits as a single undo step. Nested calls join the outer transaction. */
  transaction: (fn: () => void) => void;
  undo: () => boolean;
  redo: () => boolean;
  /** Replaces the document and wipes history (initial load, project import). */
  resetDocument: (doc: StudioDocument) => void;
}

const resolve = <T,>(updater: Updater<T>, prev: T): T =>
  typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;

const pickDocument = (s: StudioDocument): StudioDocument => ({
  canvasLayers: s.canvasLayers,
  infographicRows: s.infographicRows,
});

const pushBounded = (stack: StudioDocument[], doc: StudioDocument): StudioDocument[] => {
  const next = stack.length >= HISTORY_LIMIT ? stack.slice(stack.length - HISTORY_LIMIT + 1) : stack.slice();
  next.push(doc);
  return next;
};

/**
 * Creates an isolated store instance. The app uses the `useStudioStore` singleton;
 * tests create their own instances.
 *
 * History relies on immutable updates: snapshots are references to previous document
 * objects (structural sharing), never deep clones, so large base64 images cost nothing
 * per step.
 */
export const createStudioStore = (initial: StudioDocument, now: () => number = Date.now) => {
  let lastCommit: { key: string; at: number } | null = null;
  let transactionDepth = 0;
  let transactionBase: StudioDocument | null = null;

  return create<StudioState>()((set, get) => {
    const commit = (patch: Partial<StudioDocument>, options: CommitOptions = {}) => {
      const state = get();
      const changed = (Object.keys(patch) as (keyof StudioDocument)[]).some((k) => patch[k] !== state[k]);
      if (!changed) return;

      if (options.history === false) {
        set(patch);
        return;
      }

      if (transactionDepth > 0) {
        // The pre-transaction snapshot is pushed once when the transaction ends.
        set(patch);
        return;
      }

      const t = now();
      const coalesce =
        options.coalesceKey !== undefined &&
        lastCommit !== null &&
        lastCommit.key === options.coalesceKey &&
        t - lastCommit.at < COALESCE_WINDOW_MS &&
        state.past.length > 0;

      lastCommit = options.coalesceKey !== undefined ? { key: options.coalesceKey, at: t } : null;

      if (coalesce) {
        set({ ...patch, future: [] });
      } else {
        set({ ...patch, past: pushBounded(state.past, pickDocument(state)), future: [] });
      }
    };

    return {
      ...initial,
      past: [],
      future: [],

      setCanvasLayers: (updater, options) =>
        commit({ canvasLayers: resolve(updater, get().canvasLayers) }, options),

      setInfographicRows: (updater, options) =>
        commit({ infographicRows: resolve(updater, get().infographicRows) }, options),

      transaction: (fn) => {
        if (transactionDepth === 0) transactionBase = pickDocument(get());
        transactionDepth += 1;
        try {
          fn();
        } finally {
          transactionDepth -= 1;
          if (transactionDepth === 0 && transactionBase) {
            const base = transactionBase;
            transactionBase = null;
            lastCommit = null;
            const state = get();
            if (state.canvasLayers !== base.canvasLayers || state.infographicRows !== base.infographicRows) {
              set({ past: pushBounded(state.past, base), future: [] });
            }
          }
        }
      },

      undo: () => {
        const { past, future } = get();
        if (past.length === 0) return false;
        const previous = past[past.length - 1];
        lastCommit = null;
        set({ ...previous, past: past.slice(0, -1), future: [pickDocument(get()), ...future] });
        return true;
      },

      redo: () => {
        const { past, future } = get();
        if (future.length === 0) return false;
        const [next, ...rest] = future;
        lastCommit = null;
        set({ ...next, past: pushBounded(past, pickDocument(get())), future: rest });
        return true;
      },

      resetDocument: (doc) => {
        lastCommit = null;
        set({ ...doc, past: [], future: [] });
      },
    };
  });
};

export type StudioStore = ReturnType<typeof createStudioStore>;
