import { getPodHostname } from '@/utils/hostname';
import { PodHostname } from '@/components/PodHostname';
import { RouteCard } from '@/components/RouteCard';
import { ApiCard } from '@/components/ApiCard';
import { ToolCard } from '@/components/ToolCard';

/**
 * Landing Page - Custom Cache Handler POC
 *
 * This is the main entry point showcasing all available routes,
 * APIs, and testing tools with their cache behaviors.
 */

export default async function Home() {
  const hostname = await getPodHostname();

  const pageRoutes = [
    {
      category: 'App Router - Pages',
      routes: [
        {
          path: '/app-isr',
          title: 'ISR (Time-based)',
          description: 'Incremental Static Regeneration with 300s revalidation',
          cacheType: 'Page Cache',
          cacheBehavior: 'revalidate: 300s',
          color: 'blue',
          icon: '📖',
          keyFeatures: [
            'First request: Generated on-demand',
            'Cached for 300 seconds',
            'Stale-while-revalidate pattern',
          ]
        },
        {
          path: '/app-ssg',
          title: 'SSG (Build-time)',
          description: 'Static Site Generation with generateStaticParams',
          cacheType: 'Static',
          cacheBehavior: 'Pre-rendered',
          color: 'green',
          icon: '🏠',
          keyFeatures: [
            'Generated at build time',
            'Fastest possible response',
            'No revalidation (permanent cache)',
          ]
        },
        {
          path: '/gallery',
          title: 'Image Gallery',
          description: 'Tests Next.js Image optimization with Binary/Buffer handling',
          cacheType: 'Page + Image Cache',
          cacheBehavior: 'revalidate: 300s',
          color: 'purple',
          icon: '🖼️',
          keyFeatures: [
            'Tests Buffer to Base64 conversion',
            'Multiple image sizes (responsive)',
            'WebP/AVIF format optimization',
          ]
        },
      ]
    },
    {
      category: 'Pages Router - Pages',
      routes: [
        {
          path: '/page-static',
          title: 'ISR (getStaticProps)',
          description: 'Pages Router ISR with getStaticProps',
          cacheType: 'Page Cache',
          cacheBehavior: 'revalidate: 60s',
          color: 'blue',
          icon: '📄',
          keyFeatures: [
            'Classic Pages Router ISR',
            'getStaticProps with revalidate',
            'Compatible with App Router cache',
          ]
        },
        {
          path: '/page-server',
          title: 'SSR (getServerSideProps)',
          description: 'Server-Side Rendering - Always fresh',
          cacheType: 'No Cache',
          cacheBehavior: 'SSR',
          color: 'orange',
          icon: '⚡',
          keyFeatures: [
            'Rendered on every request',
            'Always fresh data',
            'No static caching',
          ]
        },
      ]
    },
  ];

  const apiRoutes = [
    {
      path: '/api/cached-fetch',
      title: 'Cached Fetch API',
      description: 'API with internal fetch() - Tests Data Cache',
      method: 'GET',
      cacheType: 'Data Cache',
      cacheBehavior: 'revalidate: 60s',
      color: 'blue',
      icon: '🔄',
      keyFeatures: [
        'fetch() with revalidate: 60s',
        'Returns duration & cached status',
        'Tag: api-posts',
      ],
      testCommand: 'curl http://localhost:3000/api/cached-fetch | jq'
    },
    {
      path: '/api/real-time',
      title: 'Real-time API',
      description: 'force-dynamic - Never cached',
      method: 'GET/POST',
      cacheType: 'No Cache',
      cacheBehavior: 'force-dynamic',
      color: 'red',
      icon: '⚡',
      keyFeatures: [
        'export const dynamic = "force-dynamic"',
        'Always fresh (100-500ms)',
        'Unique requestId every time',
      ],
      testCommand: 'curl http://localhost:3000/api/real-time | jq'
    },
    {
      path: '/api/revalidate',
      title: 'Revalidation API',
      description: 'On-demand cache purge (path & tag-based)',
      method: 'GET',
      cacheType: 'N/A',
      cacheBehavior: 'Purge trigger',
      color: 'purple',
      icon: '🔥',
      keyFeatures: [
        'Purge by path: ?path=/app-isr',
        'Purge by tags: ?tags=photos',
        'Combined purge support',
      ],
      testCommand: 'curl "http://localhost:3000/api/revalidate?tags=photos" | jq'
    },
    {
      path: '/api/cache-stats',
      title: 'Cache Stats API',
      description: 'Redis connection status & cache metrics',
      method: 'GET',
      cacheType: 'No Cache',
      cacheBehavior: 'force-dynamic',
      color: 'cyan',
      icon: '📊',
      keyFeatures: [
        'Redis connection status',
        'Cache key counts & breakdown',
        'Memory usage info',
      ],
      testCommand: 'curl http://localhost:3000/api/cache-stats | jq'
    },
  ];

  const testingTools = [
    {
      path: '/admin',
      title: 'Admin Panel',
      description: 'Interactive cache revalidation UI',
      color: 'indigo',
      icon: '🎛️',
      features: [
        'Web UI for cache purge',
        'Path-based revalidation',
        'Tag-based revalidation',
        'Quick action buttons',
      ]
    },
    {
      path: '/stats',
      title: 'Cache Stats Dashboard',
      description: 'Real-time cache monitoring',
      color: 'cyan',
      icon: '📊',
      features: [
        'Redis connection status',
        'Cache key breakdown',
        'Memory usage metrics',
        'Auto-refresh (5s)',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Pod Hostname */}
      <PodHostname hostname={hostname} />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Next.js Custom Cache Handler POC
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2 px-4">
            Redis-backed distributed caching with graceful LRU fallback
          </p>
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            Explore different caching strategies, test cache behavior, and monitor performance
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 flex-wrap px-4">
          <a
            href="#pages"
            className="px-3 sm:px-6 py-2 bg-white border-2 border-blue-500 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition-colors text-sm sm:text-base"
          >
            📄 Pages
          </a>
          <a
            href="#apis"
            className="px-3 sm:px-6 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 font-medium transition-colors text-sm sm:text-base"
          >
            🔌 APIs
          </a>
          <a
            href="#tools"
            className="px-3 sm:px-6 py-2 bg-white border-2 border-purple-500 text-purple-700 rounded-lg hover:bg-purple-50 font-medium transition-colors text-sm sm:text-base"
          >
            🔧 Tools
          </a>
          <a
            href="https://github.com/anthropics/nextjs-custom-cache/blob/main/TESTING.md"
            className="px-3 sm:px-6 py-2 bg-white border-2 border-orange-500 text-orange-700 rounded-lg hover:bg-orange-50 font-medium transition-colors text-sm sm:text-base"
            target="_blank"
            rel="noopener noreferrer"
          >
            📋 Testing Guide
          </a>
        </div>

        {/* Page Routes Section */}
        <div id="pages" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 px-2 sm:px-0">
            <span>📄</span>
            Page Routes
          </h2>

          {pageRoutes.map((category, idx) => (
            <div key={idx} className="mb-8 sm:mb-10">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3 sm:pl-4 ml-2 sm:ml-0">
                {category.category}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {category.routes.map((route) => (
                  <RouteCard key={route.path} route={route} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* API Routes Section */}
        <div id="apis" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 px-2 sm:px-0">
            <span>🔌</span>
            API Routes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {apiRoutes.map((api) => (
              <ApiCard key={api.path} api={api} />
            ))}
          </div>
        </div>

        {/* Testing Tools Section */}
        <div id="tools" className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 px-2 sm:px-0">
            <span>🔧</span>
            Testing & Monitoring Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {testingTools.map((tool) => (
              <ToolCard key={tool.path} tool={tool} />
            ))}
          </div>
        </div>

        {/* Documentation Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-6 sm:p-8 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">📚 Documentation & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">📋 Testing Guide</h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-3">
                Comprehensive testing checklist for QA
              </p>
              <a
                href="/TESTING.md"
                className="inline-block px-3 sm:px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                View TESTING.md
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">🤖 Automated Tests</h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-3">
                Bash script for automated testing
              </p>
              <code className="block bg-blue-800 bg-opacity-50 rounded p-2 text-xs font-mono mb-2 overflow-x-auto">
                ./test-cache.sh http://localhost:3000
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">📖 README</h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-3">
                Full project documentation
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 sm:px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                View on GitHub ↗
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>
            Built with Next.js 16 • Redis • TypeScript • TailwindCSS 4
          </p>
          <p className="mt-2">
            <a href="/admin" className="text-blue-600 hover:underline">Admin Panel</a>
            {' • '}
            <a href="/stats" className="text-blue-600 hover:underline">Cache Stats</a>
            {' • '}
            <a href="https://github.com" className="text-blue-600 hover:underline">GitHub</a>
          </p>
        </div>
      </div>
    </div>
  );
}
