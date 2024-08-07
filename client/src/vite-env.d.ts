/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_PROD: string
  readonly VITE_WEBSOCKET_PROD: string
  readonly VITE_BACKEND_DEV: string
  readonly VITE_WEBSOCKET_DEV: string
  readonly VITE_TURN_USERNAME: string
  readonly VITE_TURN_CREDENTIAL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}