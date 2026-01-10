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
    const pageKeys = keys.filter(k => k.includes('/page') || k.startsWith('nextjs:/'));
    const tagKeys = keys.filter(k => k.includes('__revalidated_tags__'));
    const otherKeys = keys.filter(k => !pageKeys.includes(k) && !tagKeys.includes(k));

    // Get memory info
    const memoryInfo = await client.info('memory');
    const memoryUsed = memoryInfo.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';

    // Get Redis stats
    const dbSize = await client.dbSize();

    // Sample some key details (first 10 page keys)
    const keyDetails = await Promise.all(
      pageKeys.slice(0, 10).map(async (key) => {
        const ttl = await client!.ttl(key);
        const type = await client!.type(key);
        return {
          key: key.replace('nextjs:', ''),
          ttl: ttl > 0 ? `${ttl}s` : ttl === -1 ? 'no expiry' : 'expired',
          type
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
