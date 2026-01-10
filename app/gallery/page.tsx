import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import Image from 'next/image';

/**
 * Image Gallery - Tests Next.js Image Optimization with Cache Handler
 *
 * This page demonstrates:
 * - Next.js Image component optimization
 * - Binary/Buffer data handling in Cache Handler
 * - Image cache behavior (separate from page cache)
 */

export const revalidate = 300;

interface Photo {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

async function getPhotos(): Promise<Photo[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=12', {
    next: {
      revalidate: 300,
      tags: ['gallery-photos']
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }

  const photos = await response.json();

  // Replace via.placeholder.com URLs with picsum.photos (more reliable)
  return photos.map((photo: Photo, index: number) => ({
    ...photo,
    url: `https://picsum.photos/seed/${photo.id}/600/400`,
    thumbnailUrl: `https://picsum.photos/seed/${photo.id}/150/150`
  }));
}

export default async function GalleryPage() {
  const photos = await getPhotos();
  const generatedAt = new Date().toISOString();

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 font-sans max-w-7xl mx-auto">
        <PageHeader
          title="Image Gallery - Next.js Image Optimization"
          cachingStrategy="🖼️ Image Optimization + ISR (revalidate: 300s)"
          description={[
            '<strong>What This Tests:</strong> Binary/Buffer data handling in Custom Cache Handler',
            '<strong>Page Cache:</strong> HTML cached for 300 seconds (like other ISR pages)',
            '<strong>Image Cache:</strong> Optimized images cached separately by Next.js',
            '<strong>Cache Handler Impact:</strong> Handler must properly handle Buffer data without JSON.stringify errors',
            '<strong>Image Formats:</strong> Next.js automatically converts to WebP/AVIF',
            '<strong>Image Sizes:</strong> Multiple sizes generated (responsive)',
            '<strong>Generated at:</strong> ' + generatedAt,
            '<strong>Purge:</strong> /api/revalidate?tags=gallery-photos'
          ]}
          variant="purple"
        />

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 border-2 border-purple-200">
          <h2 className="text-lg sm:text-xl font-bold text-purple-900 mb-3">🧪 Test Checklist for QA:</h2>
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base text-purple-800 mb-2">✅ Expected Behavior:</h3>
              <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                <li>• First load: All images load (may be slow)</li>
                <li>• Refresh: Images load instantly (cached)</li>
                <li>• Network tab: See /_next/image?url=...</li>
                <li>• No errors in server logs</li>
                <li>• Buffer data handled correctly</li>
              </ul>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base text-red-800 mb-2">❌ Failure Signs:</h3>
              <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                <li>• Error: &quot;Cannot stringify Buffer&quot;</li>
                <li>• Images don&apos;t load (broken icons)</li>
                <li>• Redis errors in logs</li>
                <li>• Cache handler crashes</li>
                <li>• Memory leaks (Redis fills up)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>📝 Note:</strong> Image optimization data is stored as <code className="bg-blue-100 px-1 rounded">Buffer</code> objects.
            Your cache handler must convert these to Base64 strings before JSON.stringify, then back to Buffer on retrieval.
            Check cache-handler-v4.js lines 229-263 for Buffer handling implementation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={photo.id <= 4} // Prioritize first 4 images
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">
                  Photo #{photo.id} • Album {photo.albumId}
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {photo.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🔍 How to Verify Image Caching:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              <strong>Browser DevTools Network Tab:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Look for requests to <code className="bg-gray-100 px-1 rounded">/_next/image?url=...</code></li>
                <li>• First load: Status 200, slower response</li>
                <li>• Reload: Status 304 (Not Modified) or instant 200</li>
              </ul>
            </li>
            <li>
              <strong>Server Logs:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Check for <code className="bg-gray-100 px-1 rounded">[Cache] Redis SET</code> with image keys</li>
                <li>• Should NOT see Buffer serialization errors</li>
                <li>• Should see Base64 encoding logs (if enabled)</li>
              </ul>
            </li>
            <li>
              <strong>Redis (if available):</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• <code className="bg-gray-100 px-1 rounded">redis-cli KEYS nextjs:*</code></li>
                <li>• Look for image optimization keys</li>
                <li>• Verify data is Base64 strings, not raw buffers</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}
