'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import NavigationMenu from './NavigationMenu';

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <NavigationMenu currentPath={pathname || '/'} />
      <main className="lg:ml-64 flex-1 bg-slate-100 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
