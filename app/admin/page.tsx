'use client';

import { useState } from 'react';

/**
 * Admin Panel - Interactive Cache Revalidation
 *
 * This page provides UI for testing cache invalidation:
 * - Path-based revalidation (both routers)
 * - Tag-based revalidation (App Router only)
 * - Two API options: /api/revalidate and /api/revalidate-pages
 */

interface RevalidateResponse {
  revalidated?: boolean;
  success?: boolean;
  results?: string[];
  message?: string;
  error?: string;
  path?: string;
}

type ApiEndpoint = 'universal' | 'pages-router';

export default function AdminPage() {
  const [apiEndpoint, setApiEndpoint] = useState<ApiEndpoint>('universal');
  const [path, setPath] = useState('');
  const [tags, setTags] = useState('');
  const [secret, setSecret] = useState('');
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

    // Validate requirements for Pages Router API
    if (apiEndpoint === 'pages-router') {
      if (!path) {
        setResult({
          revalidated: false,
          error: 'Pages Router API requires a path (tags not supported)'
        });
        return;
      }
      if (!secret) {
        setResult({
          revalidated: false,
          error: 'Pages Router API requires a secret token'
        });
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      let url: string;

      if (apiEndpoint === 'universal') {
        // Universal API - supports both path and tags
        const params = new URLSearchParams();
        if (path) {
          params.append('path', path);
          params.append('type', pathType);
        }
        if (tags) {
          params.append('tags', tags);
        }
        url = `/api/revalidate?${params.toString()}`;
      } else {
        // Pages Router API - only supports path
        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('path', path);
        url = `/api/revalidate-pages?${params.toString()}`;
      }

      const response = await fetch(url);
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
    {
      label: 'App Router: /app-isr',
      path: '/app-isr',
      tags: 'photos',
      api: 'universal' as ApiEndpoint,
      description: 'App Router ISR with tags'
    },
    {
      label: 'App Router: /app-ssg',
      path: '/app-ssg',
      tags: '',
      api: 'universal' as ApiEndpoint,
      description: 'App Router SSG'
    },
    {
      label: 'App Router: /gallery',
      path: '/gallery',
      tags: 'gallery-photos',
      api: 'universal' as ApiEndpoint,
      description: 'Image gallery with tags'
    },
    {
      label: 'Pages Router: /page-static',
      path: '/page-static',
      tags: '',
      api: 'pages-router' as ApiEndpoint,
      description: 'Pages Router ISR (needs secret)'
    },
    {
      label: 'Tag: photos (App only)',
      path: '',
      tags: 'photos',
      api: 'universal' as ApiEndpoint,
      description: 'Purge all pages with "photos" tag'
    },
    {
      label: 'Tag: api-posts (App only)',
      path: '',
      tags: 'api-posts',
      api: 'universal' as ApiEndpoint,
      description: 'Purge cached API data'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="p-8 font-sans max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-indigo-500">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎛️ Cache Admin Panel
          </h1>
          <p className="text-gray-600">
            Interactive UI for testing cache revalidation. Supports both App Router and Pages Router with different API endpoints.
          </p>
        </div>

        {/* API Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select API Endpoint</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Universal API */}
            <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              apiEndpoint === 'universal'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}>
              <input
                type="radio"
                name="api"
                value="universal"
                checked={apiEndpoint === 'universal'}
                onChange={(e) => setApiEndpoint(e.target.value as ApiEndpoint)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🌐 Universal API</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <code className="text-xs text-gray-600 block mt-1">/api/revalidate</code>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>✅ App Router (path + tags)</li>
                  <li>✅ Pages Router (path only)</li>
                  <li>✅ No secret required</li>
                  <li>✅ Tag-based revalidation</li>
                </ul>
              </div>
            </label>

            {/* Pages Router API */}
            <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              apiEndpoint === 'pages-router'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}>
              <input
                type="radio"
                name="api"
                value="pages-router"
                checked={apiEndpoint === 'pages-router'}
                onChange={(e) => setApiEndpoint(e.target.value as ApiEndpoint)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>📄 Pages Router API</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Native</span>
                </div>
                <code className="text-xs text-gray-600 block mt-1">/api/revalidate-pages</code>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>✅ Pages Router only (path)</li>
                  <li>❌ No tag support</li>
                  <li>🔒 Requires secret token</li>
                  <li>⚡ Uses res.revalidate()</li>
                </ul>
              </div>
            </label>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Revalidation</h2>

          {/* Secret Token (only for Pages Router API) */}
          {apiEndpoint === 'pages-router' && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-yellow-900 mb-2">
                🔒 Secret Token (Required)
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter REVALIDATION_SECRET"
                className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-yellow-800">
                Set in <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
                <code className="bg-yellow-100 px-1 rounded ml-1">REVALIDATION_SECRET=your-secret-here</code>
              </p>
            </div>
          )}

          {/* Path Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Path {apiEndpoint === 'pages-router' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder={apiEndpoint === 'pages-router' ? '/page-static (required)' : '/app-isr or /page-static'}
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
                  disabled={apiEndpoint === 'pages-router'}
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
                  disabled={apiEndpoint === 'pages-router'}
                />
                <span className="text-sm text-gray-700">Layout</span>
              </label>
            </div>
          </div>

          {/* Tags Input (only for Universal API) */}
          {apiEndpoint === 'universal' && (
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
              <p className="mt-1 text-xs text-orange-600">
                ⚠️ Tags only work with App Router pages
              </p>
            </div>
          )}

          {apiEndpoint === 'pages-router' && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Pages Router API Note:</strong> Only supports path-based revalidation.
                Tag-based revalidation is not available in Pages Router.
              </p>
            </div>
          )}

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
              result.revalidated || result.success
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-3 ${
                result.revalidated || result.success ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {result.revalidated || result.success ? '✅ Success!' : '❌ Failed'}
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

            {result.path && (
              <div className="mb-3">
                <p className="font-medium text-gray-700 mb-1">Path:</p>
                <code className="text-sm bg-white px-2 py-1 rounded">{result.path}</code>
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
                  setApiEndpoint(action.api);
                  setPath(action.path);
                  setTags(action.tags);
                }}
                className="text-left px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg hover:shadow-md hover:border-indigo-400 transition-all"
              >
                <div className="font-medium text-indigo-900 flex items-center justify-between">
                  <span>{action.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    action.api === 'universal'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {action.api === 'universal' ? 'Universal' : 'Pages'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                <div className="text-xs text-gray-500 mt-1">
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
          <div className="space-y-4 text-sm text-blue-900">
            <div>
              <h4 className="font-semibold mb-1">Universal API (/api/revalidate)</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Path-based:</strong> Enter route path (e.g., <code className="bg-blue-100 px-1 rounded">/app-isr</code>)</li>
                <li><strong>Tag-based:</strong> Enter tag names (e.g., <code className="bg-blue-100 px-1 rounded">photos</code>) - App Router only</li>
                <li><strong>Combined:</strong> Use both path and tags together</li>
                <li>No authentication required</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Pages Router API (/api/revalidate-pages)</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Path only:</strong> Must provide a path (tags not supported)</li>
                <li><strong>Secret required:</strong> Must set REVALIDATION_SECRET in environment</li>
                <li>Uses native Pages Router <code className="bg-blue-100 px-1 rounded">res.revalidate()</code> method</li>
                <li>More secure with token authentication</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Verify Results</h4>
              <p>After purging, visit the page to confirm the &quot;Generated at&quot; timestamp has updated.</p>
            </div>
          </div>
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
          <p className="text-xs text-orange-600 mt-3">
            ⚠️ Note: Tags only work with App Router. Pages Router pages must use path-based revalidation.
          </p>
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
