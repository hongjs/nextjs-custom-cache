'use client';

import { useState } from 'react';

interface Props {
  currentPath: string;
}

export default function NavigationMenu({ currentPath }: Props) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const menuItems = [
    // App Router ISR
    { path: '/app-isr', label: 'App Router (ISR)', icon: '📖' },
    // App Router SSG (generateStaticParams)
    { path: '/app-ssg', label: 'App Router (Static)', icon: '🏠' },
    // Pages SSR (getServerSideProps)
    { path: '/page-server', label: 'Pages Router (Server)', icon: '⚡' },
    // Pages SSG (getStaticProps) 
    { path: '/page-static', label: 'Pages Router (Static)', icon: '📄' },
  ];

  return (
    <nav className="w-64 bg-slate-800 text-white py-8 fixed h-screen overflow-y-auto">
      <div className="px-6 mb-8 pb-4 border-b border-slate-700">
        <h2 className="text-xl font-semibold m-0">Directus POC</h2>
        <p className="mt-2 text-sm text-slate-400">
          Next.js Dual Router Demo
        </p>
      </div>

      <ul className="list-none p-0 m-0">
        {menuItems.map((item) => (
          <li key={item.path}>
            <a
              href={item.path}
              className={`flex items-center py-3.5 px-6 text-white no-underline transition-all duration-200 border-l-4 ${
                isActive(item.path)
                  ? 'bg-slate-700 border-blue-500'
                  : hoveredPath === item.path
                  ? 'bg-slate-700 border-transparent'
                  : 'bg-transparent border-transparent'
              }`}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <span className="mr-3 text-xl">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

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
  );
}
