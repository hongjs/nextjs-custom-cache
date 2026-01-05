import { getPromotions } from '@/utils/directus';
import { formatDate, renderValue } from '@/utils/formatters';
import AppLayout from '@/components/AppLayout';
import { PromotionCard } from '@/components/PromotionCard';

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

  return (
    <AppLayout>
      <div className="p-8 font-sans max-w-7xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold">App Router SSG (generateStaticParams + static rendering)</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <strong></strong>
          <br />
          <small className="block mt-1">
            The page is statically generated during build, including for defined dynamic routes. Because it’s fully pre-rendered, both first and later requests are instant. Ideal for static or mostly-static content with known paths at build time.
          </small>
        </div>

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
