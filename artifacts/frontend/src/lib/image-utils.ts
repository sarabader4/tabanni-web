const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function resolveImageUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith("/api/")) return `${BASE}${url}`;
  return url;
}
