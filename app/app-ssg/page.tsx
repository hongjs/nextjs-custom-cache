import AppLayout from '@/components/AppLayout';
import { ItemCard } from '@/components/ItemCard';
import { PageHeader } from '@/components/PageHeader';
import { getItems, type Item } from '@/utils/api';


export default async function ReadablePage() {
  // Static Site Generation - cache at build time for fast builds
  const data = await getItems(Infinity);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 font-sans max-w-7xl mx-auto">
        <PageHeader
          title="App Router SSG List - Static Site Generation"
          cachingStrategy="🏗️ SSG - Static List Page Built at Build Time"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-green-100 px-1 rounded">Static Generation</code> - Pre-rendered once at build time',
            '<strong>Build Time:</strong> Page generated during <code class="bg-green-100 px-1 rounded">npm run build</code> with data fetched from API',
            '<strong>Runtime:</strong> Served as pure static HTML - no API calls after build',
            '<strong>Data Freshness:</strong> Frozen at build time - requires rebuild to update',
            '<strong>Performance:</strong> Instant load - pure static HTML served by CDN',
            '<strong>Updates:</strong> Content only changes after <code class="bg-green-100 px-1 rounded">npm run build</code> and redeployment',
            '<strong>Use Case:</strong> Content that rarely changes (marketing pages, archives, documentation)',
            '<strong>Generated at:</strong> ' + generatedAt + ' (frozen until next build)'
          ]}
          variant="green"
        />

      {'error' in data && (
        <div className="text-red-600 bg-red-50 p-4 rounded border border-red-500 mb-4">
          <h2 className="text-xl font-semibold">Error:</h2>
          <p>{data.error}</p>
        </div>
      )}

      {'data' in data && (
        <div>
          <div className="bg-white p-4 rounded mb-4 shadow">
            <strong>Total Items:</strong> {data.data.length}
          </div>

          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
            {data.data.map((item: Item, index: number) => (
              <ItemCard
                key={item.id || index}
                item={item}
                index={index}
                variant="detailed"
                linkPrefix="/app-ssg/"
                accentColor="blue"
              />
            ))}
          </div>
        </div>
      )}

      </div>
    </AppLayout>
  );
}
