const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

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


class RedisCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
    this.redis = getRedisClient();
    // Fallback to in-memory if Redis unavailable
    this.memStore = new Map();
  }

  async get(key, options = {}) {
    // Try Redis first
    if (this.redis && isRedisConnected()) {
      try {
        const cached = await this.redis.get(`nextjs:${key}`);
        if (cached) {
          return JSON.parse(cached);
        }
        return null;
      } catch (error) {
        console.error("[Cache] Redis get error:", error.message);
      }
    }

    // Fallback to in-memory store
    return this.memStore.get(key) ?? null;
  }

  async set(key, data, ctx) {
    // Try Redis first
    if (this.redis && isRedisConnected()) {
      try {
        const ttl = (ctx?.revalidate && typeof ctx.revalidate === "number") ? ctx.revalidate : 3600;
        await this.redis.setex(`nextjs:${key}`, ttl, JSON.stringify(data));
        return;
      } catch (error) {
        console.error("[Cache] Redis set error:", error.message);
      }
    }

    // Fallback to in-memory store
    this.memStore.set(key, data);
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
