/**
 * Backend origin for API calls.
 * - Production: set VITE_API_URL to your deployed server (e.g. https://talentscout-api.vercel.app) — no trailing slash.
 * - Local dev: leave unset; Vite proxies /api → http://localhost:5000 (see vite.config.js).
 */
const raw = import.meta.env.VITE_API_URL;
const origin = raw ? String(raw).replace(/\/$/, "") : "";

export const apiUrl = (path) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (origin) return `${origin}${p}`;
  return p;
};
