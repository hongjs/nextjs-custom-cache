import { getPromotions } from '@/utils/directus';
import { formatDate, renderValue } from '@/utils/formatters';
import AppLayout from '@/components/AppLayout';
import { PromotionCard } from '@/components/PromotionCard';
import { PageHeader } from '@/components/PageHeader';

interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

export async function generateStaticParams() {
  const data = await getPromotions(60);

  return data.map((item: { promo_id: string; }) => ({
    slug: item.promo_id,
  }))
}

export default async function ReadablePage() {
  // Cache 60 seconds
  const data = await getPromotions(60);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 font-sans max-w-7xl mx-auto">
        <PageHeader
          title="App Router SSG - Static Site Generation"
          cachingStrategy="🏗️ SSG with generateStaticParams - Built at Build Time"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-green-100 px-1 rounded">Static Generation</code> - Fully pre-rendered at build time',
            '<strong>Build Time:</strong> Page is generated once during <code class="bg-green-100 px-1 rounded">npm run build</code>',
            '<strong>All Requests:</strong> Served instantly from pre-built HTML - no server processing',
            '<strong>Data Freshness:</strong> Static until next build - data snapshot from build time',
            '<strong>Performance:</strong> Fastest possible - pure static HTML served by CDN',
            '<strong>Deployment:</strong> Requires rebuild and redeploy to update content',
            '<strong>Use Case:</strong> Best for truly static content (documentation, marketing pages, archived content)',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="green"
        />

      {data.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded border border-red-500 mb-4">
          <h2 className="text-xl font-semibold">Error:</h2>
          <p>{data.error}</p>
        </div>
      )}

      {!data.error && data.data && (
        <div>
          <div className="bg-white p-4 rounded mb-4 shadow">
            <strong>Total Items:</strong> {data.data.length}
          </div>

          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
            {data.data.map((item: Promotion, index: number) => (
              <PromotionCard
                key={item.promo_id || index}
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

      {!data.error && !data.data && (
        <div className="bg-white p-8 rounded-lg text-center">
          <p>No data array found in response</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-left mt-4">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
