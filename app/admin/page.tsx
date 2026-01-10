'use client';

import { useState } from 'react';

/**
 * Admin Panel - Interactive Cache Revalidation
 *
 * This page provides UI for testing cache invalidation:
 * - Path-based revalidation
 * - Tag-based revalidation
 * - Live testing of cache purge
 */

interface RevalidateResponse {
  revalidated: boolean;
  results?: string[];
  message?: string;
  error?: string;
}

export default function AdminPage() {
  const [path, setPath] = useState('');
  const [tags, setTags] = useState('');
  const [pathType, setPathType] = useState<'page' | 'layout'>('page');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RevalidateResponse | null>(null);

  const handleRevalidate = async () => {
    if (!path && !tags) {
      setResult({
        revalidated: false,
        error: 'Please provide at least one: path or tags'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (path) {
        params.append('path', path);
        params.append('type', pathType);
      }
      if (tags) {
        params.append('tags', tags);
      }

      const response = await fetch(`/api/revalidate?${params.toString()}`);
      const data = await response.json();

      setResult(data);
    } catch (error: any) {
      setResult({
        revalidated: false,
        error: error.message || 'Failed to revalidate'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Purge /app-isr', path: '/app-isr', tags: 'photos' },
    { label: 'Purge /app-ssg', path: '/app-ssg', tags: '' },
    { label: 'Purge /page-static', path: '/page-static', tags: '' },
    { label: 'Purge Gallery', path: '/gallery', tags: 'gallery-photos' },
    { label: 'Purge Tag: photos', path: '', tags: 'photos' },
    { label: 'Purge Tag: api-posts', path: '', tags: 'api-posts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="p-8 font-sans max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-indigo-500">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎛️ Cache Admin Panel
          </h1>
          <p className="text-gray-600">
            Interactive UI for testing cache revalidation. Use this to manually purge cache during development and testing.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Revalidation</h2>

          {/* Path Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Path (optional)
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/app-isr"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="mt-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="page"
                  checked={pathType === 'page'}
                  onChange={(e) => setPathType('page')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Page</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="layout"
                  checked={pathType === 'layout'}
                  onChange={(e) => setPathType('layout')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Layout</span>
              </label>
            </div>
          </div>

          {/* Tags Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional, comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="photos, api-posts"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: <code className="bg-gray-100 px-1 rounded">photos</code> or{' '}
              <code className="bg-gray-100 px-1 rounded">photos, gallery-photos</code>
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRevalidate}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Purging...' : '🔄 Purge Cache'}
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-lg shadow-lg p-6 mb-6 ${
              result.revalidated
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-3 ${
                result.revalidated ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {result.revalidated ? '✅ Success!' : '❌ Failed'}
            </h3>

            {result.results && result.results.length > 0 && (
              <div className="mb-3">
                <p className="font-medium text-gray-700 mb-2">Revalidated:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.results.map((r, i) => (
                    <li key={i} className="text-sm text-gray-800">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.message && (
              <p className="text-sm text-gray-700">{result.message}</p>
            )}

            {result.error && (
              <p className="text-sm text-red-700">{result.error}</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-600">
                <strong>Next steps:</strong> Navigate to the revalidated page and check if the &quot;Generated at&quot; timestamp has changed.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setPath(action.path);
                  setTags(action.tags);
                }}
                className="text-left px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg hover:shadow-md hover:border-indigo-400 transition-all"
              >
                <div className="font-medium text-indigo-900">{action.label}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {action.path && <span>Path: {action.path}</span>}
                  {action.path && action.tags && <span> • </span>}
                  {action.tags && <span>Tag: {action.tags}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg shadow p-6 mt-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">📖 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
            <li>
              <strong>Path-based:</strong> Enter a route path (e.g., <code className="bg-blue-100 px-1 rounded">/app-isr</code>) to revalidate that specific page
            </li>
            <li>
              <strong>Tag-based:</strong> Enter tag names to revalidate all pages/data with those tags
            </li>
            <li>
              <strong>Combined:</strong> Use both path and tags to revalidate specific pages AND tagged data
            </li>
            <li>
              <strong>Verify:</strong> After purging, visit the page to confirm the &quot;Generated at&quot; time has updated
            </li>
          </ol>
        </div>

        {/* Common Tags Reference */}
        <div className="bg-gray-50 rounded-lg shadow p-6 mt-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🏷️ Common Tags in This Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Pages:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><code className="bg-gray-100 px-1 rounded">photos</code> - /app-isr pages</li>
                <li><code className="bg-gray-100 px-1 rounded">gallery-photos</code> - /gallery page</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">API Routes:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><code className="bg-gray-100 px-1 rounded">api-posts</code> - /api/cached-fetch</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
