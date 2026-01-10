import { ItemCard } from '@/components/ItemCard';
import { PageHeader } from '@/components/PageHeader';
import PagesLayout from '@/components/PagesLayout';
import { getItems, type Item } from '@/utils/api';
import { getPodHostname } from '@/utils/hostname';
import { GetServerSideProps } from 'next';


interface Props {
  data: any;
  error?: string;
  generatedAt: string;
  hostname: string;
}

export default function SSRPage({ data, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Pages Router SSR - Server-Side Rendering"
          cachingStrategy="🔄 SSR with getServerSideProps - No Cache"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-purple-100 px-1 rounded">getServerSideProps</code> - Server-side rendering on every request',
            '<strong>Rendering Time:</strong> HTML generated fresh on each request, no caching',
            '<strong>Every Request:</strong> Full server round-trip required - slower response time',
            '<strong>Data Freshness:</strong> Always 100% up-to-date - real-time data on every page load',
            '<strong>Performance:</strong> Slower than static/cached - server processes each request',
            '<strong>Generated at:</strong> ' + generatedAt,
            '<strong>Use Case:</strong> User-specific pages, dashboards, real-time data that cannot be cached'
          ]}
          variant="purple"
        />

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
              {data.data.map((item: Item, index: number) => (
                <ItemCard
                  key={item.id || index}
                  item={item}
                  index={index}
                  variant="detailed"
                  linkPrefix="/page-server/"
                  accentColor="yellow"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PagesLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const hostname = getPodHostname();

  try {
    const data = await getItems(undefined, ['photos']);
    return {
      props: {
        data,
        generatedAt: new Date().toISOString(),
        hostname,
      },
    };
  } catch (error) {
    return {
      props: {
        data: null,
        error: String(error),
        generatedAt: new Date().toISOString(),
        hostname,
      },
    };
  }
};
