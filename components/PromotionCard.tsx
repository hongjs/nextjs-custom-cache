import { ReactNode } from 'react';

interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

interface PromotionCardProps {
  item: Promotion;
  index: number;
  variant?: 'simple' | 'detailed';
  linkPrefix?: string;
  accentColor?: 'blue' | 'yellow';
  formatDate?: (value: string) => string;
  renderValue?: (value: any) => ReactNode;
}

export function PromotionCard({
  item,
  index,
  variant = 'simple',
  linkPrefix = '',
  accentColor = 'blue',
  formatDate,
  renderValue,
}: PromotionCardProps) {
  const cardContent = (
    <>
      <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 m-0">
          #{item.promo_id || index + 1}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            item.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.status || 'unknown'}
        </span>
      </div>

      {variant === 'simple' ? (
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(item).map(([key, value]) => {
            if (key === 'promo_id' || key === 'status') return null;

            const isDate = key.includes('date') || key.includes('time');
            const displayValue = isDate && formatDate
              ? formatDate(value as string)
              : renderValue
              ? renderValue(value)
              : String(value);

            return (
              <div key={key} className="flex flex-col">
                <strong className="text-sm text-gray-600 capitalize mb-1">
                  {key.replace(/_/g, ' ')}:
                </strong>
                <span
                  className={`text-base text-gray-800 break-words ${
                    typeof value === 'object' ? 'whitespace-pre-wrap' : ''
                  }`}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {item.promo_id && (
        <div
          className={`mt-${variant === 'detailed' ? '4 pt-3 border-t border-gray-100' : '3'} text-${accentColor}-600 text-sm font-medium text-right`}
        >
          View Details →
        </div>
      )}
    </>
  );

  const cardClasses = `bg-white p-6 rounded-lg shadow${variant === 'detailed' ? '-md' : ''} border border-gray-200 hover:shadow-lg hover:border-${accentColor}-300 transition-all`;

  return item.promo_id ? (
    <a
      href={`${linkPrefix}${item.promo_id}`}
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
