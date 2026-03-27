// Central API base URL — in dev the Vite proxy handles /api → localhost:4000
// In production set VITE_API_URL to your Railway server URL (no trailing slash)
export const API_BASE = import.meta.env.VITE_API_URL ?? '';
