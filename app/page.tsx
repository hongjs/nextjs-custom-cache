import { JsonViewer } from '@/components/JsonViewer';
import { getPromotions } from '@/utils/directus';
import AppLayout from '@/components/AppLayout';

export default async function Home() {
  // Cache: 'no-store
  const data = await getPromotions(undefined);

  return (
    <AppLayout>
      <div className="p-8 font-sans">
        <h1 className="mb-6 text-3xl font-bold">Directus API POC (App Router)</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <strong>🚀 App Router with ISR (React Server Component)</strong>
          <br />
          <small className="block mt-1">
            Static rendering with <code className="bg-blue-100 px-1 rounded">next: &#123; revalidate: 60 &#125;</code> -
            Cached and revalidated every 60 seconds (App Router ISR)
          </small>
          <small className="block mt-1 text-gray-600">
            ℹ️ Combines static generation benefits with data freshness - built at request time, then cached
          </small>
        </div>

        {data.error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <h2 className="text-xl font-semibold">Error:</h2>
            <p>{data.error}</p>
          </div>
        )}

        {!data.error && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">API Response:</h2>
            <JsonViewer data={data} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
