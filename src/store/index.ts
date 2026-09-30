import { get as idbGet, set as idbSet, createStore } from 'idb-keyval';
import { createStudioStore } from './studioStore';
import { loadDocument, saveDocument, startAutosave, type DocumentStore } from './persistence';
import { DEFAULT_INFOGRAPHIC_ROWS, getInitialTemplateLayers } from '../data/studioTemplates';

export * from './studioStore';

const local = (() => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
})();

const db: DocumentStore | undefined = (() => {
  try {
    if (typeof indexedDB === 'undefined') return undefined;
    const store = createStore('kityar', 'documents');
    return { get: (k) => idbGet(k, store), set: (k, v) => idbSet(k, v, store) };
  } catch {
    return undefined;
  }
})();

const defaultDocument = () => ({
  canvasLayers: getInitialTemplateLayers(),
  infographicRows: DEFAULT_INFOGRAPHIC_ROWS,
});

/** App-wide studio store. Starts with the default template until `hydrateStudioStore` resolves. */
export const useStudioStore = createStudioStore(defaultDocument());

type PersistErrorListener = (reason: 'quota' | 'unavailable') => void;
const persistErrorListeners = new Set<PersistErrorListener>();

/** Subscribe to autosave failures (e.g. storage full) so the UI can warn the user. */
export const onPersistError = (listener: PersistErrorListener) => {
  persistErrorListeners.add(listener);
  return () => {
    persistErrorListeners.delete(listener);
  };
};

let hydration: Promise<void> | null = null;

/**
 * Loads the saved document (IndexedDB, migrating older localStorage data) and starts autosave.
 * Await before first render so the user never edits a document that is about to be replaced.
 */
export const hydrateStudioStore = () =>
  (hydration ??= (async () => {
    const saved = await loadDocument(db, local, defaultDocument);
    if (saved) useStudioStore.getState().resetDocument(saved);
    startAutosave(
      (listener) => useStudioStore.subscribe((s, prev) => listener(s, prev)),
      () => {
        const { canvasLayers, infographicRows } = useStudioStore.getState();
        return { canvasLayers, infographicRows };
      },
      {
        save: (doc) => saveDocument(db, local, doc),
        onError: ({ reason }) => persistErrorListeners.forEach((l) => l(reason)),
      },
    );
  })());
