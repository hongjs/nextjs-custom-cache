import { NextResponse } from 'next/server';

/**
 * Real-time API Route - Force Dynamic Rendering
 *
 * This endpoint demonstrates:
 * - force-dynamic prevents ANY caching
 * - Data is ALWAYS fresh (never cached)
 * - Suitable for real-time data, user-specific content
 */

// CRITICAL: This tells Next.js to NEVER cache this route
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Even with revalidate, this won't be cached due to force-dynamic
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1', {
      cache: 'no-store' // Additional safeguard
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      cached: false, // ALWAYS false with force-dynamic
      duration: `${duration}ms`,
      cacheStrategy: 'force-dynamic (NO CACHE)',
      dynamicConfig: 'export const dynamic = "force-dynamic"',
      data: data,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      notes: [
        'Every request: ALWAYS fresh data',
        'Response time: Always ~100-500ms (network call)',
        'NO cache hit ever',
        'Use for: Real-time data, user sessions, live stats',
        'Compare with /api/cached-fetch to see difference'
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

// POST example - also force-dynamic
export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    cached: false,
    message: 'POST requests are never cached by default',
    receivedData: body,
    timestamp: new Date().toISOString(),
    notes: [
      'POST/PUT/DELETE are NEVER cached',
      'Only GET requests can be cached',
      'force-dynamic here is redundant but explicit'
    ]
  });
}
