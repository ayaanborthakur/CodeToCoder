/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  // Add all VITE_ prefixed variables here for type safety
  readonly VITE_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;

  // Add other VITE_ variables if you have them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}