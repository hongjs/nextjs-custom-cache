import { getPromotions, getPromotionById } from '@/utils/directus';
import AppLayout from '@/components/AppLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { PageHeader } from '@/components/PageHeader';

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
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="App Router SSG - Static Site Generation"
          cachingStrategy="🏗️ SSG with generateStaticParams - Pre-built Dynamic Routes"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-green-100 px-1 rounded">generateStaticParams</code> - All routes pre-generated at build',
            '<strong>Build Time:</strong> All possible slugs defined and built during <code class="bg-green-100 px-1 rounded">npm run build</code>',
            '<strong>Route Generation:</strong> Only predefined routes in <code class="bg-green-100 px-1 rounded">generateStaticParams</code> are created',
            '<strong>All Requests:</strong> Instant response - pure static HTML for each slug',
            '<strong>Data Freshness:</strong> Completely static - frozen at build time',
            '<strong>Scalability Consideration:</strong> Limited to known routes - unknown routes return 404',
            '<strong>Use Case:</strong> Perfect when all possible routes are known (product catalog, blog posts with finite IDs)',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="green"
        />

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
