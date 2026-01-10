import { NextResponse } from 'next/server';

/**
 * API Route with Internal fetch() - Tests Data Cache
 *
 * This endpoint demonstrates:
 * - Internal fetch() calls are cached by Custom Cache Handler
 * - Revalidate time controls cache duration
 * - Data Cache (different from Page Cache)
 */

export async function GET() {
  const startTime = Date.now();

  try {
    // This fetch will be cached for 60 seconds by the Cache Handler
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      next: {
        revalidate: 60,
        tags: ['api-posts']
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      cached: duration < 100, // Fast response indicates cache hit
      duration: `${duration}ms`,
      cacheStrategy: 'fetch with revalidate: 60s',
      tags: ['api-posts'],
      data: data,
      timestamp: new Date().toISOString(),
      notes: [
        'First request: Slow (~100-500ms) - Cache MISS',
        'Subsequent requests (within 60s): Fast (<10ms) - Cache HIT',
        'After 60s: Slow again - Cache revalidated',
        'Can purge via: /api/revalidate?tags=api-posts'
      ]
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
