import { ItemDetail } from '@/components/ItemDetail';
import { PageHeader } from '@/components/PageHeader';
import PagesLayout from '@/components/PagesLayout';
import { getItemById, Item } from '@/utils/api';
import { getPodHostname } from '@/utils/hostname';
import { GetServerSideProps } from 'next';


interface Props {
  item: Item | null;
  error?: string;
  generatedAt: string;
  hostname: string;
}

export default function SSRDetailPage({ item, error, generatedAt }: Props) {
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

        {item && <ItemDetail item={item} />}
      </div>
    </PagesLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const hostname = getPodHostname();

  try {
    const slug = params?.slug as string;
    const result = await getItemById(slug, undefined, ['photo', `photo-${slug}`]);

    if('error' in result) {
      return {
        props: {
          item: null,
          error: result.error,
          generatedAt: new Date().toISOString(),
          hostname,
        }
      }
    }

    return {
      props: {
        item: result.item,
        generatedAt: new Date().toISOString(),
        hostname,
      },
    };
  } catch (error) {
    return {
      props: {
        item: null,
        error: String(error),
        generatedAt: new Date().toISOString(),
        hostname,
      },
    };
  }
};
