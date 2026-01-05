interface Promotion {
  promo_id: string;
  status: string;
  [key: string]: any;
}

interface PromotionDetailProps {
  promotion: Promotion;
}

export function PromotionDetail({ promotion }: PromotionDetailProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 m-0">
          Promotion #{promotion.promo_id}
        </h2>
        <span
          className={`px-4 py-2 rounded-full text-sm font-bold ${
            promotion.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {promotion.status || 'unknown'}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(promotion).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 rounded">
            <strong className="block mb-2 text-gray-600 capitalize">
              {key.replace(/_/g, ' ')}:
            </strong>
            <pre className="m-0 whitespace-pre-wrap break-words font-mono text-sm">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
