import { GetStaticProps, GetStaticPaths } from 'next';
import PagesLayout from '@/components/PagesLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { getPromotions, getPromotionById } from '@/utils/directus';

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
        <h1 className="text-3xl font-bold mb-4">Promotion Detail (ISR)</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <strong>Generated at build time:</strong> {generatedAt}
          <br />
          <small>The page is generated at build time into static HTML. Because it’s fully pre-rendered, the first and subsequent requests are served instantly from the CDN/cache. Best for content that rarely changes.</small>
        </div>

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
