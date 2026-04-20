interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    return this.store.size;
  }
}

export const cache = new TtlCache();

export const CACHE_TTL = {
  LISTING: 30_000,
  DETAIL: 60_000,
  GALLERY: 30_000,
} as const;

export const CACHE_PREFIX = {
  PETS_LIST: "pets:list:",
  PETS_FEATURED: "pets:featured",
  PET_DETAIL: "pets:detail:",
  GALLERY_LIST: "gallery:list:",
} as const;
