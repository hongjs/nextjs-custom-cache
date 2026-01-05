import { GetServerSideProps } from 'next';
import PagesLayout from '@/components/PagesLayout';
import { PromotionDetail } from '@/components/PromotionDetail';
import { getPromotionById } from '@/utils/directus';

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
        <h1 className="text-3xl font-bold mb-4">Promotion Detail (Page SSR)</h1>

        <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
          <strong>Generated on each request:</strong> {generatedAt}
          <br />
          <small>The page is rendered on every request at the server. HTML is generated dynamically each time, so both first and subsequent requests require a server round-trip. Best when data must always be fresh per request.</small>
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
