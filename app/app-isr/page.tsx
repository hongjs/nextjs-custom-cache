import AppLayout from '@/components/AppLayout';
import { ItemCard } from '@/components/ItemCard';
import { PageHeader } from '@/components/PageHeader';
import { getItems, type Item } from '@/utils/api';
import { REVALIDATE_TIME } from '@/utils/constants';

// Next.js requires literal value for segment config exports
export const revalidate = 300;

export default async function ReadablePage() {
  const data = await getItems(REVALIDATE_TIME, ['photos']);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 font-sans max-w-7xl mx-auto">
        <PageHeader
          title="App Router ISR - Incremental Static Regeneration"
          cachingStrategy={`⏱️ ISR with revalidate: ${REVALIDATE_TIME}s`}
          description={[
            `<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">export const revalidate = ${REVALIDATE_TIME}</code> - Time-based revalidation`,
            '<strong>First Request:</strong> Generated on-demand, rendered on server, then cached',
            `<strong>Subsequent Requests:</strong> Served from cache instantly (within ${REVALIDATE_TIME}s window)`,
            `<strong>After ${REVALIDATE_TIME} seconds:</strong> Next request triggers background regeneration while serving stale cache`,
            `<strong>Data Freshness:</strong> Maximum ${REVALIDATE_TIME} seconds stale - balances freshness with performance`,
            '<strong>Performance:</strong> Fast after first request - cached response served immediately',
            '<strong>Use Case:</strong> Ideal for semi-static content that updates periodically (news, product lists)',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="blue"
        />

      {'error' in data && (
        <div className="text-red-600 bg-red-50 p-3 sm:p-4 rounded border border-red-500 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Error:</h2>
          <p className="text-sm sm:text-base">{data.error}</p>
        </div>
      )}

      {'data' in data && (
        <div>
          <div className="bg-white p-3 sm:p-4 rounded mb-4 shadow text-sm sm:text-base">
            <strong>Total Items:</strong> {data.data.length}
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((item: Item, index: number) => (
              <ItemCard
                key={item.id || index}
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
      </div>
    </AppLayout>
  );
}
