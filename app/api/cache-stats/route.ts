import { NextResponse } from 'next/server';
import { createClient, RedisClientType } from 'redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

  if (!redisUrl) {
    return NextResponse.json({
      redis: {
        connected: false,
        reason: 'No REDIS_URL configured',
        fallback: 'LRU in-memory cache'
      }
    });
  }

  let client: RedisClientType | undefined;
  try {
    client = createClient({ url: redisUrl });
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
    ]);

    // Get all Next.js cache keys
    const keys = await client.keys('nextjs:*');

    // Separate keys by type
    const pageKeys = keys.filter(k =>
      !k.includes('__revalidated_tags__') &&
      !k.includes('__sharedTags__') &&
      (k.includes(':/:') || k.includes('/page') || k.match(/:[a-f0-9]{40,}/))
    );
    const tagKeys = keys.filter(k => k.includes('__revalidated_tags__') || k.includes('__sharedTags__'));
    const otherKeys = keys.filter(k => !pageKeys.includes(k) && !tagKeys.includes(k));

    // Get memory info
    const memoryInfo = await client.info('memory');
    const memoryUsed = memoryInfo.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';

    // Get Redis stats
    const dbSize = await client.dbSize();

    // Sample some key details (first 30 Next.js keys, excluding internal tag keys)
    const displayKeys = keys.filter(k => !k.includes('__revalidated_tags__') && !k.includes('__sharedTags__'));
    const keyDetails = await Promise.all(
      displayKeys.slice(0, 30).map(async (key) => {
        const ttl = await client!.ttl(key);
        const type = await client!.type(key);

        // Get value to calculate size and extract metadata
        let size = 0;
        let valueInfo: any = {};

        try {
          const value = await client!.get(key);
          if (value) {
            size = Buffer.byteLength(value, 'utf8');

            // Try to parse cache metadata if it's our custom format
            try {
              const decompressed = require('zlib').gunzipSync(Buffer.from(value, 'base64'));
              const parsed = JSON.parse(decompressed.toString());

              if (parsed.lastModified) {
                valueInfo.lastModified = new Date(parsed.lastModified).toISOString();
              }
              if (parsed.tags) {
                valueInfo.tags = parsed.tags;
              }
              if (parsed.lifespan?.expireAt) {
                valueInfo.expireAt = new Date(parsed.lifespan.expireAt * 1000).toISOString();
              }
            } catch (e) {
              // Not our format or can't parse, skip
            }
          }
        } catch (e) {
          // Skip if can't get value
        }

        // Determine key category
        let category = 'other';
        const cleanKey = key.replace(/^nextjs(-v7)?:/, '');
        if (cleanKey.startsWith('/')) {
          category = 'page';
        } else if (cleanKey.match(/^[a-f0-9]{40,}$/)) {
          category = 'data/fetch';
        }

        return {
          key: cleanKey,
          fullKey: key,
          category,
          ttl: ttl > 0 ? `${ttl}s (${Math.floor(ttl / 60)}m)` : ttl === -1 ? 'no expiry' : 'expired',
          ttlSeconds: ttl,
          type,
          size: size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} bytes`,
          sizeBytes: size,
          ...valueInfo
        };
      })
    );

    await client.disconnect();

    return NextResponse.json({
      redis: {
        connected: true,
        url: redisUrl.replace(/:[^:]*@/, ':****@'), // Hide password
        memory: memoryUsed,
        totalKeys: dbSize,
      },
      cache: {
        nextjsKeys: keys.length,
        pageKeys: pageKeys.length,
        tagKeys: tagKeys.length,
        otherKeys: otherKeys.length,
      },
      keyDetails,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    if (client) {
      try { await client.disconnect(); } catch {}
    }

    return NextResponse.json({
      redis: {
        connected: false,
        error: error.message,
        fallback: 'LRU in-memory cache'
      },
      timestamp: new Date().toISOString()
    });
  }
}
