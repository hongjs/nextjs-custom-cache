import { GetStaticProps } from 'next';
import PagesLayout from '@/components/PagesLayout';
import { PromotionCard } from '@/components/PromotionCard';

interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

interface Props {
  data: any;
  error?: string;
  generatedAt: string;
}

export default function StaticPage({ data, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Pages ISR (getStaticProps)</h1>

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

        {data && data.data && (
          <div>
            <div className="bg-white p-4 rounded-lg mb-4 shadow">
              <strong>Total Items:</strong> {data.data.length}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((item: Promotion, index: number) => (
                <PromotionCard
                  key={item.promo_id || index}
                  item={item}
                  index={index}
                  variant="detailed"
                  linkPrefix="/page-static/"
                  accentColor="blue"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PagesLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const directusHost = process.env.DIRECTUS_HOST;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusHost || !directusToken) {
      return {
        props: {
          data: null,
          error: 'Configuration missing',
          generatedAt: new Date().toISOString(),
        },
        revalidate: 60,
      };
    }

    const url = `${directusHost}/promotions?limit=10&filter[status][_eq]=draft`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
      },
    });

    const data = await response.json();

    return {
      props: {
        data,
        generatedAt: new Date().toISOString(),
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      props: {
        data: null,
        error: String(error),
        generatedAt: new Date().toISOString(),
      },
      revalidate: 60,
    };
  }
};
