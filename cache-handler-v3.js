const { CacheHandler } = require('@fortedigital/nextjs-cache-handler');
const { createClient } = require('redis');
const createRedisStringsHandler = require('@fortedigital/nextjs-cache-handler/redis-strings').default;
const createLocalLruHandler = require('@fortedigital/nextjs-cache-handler/local-lru').default;
const createCompositeHandler = require('@fortedigital/nextjs-cache-handler/composite').default;

// Global variable to ensure single Redis connection instance
let client;

/**
 * Initialize Redis client with connection handling
 */
async function createRedisClient() {
  if (client) {
    return client;
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

  if (!redisUrl) {
    console.warn('[Redis v3] No REDIS_URL or KV_URL found, using LRU cache only');
    return null;
  }

  try {
    client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('[Redis v3] Max retries reached');
            return new Error('Max retries reached');
          }
          const delay = Math.min(retries * 50, 2000);
          console.log(`[Redis v3] Reconnecting in ${delay}ms...`);
          return delay;
        },
      },
    });

    client.on('error', (err) => {
      console.error('[Redis v3] Client error:', err.message);
    });

    client.on('connect', () => {
      console.log('[Redis v3] Connected successfully');
    });

    client.on('ready', () => {
      console.log('[Redis v3] Ready to accept commands');
    });

    client.on('reconnecting', () => {
      console.log('[Redis v3] Reconnecting...');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('[Redis v3] Failed to initialize:', error.message);
    return null;
  }
}

/**
 * Create cache handler configuration with Redis (production) and LRU (development/fallback)
 */
async function createCacheHandlerConfig() {
  const redisClient = await createRedisClient();

  // Create LRU handler for development/fallback
  const lruHandler = createLocalLruHandler({
    maxItemsNumber: 1000, // Maximum number of items in LRU cache
    maxItemSizeBytes: 1024 * 1024 * 50, // 50MB per item
  });

  // If Redis is available, create Redis handler
  if (redisClient) {
    console.log('[Cache v3] Configuring Redis + LRU handlers');

    const redisHandler = createRedisStringsHandler({
      client: redisClient,
      keyPrefix: 'nextjs:', // Prefix for all Redis keys
      sharedTagsKey: '__sharedTags__', // Key for shared tags
      revalidateTagQuerySize: 10000, // Tag query size for large deployments
      timeoutMs: 5000, // Timeout for Redis operations
    });

    // Return config with both handlers (Redis is tried first, then LRU)
    return {
      handlers: [redisHandler, lruHandler],
    };
  } else {
    // Fallback to LRU only if Redis is not available
    console.log('[Cache v3] Configuring LRU handler only (Redis unavailable)');
    return {
      handlers: [lruHandler],
    };
  }
}

/**
 * Export CacheHandler for Next.js
 * Next.js will call CacheHandler.onCreation() during initialization
 */
module.exports = CacheHandler;

CacheHandler.onCreation(() => createCacheHandlerConfig());

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    console.log('[Redis v3] Disconnecting...');
    await client.quit();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (client) {
    console.log('[Redis v3] Disconnecting...');
    await client.quit();
  }
  process.exit(0);
});
