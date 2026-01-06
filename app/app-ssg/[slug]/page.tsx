import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { PromotionDetail } from '@/components/PromotionDetail';
import { getPromotionById, getPromotions } from '@/utils/directus';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = await getPromotions(60);

  // Handle case where data might have an error or no data array
  if (!data || !data.data || data.error) {
    console.error('Failed to generate static params:', data?.error || 'No data available');
    return [];
  }

  const params = data.data.map((item: { promo_id: string; }) => ({
    slug: item.promo_id,
  }));

  return params;
}

export default async function AppPromotionDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPromotionById(slug, 60);
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="App Router SSG Detail - Static Site Generation"
          cachingStrategy="🏗️ SSG with generateStaticParams - Pre-built Dynamic Routes"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-green-100 px-1 rounded">generateStaticParams</code> - All routes pre-generated at build time',
            '<strong>Build Time:</strong> Routes defined by <code class="bg-green-100 px-1 rounded">generateStaticParams()</code>, all pages built during <code class="bg-green-100 px-1 rounded">npm run build</code>',
            '<strong>Route Generation:</strong> Only predefined routes are created - unknown slugs return 404',
            '<strong>Runtime:</strong> Pure static HTML for each slug - no server processing',
            '<strong>Data Freshness:</strong> Frozen at build time - same as when <code class="bg-green-100 px-1 rounded">npm run build</code> ran',
            '<strong>Updates:</strong> Requires rebuild to update content or add new routes',
            '<strong>Use Case:</strong> Known finite routes (product catalog, blog with fixed posts, finite content)',
            '<strong>Generated at:</strong> ' + generatedAt + ' (frozen until next build)'
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
