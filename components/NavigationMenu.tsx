'use client';

import { useState } from 'react';

interface Props {
  currentPath: string;
}

export default function NavigationMenu({ currentPath }: Props) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const appRouterPages = [
    { path: '/app-isr', label: 'App Router (ISR)', icon: '📖' },
    { path: '/app-ssg', label: 'App Router (SSG)', icon: '🏠' },
  ];

  const pagesRouterPages = [
    { path: '/page-server', label: 'Pages Router (SSR)', icon: '⚡' },
    { path: '/page-static', label: 'Pages Router (ISR)', icon: '📄' },
  ];

  const testingPages = [
    { path: '/gallery', label: 'Image Gallery', icon: '🖼️' },
    { path: '/admin', label: 'Admin Panel', icon: '🎛️' },
    { path: '/stats', label: 'Cache Stats', icon: '📊' },
  ];

  const apiRoutes = [
    { path: '/api/cached-fetch', label: 'Cached Fetch API', icon: '🔄', external: true },
    { path: '/api/real-time', label: 'Real-time API', icon: '⚡', external: true },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={`
        w-64 bg-slate-800 text-white py-8 fixed h-screen overflow-y-auto z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 mb-8 pb-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold m-0">Next.js Cache Demo</h2>
          <p className="mt-2 text-sm text-slate-400">
            Next.js Dual Router Demo
          </p>
        </div>

      {/* App Router Section */}
      <div className="mb-6">
        <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase mb-2">
          App Router
        </h3>
        <ul className="list-none p-0 m-0">
          {appRouterPages.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`flex items-center py-3 px-6 text-white no-underline transition-all duration-200 border-l-4 ${
                  isActive(item.path)
                    ? 'bg-slate-700 border-blue-500'
                    : hoveredPath === item.path
                    ? 'bg-slate-700 border-transparent'
                    : 'bg-transparent border-transparent'
                }`}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Pages Router Section */}
      <div className="mb-6">
        <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase mb-2">
          Pages Router
        </h3>
        <ul className="list-none p-0 m-0">
          {pagesRouterPages.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`flex items-center py-3 px-6 text-white no-underline transition-all duration-200 border-l-4 ${
                  isActive(item.path)
                    ? 'bg-slate-700 border-blue-500'
                    : hoveredPath === item.path
                    ? 'bg-slate-700 border-transparent'
                    : 'bg-transparent border-transparent'
                }`}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Testing & Tools Section */}
      <div className="mb-6">
        <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase mb-2">
          Testing & Tools
        </h3>
        <ul className="list-none p-0 m-0">
          {testingPages.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`flex items-center py-3 px-6 text-white no-underline transition-all duration-200 border-l-4 ${
                  isActive(item.path)
                    ? 'bg-slate-700 border-purple-500'
                    : hoveredPath === item.path
                    ? 'bg-slate-700 border-transparent'
                    : 'bg-transparent border-transparent'
                }`}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* API Routes Section */}
      <div className="mb-6">
        <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase mb-2">
          API Routes
        </h3>
        <ul className="list-none p-0 m-0">
          {apiRoutes.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center py-3 px-6 text-white no-underline transition-all duration-200 border-l-4 ${
                  hoveredPath === item.path
                    ? 'bg-slate-700 border-transparent'
                    : 'bg-transparent border-transparent'
                }`}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
                <span className="ml-auto text-xs">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 mt-8 pt-6 border-t border-slate-700">
        <h3 className="text-sm font-semibold mb-2 text-slate-400">
          Rendering Methods
        </h3>
        <ul className="list-none p-0 m-0 text-xs text-slate-500 space-y-1">
          <li>• SSG - Static Site Generation</li>
          <li>• SSR - Server-Side Rendering</li>
          <li>• ISR - Incremental Static Regeneration</li>
        </ul>
      </div>
    </nav>
    </>
  );
}
