import type { Item } from '@/utils/api';
import Image from 'next/image';

interface ItemDetailProps {
  item: Item;
}

export function ItemDetail({ item }: ItemDetailProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 m-0">
          Photo #{item.id}
        </h2>
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
          Album {item.albumId}
        </span>
      </div>

      {item.url && (
        <div className="mb-6">
          <Image
            src={item.url}
            width={536}
            height={354}
            alt={item.title || `Photo ${item.id}`}
            className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <strong className="block mb-2 text-gray-600">Title:</strong>
          <p className="m-0 text-gray-800">{item.title}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <strong className="block mb-2 text-gray-600">Photo ID:</strong>
          <p className="m-0 text-gray-800">{item.id}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <strong className="block mb-2 text-gray-600">Album ID:</strong>
          <p className="m-0 text-gray-800">{item.albumId}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <strong className="block mb-2 text-gray-600">Image URL:</strong>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {item.url}
          </a>
        </div>
      </div>
    </div>
  );
}
