const Redis = require('ioredis');

let redisClient: any = null;
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
      retryStrategy(times: number) {
        if (times > 3) {
          console.error('[Redis] Max retries reached, falling back to Next.js default caching');
          isRedisAvailable = false;
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err: any) {
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

    redisClient.on('error', (err: any) => {
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

module.exports = {
  getRedisClient,
  isRedisConnected,
  disconnectRedis,
};
