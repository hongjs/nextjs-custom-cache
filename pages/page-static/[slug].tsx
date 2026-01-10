import { ItemDetail } from '@/components/ItemDetail';
import { PageHeader } from '@/components/PageHeader';
import PagesLayout from '@/components/PagesLayout';
import { getItemById, getItems, type Item } from '@/utils/api';
import { getPodHostname } from '@/utils/hostname';
import { REVALIDATE_TIME } from '@/utils/constants';
import { GetStaticPaths, GetStaticProps } from 'next';

interface Props {
  item: Item | null;
  error?: string;
  generatedAt: string;
  hostname: string;
}

export default function StaticDetailPage({ item, error, generatedAt }: Props) {
  return (
    <PagesLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <PageHeader
          title="Pages Router ISR - Incremental Static Regeneration"
          cachingStrategy={`⏱️ ISR with getStaticPaths + revalidate: ${REVALIDATE_TIME}s`}
          description={[
            `<strong>Cache Strategy:</strong> <code class="bg-blue-100 px-1 rounded">getStaticProps + getStaticPaths + revalidate: ${REVALIDATE_TIME}</code> - Hybrid static/on-demand generation with revalidation`,
            '<strong>Build Time:</strong> Predefined paths generated during build via <code class="bg-blue-100 px-1 rounded">getStaticPaths</code>',
            '<strong>Unknown Routes:</strong> <code class="bg-blue-100 px-1 rounded">fallback: \'blocking\'</code> - New slugs generated on-demand, then cached',
            `<strong>First Visit (New Slug):</strong> Rendered on server, then cached with ${REVALIDATE_TIME}s revalidation`,
            `<strong>After ${REVALIDATE_TIME} seconds:</strong> Next request triggers background regeneration while serving stale cache`,
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

        {item && <ItemDetail item={item} />}
      </div>
    </PagesLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const data = await getItems(Infinity);

    if ('error' in data) {
      console.error('Error in getStaticPaths:', data.error);
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    const paths = data.data.map((item) => ({
      params: { slug: String(item.id) },
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
  const hostname = getPodHostname();

  try {
    const slug = params?.slug as string;
    const result = await getItemById(slug, REVALIDATE_TIME);

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
      revalidate: REVALIDATE_TIME,
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
