import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { PodHostname } from '@/components/PodHostname';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {pageProps.hostname && <PodHostname hostname={pageProps.hostname} />}
      <Component {...pageProps} />
    </>
  );
}
