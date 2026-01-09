const { CacheHandler } = require("@neshca/cache-handler");
const createRedisHandler = require("@neshca/cache-handler/redis-stack").default;
const createLruHandler = require("@neshca/cache-handler/local-lru").default;
const { createClient } = require("redis");
const { PHASE_PRODUCTION_BUILD } = require("next/constants");

/* from https://caching-tools.github.io/next-shared-cache/redis */
CacheHandler.onCreation(async () => {
  let client;
  // use redis client during build could cause issue https://github.com/caching-tools/next-shared-cache/issues/284#issuecomment-1919145094
  if (PHASE_PRODUCTION_BUILD !== process.env.NEXT_PHASE) {
    try {
      // Create a Redis client.
      client = createClient({
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
      });

      // Redis won't work without error handling.
      // NB do not throw exceptions in the redis error listener,
      // because it will prevent reconnection after a socket exception.
      client.on("error", (e) => {
        if (typeof process.env.NEXT_PRIVATE_DEBUG_CACHE !== "undefined") {
          console.warn("Redis error", e);
        }
      });
    } catch (error) {
      console.warn("Failed to create Redis client:", error);
    }
  }
 

  if (client) {
    try {
      console.info("Connecting Redis client...");

      // Wait for the client to connect with a timeout
      const connectionTimeout = 5000; // 5 seconds timeout
      await Promise.race([
        client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis connection timeout")), connectionTimeout)
        ),
      ]);
      console.info("Redis client connected.");
    } catch (error) {
      console.warn("Failed to connect Redis client:", error.message);

      console.warn("Disconnecting the Redis client...");
      // Try to disconnect the client to stop it from reconnecting.
      try {
        await client.disconnect();
        console.info("Redis client disconnected.");
      } catch (disconnectError) {
        console.warn("Failed to disconnect the Redis client after failing to connect.");
      }
      // Set client to null so we don't try to use it
      client = null;
    }
  }

  /** @type {import("@neshca/cache-handler").Handler | null} */
  let redisHandler = null;
  if (client?.isReady) {
    // Create the `redis-stack` Handler if the client is available and connected.
    const baseRedisHandler = await createRedisHandler({
      client,
      keyPrefix: "prefix:",
      timeoutMs: 1000,
    });

    // Wrap Redis handler with logging
    redisHandler = {
      name: baseRedisHandler.name,
      get: async (key) => {
        const result = await baseRedisHandler.get(key);
        if (result) {
          console.log(`[Cache] Redis HIT: ${key}`);
        } else {
          console.log(`[Cache] Redis MISS: ${key}`);
        }
        return result;
      },
      set: async (key, value) => {
        console.log(`[Cache] Redis SET: ${key}`);
        return baseRedisHandler.set(key, value);
      },
      delete: async (key) => {
        console.log(`[Cache] Redis DELETE: ${key}`);
        return baseRedisHandler.delete(key);
      },
      revalidateTag: baseRedisHandler.revalidateTag ? async (tag) => {
        console.log(`[Cache] Redis REVALIDATE_TAG: ${tag}`);
        return baseRedisHandler.revalidateTag(tag);
      } : undefined,
    };
  }

  // Fallback to LRU handler if Redis client is not available.
  // The application will still work, but the cache will be in memory only and not shared.
  const baseLRUHandler = createLruHandler({
    maxItemsNumber: 1000,        // Maximum number of cached items (default: 1000)
    maxItemSizeBytes: 1024 * 1024 * 100, // 100 MB per item (default: 100 MB)
  });

  // Wrap LRU handler with logging
  const LRUHandler = {
    name: baseLRUHandler.name,
    get: async (key) => {
      const result = await baseLRUHandler.get(key);
      if (result) {
        console.log(`[Cache] LRU HIT: ${key}`);
      } else {
        console.log(`[Cache] LRU MISS: ${key}`);
      }
      return result;
    },
    set: async (key, value) => {
      console.log(`[Cache] LRU SET: ${key}`);
      return baseLRUHandler.set(key, value);
    },
    delete: async (key) => {
      console.log(`[Cache] LRU DELETE: ${key}`);
      return baseLRUHandler.delete(key);
    },
    revalidateTag: baseLRUHandler.revalidateTag ? async (tag) => {
      console.log(`[Cache] LRU REVALIDATE_TAG: ${tag}`);
      return baseLRUHandler.revalidateTag(tag);
    } : undefined,
  };

  // Use ONLY ONE handler at a time: Redis if available, otherwise LRU
  let handlers;
  if (redisHandler) {
    handlers = [redisHandler];
    console.info("Cache handler configured: Redis Handler (primary)");
  } else {
    handlers = [LRUHandler];
    console.warn("Falling back to LRU handler because Redis client is not available.");
    console.info("Cache handler configured: LRU Handler (in-memory fallback)");
  }

  return {
    handlers,
  };
});

module.exports = CacheHandler;