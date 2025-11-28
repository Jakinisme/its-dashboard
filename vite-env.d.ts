interface ImportMetaEnv {
  readonly VITE_WS_URL: string
  readonly VITE_METAMTX_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}