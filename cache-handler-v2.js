const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

// Buffer serialization helpers based on @neshca/cache-handler
// See: https://github.com/fortedigital/nextjs-cache-handler

function parseBuffersToStrings(value) {
  if (!value) {
    return;
  }

  const kind = value.kind;

  if (kind === "FETCH") {
    // Handle FETCH data.body Buffer
    if (value.data?.body && Buffer.isBuffer(value.data.body)) {
      value.data.body = value.data.body.toString('base64');
      value.data.__bodyIsBase64 = true;
    }
  } else if (kind === "APP_ROUTE") {
    // Handle APP_ROUTE body Buffer
    if (value.body && Buffer.isBuffer(value.body)) {
      const bodyBase64 = value.body.toString('base64');
      value.body = bodyBase64;
      value.__bodyIsBase64 = true;
    }
  } else if (kind === "APP_PAGE") {
    // Handle APP_PAGE rscData Buffer
    if (value.rscData && Buffer.isBuffer(value.rscData)) {
      value.rscData = value.rscData.toString('base64');
      value.__rscDataIsBase64 = true;
    }

    // Handle APP_PAGE segmentData Map<string, Buffer>
    if (value.segmentData instanceof Map) {
      value.segmentData = Object.fromEntries(
        Array.from(value.segmentData.entries()).map(([key, val]) => [
          key,
          Buffer.isBuffer(val) ? val.toString('base64') : val
        ])
      );
      value.__segmentDataIsBase64 = true;
    }
  }
}

function convertStringsToBuffers(value) {
  if (!value) {
    return;
  }

  const kind = value.kind;

  if (kind === "FETCH") {
    // Restore FETCH data.body Buffer
    if (value.data?.__bodyIsBase64 && typeof value.data.body === 'string') {
      value.data.body = Buffer.from(value.data.body, 'base64');
      delete value.data.__bodyIsBase64;
    }
  } else if (kind === "APP_ROUTE") {
    // Restore APP_ROUTE body Buffer
    if (value.__bodyIsBase64 && typeof value.body === 'string') {
      value.body = Buffer.from(value.body, 'base64');
      delete value.__bodyIsBase64;
    }
  } else if (kind === "APP_PAGE") {
    // Restore APP_PAGE rscData Buffer
    if (value.__rscDataIsBase64 && typeof value.rscData === 'string') {
      value.rscData = Buffer.from(value.rscData, 'base64');
      delete value.__rscDataIsBase64;
    }

    // Restore APP_PAGE segmentData Map<string, Buffer>
    if (value.__segmentDataIsBase64 && typeof value.segmentData === 'object') {
      value.segmentData = new Map(
        Object.entries(value.segmentData).map(([key, val]) => [
          key,
          typeof val === 'string' ? Buffer.from(val, 'base64') : val
        ])
      );
      delete value.__segmentDataIsBase64;
    }
  }
}

function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

  if (!redisUrl) {
    console.warn('[Redis] No REDIS_URL or KV_URL found, falling back to Next.js default caching');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.error('[Redis] Max retries reached, falling back to Next.js default caching');
          isRedisAvailable = false;
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        console.warn('[Redis] Reconnect on error:', err.message);
        return true;
      },
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Ready to accept commands');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.warn('[Redis] Connection closed');
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to initialize:', error);
    return null;
  }
}

function isRedisConnected() {
  return isRedisAvailable && redisClient?.status === 'ready';
}

async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisAvailable = false;
  }
}

async function waitUntilReady(timeoutMs = 5000) {
  const start = Date.now();

  while (!isRedisConnected()) {
    console.log('waitUntilReady...')
    if (Date.now() - start > timeoutMs) {
      console.warn('[Redis] waitUntilReady timeout, falling back to memory cache');
      return false;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  return true;
}

class RedisCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
    this.redis = getRedisClient();
    // Fallback to in-memory if Redis unavailable
    this.memStore = new Map();
  }

  async get(key, ctx) {
    console.log(`[Cache] GET called - key=${key.substring(0, 50)}`);

    // Try Redis first
    await waitUntilReady();
    if (this.redis && isRedisConnected()) {
      try {
        const redisKey = `nextjs:${key}`;
        const cached = await this.redis.get(redisKey);

        if (cached) {
          const cacheHandlerValue = JSON.parse(cached);

          // Convert Buffers back if needed
          if (cacheHandlerValue?.value) {
            convertStringsToBuffers(cacheHandlerValue.value);
          }

          console.log(`[Redis] cache HIT, key=${key.substring(0, 50)}, kind=${cacheHandlerValue?.value?.kind}`);
          console.log(`[Redis] cacheHandlerValue has:`, Object.keys(cacheHandlerValue || {}));

          return cacheHandlerValue;
        }

        console.log(`[Redis] cache MISS, key=${key.substring(0, 50)}`);
      } catch (error) {
        console.error("[Cache] Redis get error:", error.message, error.stack);
      }
    }

    // Fallback to in-memory store
    const memData = this.memStore.get(key);
    if (memData) {
      console.log(`[MemCache] cache HIT, key=${key.substring(0, 50)}`);
      return memData;
    }

    console.log(`[Cache] MISS everywhere, key=${key.substring(0, 50)}`);
    return null;
  }

  async set(key, data, ctx) {
    console.log(`[Cache] SET called - key=${key.substring(0, 50)}, kind=${data?.kind}`);
    console.log(`[Cache] ctx:`, JSON.stringify(ctx || {}).substring(0, 150));

    const lastModified = Date.now();
    // Next.js 16 uses ctx.cacheControl.revalidate for APP_PAGE
    const revalidate = data?.revalidate
      || (ctx?.cacheControl?.revalidate && typeof ctx.cacheControl.revalidate === "number" ? ctx.cacheControl.revalidate : null)
      || (ctx?.revalidate && typeof ctx.revalidate === "number" ? ctx.revalidate : null);

    // Next.js 16 CacheHandlerValue structure
    const cacheHandlerValue = {
      lastModified,
      value: data,
    };

    // Try Redis first
    await waitUntilReady();
    if (this.redis && isRedisConnected()) {
      try {
        const ttl = revalidate || 60;
        const redisKey = `nextjs:${key}`;

        // Clone and convert Buffers to base64 strings for storage
        const valueToStore = JSON.parse(JSON.stringify(cacheHandlerValue));
        if (valueToStore?.value) {
          parseBuffersToStrings(valueToStore.value);
        }

        await this.redis.setex(redisKey, ttl, JSON.stringify(valueToStore));
        console.log(`[Redis] cache SET, key=${key.substring(0, 50)}, ttl=${ttl}s`);
        return;
      } catch (error) {
        console.error("[Cache] Redis set error:", error.message, error.stack);
      }
    }

    // Fallback to in-memory store
    this.memStore.set(key, cacheHandlerValue);
    console.log(`[MemCache] cache SET, key=${key.substring(0, 50)}`);
  }

  async revalidateTag(tag) {
    // Try Redis first
    if (this.redis && isRedisConnected()) {
      try {
        const keys = await this.redis.keys(`nextjs:*`);
        for (const key of keys) {
          const value = await this.redis.get(key);
          if (value) {
            const data = JSON.parse(value);
            if (data?.tags?.includes(tag)) {
              await this.redis.del(key);
            }
          }
        }
      } catch (error) {
        console.error("[Cache] Redis revalidateTag error:", error.message);
      }
    }

    // Fallback to in-memory store
    for (const [key, data] of this.memStore.entries()) {
      if (data?.tags?.includes(tag)) {
        this.memStore.delete(key);
      }
    }
  }
}

module.exports = RedisCacheHandler;
