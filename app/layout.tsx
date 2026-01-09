import type { Metadata } from 'next';
import './globals.css';
import { PodHostname } from '@/components/PodHostname';
import { getPodHostname } from '@/utils/hostname';

export const metadata: Metadata = {
  title: 'Next.js Cache Demo',
  description: 'Next.js Caching Strategies Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hostname = getPodHostname();

  return (
    <html lang="en">
      <body>
        <PodHostname hostname={hostname} />
        {children}
      </body>
    </html>
  );
}
