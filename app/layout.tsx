import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js Cache Demo',
  description: 'Next.js Caching Strategies Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
