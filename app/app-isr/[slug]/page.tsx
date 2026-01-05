import { getPromotions, getPromotionById } from '@/utils/directus';
import AppLayout from '@/components/AppLayout';
import { PromotionDetail } from '@/components/PromotionDetail';

interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AppPromotionDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPromotionById(slug, 60);

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold">App Router ISR (Incremental Static Regeneration)</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <strong></strong>
          <br />
          <small className="block mt-1">
           The page is generated on demand at runtime. The first request triggers rendering on the server, then the result is cached and revalidated according to configured rules. Subsequent requests are fast because they use the cached version until revalidation.
          </small>
        </div>

        {result.error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <h2 className="text-xl font-semibold">Error:</h2>
            <p>{result.error}</p>
          </div>
        )}

        {result.promotion && <PromotionDetail promotion={result.promotion} />}
      </div>
    </AppLayout>
  );
}
 