import { getPromotions, getPromotionById } from '@/utils/directus';
import AppLayout from '@/components/AppLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { PageHeader } from '@/components/PageHeader';

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
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="App Router ISR - Incremental Static Regeneration"
          cachingStrategy="⏱️ ISR with revalidate: 60 seconds (Dynamic Routes)"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">next: { revalidate: 60 }</code> - On-demand ISR for dynamic routes',
            '<strong>First Visit (New Route):</strong> Page rendered on first request to this specific slug, then cached',
            '<strong>Subsequent Visits:</strong> Cached version served instantly for 60 seconds',
            '<strong>Revalidation:</strong> After 60s, background regeneration occurs while serving stale cache',
            '<strong>Dynamic Routes:</strong> Each unique slug (/:slug) is cached independently',
            '<strong>Scalability:</strong> Unlimited pages - only visited routes are generated and cached',
            '<strong>Use Case:</strong> Perfect for product details, blog posts, or any content with unique identifiers',
            '<strong>Generated at:</strong> ' + generatedAt
          ]}
          variant="blue"
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
 