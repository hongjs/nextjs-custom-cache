import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Pages Router - On-demand Revalidation API
 *
 * This API demonstrates the Pages Router native revalidation method
 * using res.revalidate() - different from App Router's revalidatePath()
 *
 * Usage:
 *   GET /api/revalidate-pages?secret=YOUR_SECRET&path=/page-static
 *   GET /api/revalidate-pages?secret=YOUR_SECRET&path=/page-static/1
 *
 * Note:
 *   - Requires REVALIDATION_SECRET in environment variables
 *   - Only works with Pages Router pages (pages/*)
 *   - Does NOT support tag-based revalidation (Pages Router limitation)
 */

type ResponseData = {
  success?: boolean;
  revalidated?: boolean;
  path?: string;
  timestamp?: number;
  message?: string;
  error?: string;
  usage?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed',
      usage: 'GET /api/revalidate-pages?secret=YOUR_SECRET&path=/page-static'
    });
  }

  const secret = req.query.secret as string;
  const path = req.query.path as string;

  // Validate secret token
  const expectedSecret = process.env.REVALIDATION_SECRET || 'development-secret';

  if (!secret || secret !== expectedSecret) {
    console.warn('[API] Revalidation attempt with invalid secret');
    return res.status(401).json({
      message: 'Invalid or missing secret token',
      usage: 'Add REVALIDATION_SECRET to your environment variables'
    });
  }

  // Validate path parameter
  if (!path) {
    return res.status(400).json({
      message: 'Missing path parameter',
      usage: '/api/revalidate-pages?secret=YOUR_SECRET&path=/page-static'
    });
  }

  // Validate that path starts with /
  if (!path.startsWith('/')) {
    return res.status(400).json({
      message: 'Path must start with /',
      error: `Invalid path: ${path}`
    });
  }

  try {
    // Use Pages Router native revalidation
    // This calls the cache handler to purge the specific path
    await res.revalidate(path);

    console.log(`[API] Pages Router - Revalidated path: ${path}`);

    return res.status(200).json({
      success: true,
      revalidated: true,
      path,
      timestamp: Date.now()
    });

  } catch (err) {
    console.error(`[API] Error revalidating ${path}:`, err);

    return res.status(500).json({
      success: false,
      message: 'Error revalidating path',
      error: err instanceof Error ? err.message : 'Unknown error',
      path
    });
  }
}
