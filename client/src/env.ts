export const ENV_VARIABLES = {
  BACKEND: import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_DEV : import.meta.env.VITE_BACKEND_PROD,
  WEBSOCKET: import.meta.env.MODE === "development" ? import.meta.env.VITE_WEBSOCKET_DEV : import.meta.env.VITE_WEBSOCKET_PROD
}