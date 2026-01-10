'use client';

import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import NavigationMenu from './NavigationMenu';

interface Props {
  children: ReactNode;
}

export default function PagesLayout({ children }: Props) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <NavigationMenu currentPath={router.pathname} />
      <main className="lg:ml-64 flex-1 bg-slate-100 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
