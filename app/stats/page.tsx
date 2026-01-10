'use client';

import { useEffect, useState } from 'react';

/**
 * Cache Statistics & Monitoring
 *
 * This page provides real-time insights into:
 * - Redis connection status
 * - Cache keys and their TTL
 * - Memory usage
 * - Cache performance
 */

interface CacheStats {
  redis: {
    connected: boolean;
    url?: string;
    memory?: string;
    totalKeys?: number;
    error?: string;
    reason?: string;
    fallback?: string;
  };
  cache?: {
    nextjsKeys: number;
    pageKeys: number;
    tagKeys: number;
    otherKeys: number;
  };
  keyDetails?: Array<{
    key: string;
    ttl: string;
    type: string;
  }>;
  timestamp?: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cache-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="p-8 font-sans max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-cyan-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 Cache Statistics
              </h1>
              <p className="text-gray-600">
                Real-time monitoring of cache status and performance
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {autoRefresh ? '⏸️ Stop Auto' : '▶️ Auto Refresh'}
              </button>
            </div>
          </div>
          {stats?.timestamp && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {new Date(stats.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-900 font-medium">❌ Error: {error}</p>
          </div>
        )}

        {/* Redis Status */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div
              className={`rounded-lg shadow-lg p-6 ${
                stats.redis.connected
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-yellow-50 border-2 border-yellow-500'
              }`}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {stats.redis.connected ? '✅' : '⚠️'} Redis Status
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Connected:</span>
                  <span className={stats.redis.connected ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
                    {stats.redis.connected ? 'Yes' : 'No'}
                  </span>
                </div>

                {stats.redis.connected && stats.redis.url && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">URL:</span>
                    <span className="text-gray-600 text-xs font-mono">{stats.redis.url}</span>
                  </div>
                )}

                {stats.redis.error && (
                  <div className="pt-2 border-t border-yellow-300">
                    <span className="font-medium text-gray-700">Error:</span>
                    <p className="text-yellow-800 text-xs mt-1">{stats.redis.error}</p>
                  </div>
                )}

                {stats.redis.reason && (
                  <div className="pt-2 border-t border-yellow-300">
                    <span className="font-medium text-gray-700">Reason:</span>
                    <p className="text-yellow-800 text-xs mt-1">{stats.redis.reason}</p>
                  </div>
                )}

                {stats.redis.fallback && (
                  <div className="pt-2 border-t border-yellow-300 bg-yellow-100 -mx-2 px-2 py-1 rounded">
                    <span className="font-medium text-yellow-900">Fallback:</span>
                    <p className="text-yellow-800 text-xs mt-1">{stats.redis.fallback}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Info */}
            {stats.redis.connected && (
              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-900">💾 Memory & Storage</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Memory Used:</span>
                    <span className="text-blue-700 font-semibold">{stats.redis.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total Keys (Redis DB):</span>
                    <span className="text-blue-700 font-semibold">{stats.redis.totalKeys}</span>
                  </div>
                  {stats.cache && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Next.js Cache Keys:</span>
                      <span className="text-blue-700 font-semibold">{stats.cache.nextjsKeys}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cache Breakdown */}
        {stats?.cache && stats.redis.connected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📦 Cache Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <div className="text-3xl font-bold text-purple-700">{stats.cache.pageKeys}</div>
                <div className="text-sm text-purple-900 mt-1">Page Cache Keys</div>
                <div className="text-xs text-purple-600 mt-1">HTML pages, routes, layouts</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{stats.cache.tagKeys}</div>
                <div className="text-sm text-orange-900 mt-1">Tag Keys</div>
                <div className="text-xs text-orange-600 mt-1">Revalidation tags metadata</div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border-2 border-teal-200">
                <div className="text-3xl font-bold text-teal-700">{stats.cache.otherKeys}</div>
                <div className="text-sm text-teal-900 mt-1">Other Keys</div>
                <div className="text-xs text-teal-600 mt-1">Data cache, images, etc.</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Details */}
        {stats?.keyDetails && stats.keyDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🔑 Recent Cache Keys (Sample)</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TTL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.keyDetails.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {detail.key}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {detail.type}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          detail.ttl === 'no expiry'
                            ? 'bg-blue-100 text-blue-800'
                            : detail.ttl === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {detail.ttl}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Showing first 10 page cache keys. For full list, use Redis CLI: <code className="bg-gray-100 px-1 rounded">redis-cli KEYS nextjs-v7:*</code>
            </p>
          </div>
        )}

        {/* Not Connected State */}
        {stats && !stats.redis.connected && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3 text-yellow-900">
              ⚠️ Redis Not Connected
            </h2>
            <p className="text-yellow-800 mb-4">
              The application is running with LRU in-memory cache fallback. Cache is working, but data is not shared across pods/instances.
            </p>
            <div className="bg-white rounded p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">To enable Redis:</p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Start Redis: <code className="bg-gray-100 px-1 rounded">docker-compose up -d redis</code></li>
                <li>Set environment variable: <code className="bg-gray-100 px-1 rounded">REDIS_URL=redis://localhost:6379</code></li>
                <li>Restart the application</li>
              </ol>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg shadow p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>
              <strong>High Key Count:</strong> Normal for busy sites. Redis handles millions of keys efficiently.
            </li>
            <li>
              <strong>No TTL (no expiry):</strong> Keys without revalidation time set. May need manual purge.
            </li>
            <li>
              <strong>Memory Usage:</strong> Monitor this in production. Consider eviction policies if it grows too large.
            </li>
            <li>
              <strong>Auto Refresh:</strong> Enable to watch cache changes in real-time (updates every 5 seconds).
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="mt-6 flex justify-between items-center">
          <a
            href="/"
            className="text-cyan-600 hover:text-cyan-800 font-medium"
          >
            ← Back to Home
          </a>
          <a
            href="/admin"
            className="text-cyan-600 hover:text-cyan-800 font-medium"
          >
            Go to Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
}
