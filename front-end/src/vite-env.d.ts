/**
 * Types for our own env variables (import.meta.env.VITE_*).
 * Vite inlines them at build time: they end up in the bundle, so never put secrets here.
 */
interface ImportMetaEnv {
  /** "true" = mock API in the browser, anything else = real back-end. */
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
