import { JsonViewer } from '@/components/JsonViewer';
import { getItems, type Item } from '@/utils/api';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

export default async function Home() {
  // Cache: 'no-store
  const data = await getItems(undefined);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 font-sans">
        <PageHeader
          title="Dynamic Rendering (No Cache)"
          cachingStrategy="🔄 Dynamic Rendering with cache: 'no-store'"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">cache: \'no-store\'</code> - No caching at all',
            '<strong>Rendering Time:</strong> Page is rendered fresh on every request',
            '<strong>Data Freshness:</strong> Always up-to-date - fetches latest data on each visit',
            '<strong>Performance:</strong> Slower response time as server processes each request',
            '<strong>Use Case:</strong> Perfect for real-time data, user-specific content, or frequently changing information',
            '<strong>Server Load:</strong> Higher server load as every request triggers a new render',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="blue"
        />

        {'error' in data && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <h2 className="text-xl font-semibold">Error:</h2>
            <p>{data.error}</p>
          </div>
        )}

        {'data' in data && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">API Response:</h2>
            <JsonViewer data={data} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
