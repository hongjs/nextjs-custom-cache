import { ReactNode } from 'react';
import type { Item } from '@/utils/api';

interface ItemCardProps {
  item: Item;
  index: number;
  variant?: 'simple' | 'detailed';
  linkPrefix?: string;
  accentColor?: 'blue' | 'yellow';
  formatDate?: (value: string) => string;
  renderValue?: (value: any) => ReactNode;
}

export function ItemCard({
  item,
  index,
  variant = 'simple',
  linkPrefix = '',
  accentColor = 'blue',
  formatDate,
  renderValue,
}: ItemCardProps) {
  const cardContent = (
    <>
      {item.thumbnailUrl && variant === 'detailed' && (
        <div className="mb-4">
          <img
            src={item.thumbnailUrl}
            alt={item.title || `Photo ${item.id}`}
            className="w-full h-40 object-cover rounded"
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 m-0">
          Photo #{item.id || index + 1}
        </h3>
        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
          Album {item.albumId}
        </span>
      </div>

      {variant === 'simple' ? (
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <strong className="text-sm text-gray-600 capitalize mb-1">Title:</strong>
            <span className="text-base text-gray-800 break-words line-clamp-2">
              {item.title}
            </span>
          </div>
        </div>
      )}

      {item.id && (
        <div
          className={`mt-${variant === 'detailed' ? '4 pt-3 border-t border-gray-100' : '3'} text-${accentColor}-600 text-sm font-medium text-right`}
        >
          View Details →
        </div>
      )}
    </>
  );

  const cardClasses = `bg-white p-6 rounded-lg shadow${variant === 'detailed' ? '-md' : ''} border border-gray-200 hover:shadow-lg hover:border-${accentColor}-300 transition-all`;

  return item.id ? (
    <a
      href={`${linkPrefix}${item.id}`}
      className={`${cardClasses} cursor-pointer no-underline block`}
    >
      {cardContent}
    </a>
  ) : (
    <div className={cardClasses}>
      {cardContent}
    </div>
  );
}
