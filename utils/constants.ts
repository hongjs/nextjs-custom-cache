/**
 * Cache and Revalidation Constants
 *
 * Centralized constants for cache revalidation times across the application.
 */

/**
 * ISR Revalidation Time
 * Used for Incremental Static Regeneration (ISR) pages
 * Pages will be revalidated every 300 seconds (5 minutes)
 */
export const REVALIDATE_TIME = 300;

/**
 * Build-time fetch timeout for Static Site Generation
 * Used during generateStaticParams and getStaticPaths
 */
export const BUILD_TIME_REVALIDATE = 300;
