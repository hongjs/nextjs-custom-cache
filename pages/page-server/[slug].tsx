import { GetServerSideProps } from 'next';
import PagesLayout from '@/components/PagesLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { getPromotionById } from '@/utils/directus';
import { PageHeader } from '@/components/PageHeader';

interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

interface Props {
  promotion: Promotion | null;
  error?: string;
  generatedAt: string;
}

export default function SSRDetailPage({ promotion, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="Pages Router SSR - Server-Side Rendering"
          cachingStrategy="🔄 SSR with getServerSideProps (Dynamic Routes)"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-purple-100 px-1 rounded">getServerSideProps</code> - Server renders every request',
            '<strong>Every Visit:</strong> Page re-rendered on server for each slug, no caching at all',
            '<strong>Dynamic Routes:</strong> Works with any slug value - routes don\'t need to be predefined',
            '<strong>Data Freshness:</strong> Always current - fetches latest data for the specific item',
            '<strong>Performance Trade-off:</strong> Slower response but guaranteed fresh data',
            '<strong>Generated at:</strong> ' + generatedAt,
            '<strong>Use Case:</strong> User profiles, order status pages, or any frequently changing detail pages'
          ]}
          variant="purple"
        />

        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <h2 className="text-xl font-semibold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {promotion && <PromotionDetail promotion={promotion} />}
      </div>
    </PagesLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    const result = await getPromotionById(slug, 60);

    if(result.error) {
      return {
        props: {
          promotion: null,
          error: String(result.error),
          generatedAt: new Date().toISOString(),
        }
      }
    }

    return {
      props: {
        promotion: result.promotion || null,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      props: {
        promotion: null,
        error: String(error),
        generatedAt: new Date().toISOString(),
      },
    };
  }
};
