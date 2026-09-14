/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HAVUZ_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
