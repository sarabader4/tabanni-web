import Redis from "ioredis";
import { pino } from "pino";

const log = pino({ name: "cache" });

interface CacheAdapter {
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  set<T>(key: string, value: T, ttlMs: number): Promise<void> | void;
  invalidatePrefix(prefix: string): Promise<void> | void;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache implements CacheAdapter {
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

class RedisCache implements CacheAdapter {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const ttlSec = Math.ceil(ttlMs / 1000);
    await this.client.set(key, JSON.stringify(value), "EX", ttlSec);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const pattern = `${prefix}*`;
    let cursor = "0";
    const keysToDelete: string[] = [];

    do {
      const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== "0");

    if (keysToDelete.length > 0) {
      await this.client.del(...keysToDelete);
    }
  }
}

class TtlCache {
  private adapter: CacheAdapter;

  constructor(adapter: CacheAdapter) {
    this.adapter = adapter;
  }

  get<T>(key: string): T | undefined | Promise<T | undefined> {
    return this.adapter.get<T>(key);
  }

  set<T>(key: string, value: T, ttlMs: number): void | Promise<void> {
    return this.adapter.set<T>(key, value, ttlMs);
  }

  invalidatePrefix(prefix: string): void | Promise<void> {
    return this.adapter.invalidatePrefix(prefix);
  }
}

function buildCache(): TtlCache {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    log.info("No REDIS_URL configured — using in-memory cache");
    return new TtlCache(new InMemoryCache());
  }

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
  });

  let connected = false;

  client.on("error", (err: Error) => {
    if (connected) {
      log.warn({ err: err.message }, "Redis connection error — falling back to in-memory cache");
    }
    connected = false;
  });

  client.on("ready", () => {
    log.info("Redis connected — using Redis cache");
    connected = true;
  });

  client
    .connect()
    .catch((err: Error) => {
      log.warn({ err: err.message }, "Redis initial connection failed — using in-memory cache as fallback");
    });

  const redisCache = new RedisCache(client);
  const fallback = new InMemoryCache();

  const guardedAdapter: CacheAdapter = {
    async get<T>(key: string): Promise<T | undefined> {
      if (!connected) return fallback.get<T>(key);
      try {
        return await redisCache.get<T>(key);
      } catch (err) {
        log.warn({ err: (err as Error).message, key }, "Redis get failed — using in-memory fallback");
        return fallback.get<T>(key);
      }
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      if (!connected) {
        fallback.set<T>(key, value, ttlMs);
        return;
      }
      try {
        await redisCache.set<T>(key, value, ttlMs);
      } catch (err) {
        log.warn({ err: (err as Error).message, key }, "Redis set failed — using in-memory fallback");
        fallback.set<T>(key, value, ttlMs);
      }
    },
    async invalidatePrefix(prefix: string): Promise<void> {
      if (!connected) {
        fallback.invalidatePrefix(prefix);
        return;
      }
      try {
        await redisCache.invalidatePrefix(prefix);
      } catch (err) {
        log.warn({ err: (err as Error).message, prefix }, "Redis invalidatePrefix failed — using in-memory fallback");
        fallback.invalidatePrefix(prefix);
      }
    },
  };

  return new TtlCache(guardedAdapter);
}

export const cache = buildCache();

export const CACHE_TTL = {
  LISTING: 300_000,
  DETAIL: 300_000,
  GALLERY: 120_000,
} as const;

export const CACHE_PREFIX = {
  PETS_LIST: "pets:list:",
  PETS_FEATURED: "pets:featured",
  PET_DETAIL: "pets:detail:",
  GALLERY_LIST: "gallery:list:",
} as const;
