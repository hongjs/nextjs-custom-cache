const { createClient } = require('redis');
const { promisify } = require('util');
const zlib = require('zlib');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// --- Helper Functions ---

const REVALIDATED_TAGS_KEY = "nextjs:__revalidated_tags__";
const SHARED_TAGS_KEY = "nextjs:__sharedTags__";
const NEXT_CACHE_IMPLICIT_TAG_ID = "_N_T_";

function isImplicitTag(tag) {
  return tag.startsWith(NEXT_CACHE_IMPLICIT_TAG_ID);
}

// Simple LRU Cache Implementation for Fallback
class LRUCache {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Refresh item
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove oldest (first)
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Global state for Redis client to share across instances
let redisClientInstance = null;
let isRedisAvailable = false;
// Global fallback cache
const localCache = new LRUCache(1000);

async function getRedisClient() {
  if (redisClientInstance) return redisClientInstance;

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    console.warn('[CacheHandler] No REDIS_URL found. Using LRU fallback.');
    return null;
  }

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
          reconnectStrategy: (retries) => {
              if (retries > 5) return new Error('Max retries negotiation');
              return Math.min(retries * 50, 1000);
          }
      }
    });

    client.on('error', (err) => {
        // console.error('[CacheHandler] Redis Client Error', err.message);
    });

    await client.connect();
    console.log('[CacheHandler] Connected to Redis.');
    isRedisAvailable = true;
    redisClientInstance = client;
    return client;
  } catch (err) {
    console.error('[CacheHandler] Failed to connect to Redis:', err.message);
    return null;
  }
}

// Initialize Redis connection slightly eagerly
getRedisClient().catch(() => {});


class CacheHandler {
  constructor(options) {
    this.options = options || {};
    this.keyPrefix = "nextjs-v7:"; // Version bump for Base64+Compression
  }

  async get(key, ctx = {}) {
    const { implicitTags } = ctx;

    // Try Redis first
    if (isRedisAvailable && redisClientInstance?.isReady) {
      try {
        // Get as string (Base64 encoded compressed data)
        const result = await redisClientInstance.get(this.keyPrefix + key);
        if (!result) return null;

        // Base64 Decode -> Decompress
        const compressedBuffer = Buffer.from(result, 'base64');
        const decompressed = await gunzip(compressedBuffer);
        const cacheValue = JSON.parse(decompressed.toString());

        if (!cacheValue || !cacheValue.value) return null;

        // Convert Buffer strings back to Buffer objects
        this.convertStringsToBuffers(cacheValue);

        // Check Tags
        const tagsToCheck = [...(cacheValue.tags || []), ...(implicitTags || [])];
        
        if (tagsToCheck.length > 0) {
            // Check if any tag is revalidated
            const revalidationTimes = await redisClientInstance.hmGet(
                REVALIDATED_TAGS_KEY, 
                tagsToCheck
            );
            
            for (let i = 0; i < revalidationTimes.length; i++) {
                const timeString = revalidationTimes[i];
                if (timeString && parseInt(timeString, 10) > cacheValue.lastModified) {
                     // Tag has been updated more recently than the cache entry
                     return null;
                }
            }
        }
        
        return cacheValue;

      } catch (err) {
        console.error(`[CacheHandler] Redis get error for ${key}:`, err.message);
        return null; 
      }
    }

    // Fallback: LRU Cache
    return localCache.get(key);
  }

  async set(key, data, ctx = {}) {
    let rawValue = data;
    let tags = ctx?.tags || [];
    let lifespan = ctx?.lifespan;

    if (data.value && data.kind === undefined) {
        // It's a wrapper object
        rawValue = data.value;
        if (data.tags) tags = data.tags;
        if (data.lifespan) lifespan = data.lifespan;
    }

    // Auto-add implicit tag for page routes if missing
    if ((!tags || tags.length === 0) && key.startsWith('/')) {
        tags = [`${NEXT_CACHE_IMPLICIT_TAG_ID}${key}`];
    }

    // Use shallow clone to avoid mutating the original data
    const valueForStorage = rawValue ? { ...rawValue } : null;

    if (!valueForStorage) {
        return;
    }

    const cacheEntry = {
        value: valueForStorage,
        lastModified: Date.now(),
        tags: tags,
        lifespan: lifespan
    };

    if (valueForStorage) {
        this.parseBuffersToStrings({ ...cacheEntry, value: valueForStorage });
    }

    if (isRedisAvailable && redisClientInstance?.isReady) {
        try {
            const multi = redisClientInstance.multi();
            const serialized = JSON.stringify(cacheEntry);
            
            // Compress -> Base64
            const compressedBuffer = await gzip(serialized);
            const compressedBase64 = compressedBuffer.toString('base64');
            
            // Expiration
            if (data.lifespan && data.lifespan.expireAt) {
                // EXAT takes timestamp in seconds
                multi.set(this.keyPrefix + key, compressedBase64, { EXAT: data.lifespan.expireAt });
            } else {
                multi.set(this.keyPrefix + key, compressedBase64);
            }
            
            await multi.exec();
            return;
        } catch (err) {
            console.error(`[CacheHandler] Redis set error for ${key}:`, err.message);
        }
    }

    localCache.set(key, data);
  }

  async revalidateTag(tag) {
    if (isRedisAvailable && redisClientInstance?.isReady) {
        try {
            await redisClientInstance.hSet(REVALIDATED_TAGS_KEY, { [tag]: Date.now().toString() });
            return;
        } catch (err) {
            console.error(`[CacheHandler] Redis revalidateTag error for ${tag}:`, err.message);
        }
    }
    for (const [key, val] of localCache.cache.entries()) {
        if (val.tags?.includes(tag)) {
            localCache.cache.delete(key);
        }
    }
  }

  // --- Helpers for Buffer Handling ---
  parseBuffersToStrings(cacheHandlerValue) {
    if (!cacheHandlerValue?.value) return;
    const value = cacheHandlerValue.value;
    if (value.kind === "APP_ROUTE" && value.body) {
         value.body = Buffer.from(value.body).toString("base64");
    } else if (value.kind === "APP_PAGE") {
        if (value.rscData) value.rscData = Buffer.from(value.rscData).toString("base64");
        if (value.segmentData) {
             const segmentDataObj = {};
             for (const [k, v] of (value.segmentData instanceof Map ? value.segmentData : Object.entries(value.segmentData))) {
                 segmentDataObj[k] = Buffer.from(v).toString("base64");
             }
             value.segmentData = segmentDataObj;
        }
    }
  }

  convertStringsToBuffers(cacheValue) {
      if (!cacheValue?.value) return;
      const value = cacheValue.value;
      if (value.kind === "APP_ROUTE" && typeof value.body === 'string') {
          value.body = Buffer.from(value.body, "base64");
      } else if (value.kind === "APP_PAGE") {
          if (typeof value.rscData === 'string') {
              value.rscData = Buffer.from(value.rscData, "base64");
          }
          if (value.segmentData && typeof value.segmentData === 'object') {
              const segmentDataMap = new Map();
              for (const [k, v] of Object.entries(value.segmentData)) {
                  segmentDataMap.set(k, Buffer.from(v, "base64"));
              }
              value.segmentData = segmentDataMap;
          }
      }
  }
}

module.exports = CacheHandler;
