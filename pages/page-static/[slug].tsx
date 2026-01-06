import { GetStaticProps, GetStaticPaths } from 'next';
import PagesLayout from '@/components/PagesLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { getPromotions, getPromotionById } from '@/utils/directus';
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

export default function StaticDetailPage({ promotion, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="Pages Router ISR - Incremental Static Regeneration"
          cachingStrategy="⏱️ ISR with getStaticPaths + fallback: 'blocking'"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">getStaticProps + getStaticPaths</code> - Hybrid static/on-demand generation',
            '<strong>Build Time:</strong> Predefined paths generated during build via <code class="bg-blue-100 px-1 rounded">getStaticPaths</code>',
            '<strong>Unknown Routes:</strong> <code class="bg-blue-100 px-1 rounded">fallback: \'blocking\'</code> - New slugs generated on-demand, then cached',
            '<strong>First Visit (New Slug):</strong> Rendered on server, then cached permanently',
            '<strong>Subsequent Visits:</strong> Served instantly from cache',
            '<strong>Generated at:</strong> ' + generatedAt,
            '<strong>Use Case:</strong> Best of both worlds - fast for known routes, scalable for new ones (e-commerce products)'
          ]}
          variant="blue"
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

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const data = await getPromotions(60);

    const paths = (data.data || []).map((promotion: Promotion) => ({
      params: { slug: String(promotion.promo_id) },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
