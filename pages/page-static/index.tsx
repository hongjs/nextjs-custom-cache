import { ItemCard } from '@/components/ItemCard';
import { PageHeader } from '@/components/PageHeader';
import PagesLayout from '@/components/PagesLayout';
import { getItems, type Item } from '@/utils/api';
import { GetStaticProps } from 'next';


interface Props {
  data: any;
  error?: string;
  generatedAt: string;
}

export default function StaticPage({ data, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Pages Router ISR - Incremental Static Regeneration"
          cachingStrategy="⏱️ ISR with getStaticProps + revalidate: 60"
          description={[
            '<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">getStaticProps + revalidate: 60</code> - Build-time generation with time-based revalidation',
            '<strong>Build Time:</strong> Initially generated during <code class="bg-blue-100 px-1 rounded">npm run build</code>',
            '<strong>First Request:</strong> Served instantly from pre-built static HTML',
            '<strong>After 60 seconds:</strong> Next request triggers background regeneration, stale cache served',
            '<strong>Data Freshness:</strong> Maximum 60 seconds stale - automatic background updates',
            '<strong>Generated at:</strong> ' + generatedAt,
            '<strong>Use Case:</strong> Content that updates periodically - news sites, product catalogs, blog lists'
          ]}
          variant="blue"
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
    const data = await getItems(undefined);
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
