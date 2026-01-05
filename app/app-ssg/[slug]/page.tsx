import { getPromotions, getPromotionById } from '@/utils/directus';
import AppLayout from '@/components/AppLayout';
import { PromotionDetail } from '@/components/PromotionDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getPromotions(60)
 
  const params = data.data.map((item: { promo_id: string; }) => ({
    slug: item.promo_id,
  }))
  return params
}

export default async function AppPromotionDetailPage({ params }: Props) {
  const { slug } = await params;
  console.log('slug', slug)
  const result = await getPromotionById(slug, undefined);

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold">App Router SSG (generateStaticParams + static rendering)</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <strong></strong>
          <br />
          <small className="block mt-1">
            The page is statically generated during build, including for defined dynamic routes. Because it’s fully pre-rendered, both first and later requests are instant. Ideal for static or mostly-static content with known paths at build time.
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
