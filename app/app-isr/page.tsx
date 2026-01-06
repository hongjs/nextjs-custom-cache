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

export default async function ReadablePage() {
  // Cache 60 seconds
  const data = await getPromotions(60);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 font-sans max-w-7xl mx-auto">
        <PageHeader
          title="App Router ISR - Incremental Static Regeneration"
          cachingStrategy="⏱️ ISR with revalidate: 60 seconds"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">next: { revalidate: 60 }</code> - Time-based revalidation',
            '<strong>First Request:</strong> Generated on-demand, rendered on server, then cached',
            '<strong>Subsequent Requests:</strong> Served from cache instantly (within 60s window)',
            '<strong>After 60 seconds:</strong> Next request triggers background regeneration while serving stale cache',
            '<strong>Data Freshness:</strong> Maximum 60 seconds stale - balances freshness with performance',
            '<strong>Performance:</strong> Fast after first request - cached response served immediately',
            '<strong>Use Case:</strong> Ideal for semi-static content that updates periodically (news, product lists, promotions)',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="blue"
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
                linkPrefix="/app-isr/"
                accentColor="blue"
              />
            ))}
          </div>
        </div>
      )}

      {!data.error && !data.data && (
        <div className="bg-white p-8 rounded-lg text-center">
          <p>No data array found in response</p>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
