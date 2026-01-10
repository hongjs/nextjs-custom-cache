import Link from 'next/link';

interface RouteCardProps {
  route: {
    path: string;
    title: string;
    description: string;
    cacheType: string;
    cacheBehavior: string;
    color: string;
    icon: string;
    keyFeatures: string[];
  };
}

const colorClasses = {
  blue: {
    border: 'border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-800',
  },
  green: {
    border: 'border-green-200 hover:border-green-400',
    badge: 'bg-green-100 text-green-800',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-400',
    badge: 'bg-purple-100 text-purple-800',
  },
  orange: {
    border: 'border-orange-200 hover:border-orange-400',
    badge: 'bg-orange-100 text-orange-800',
  },
  red: {
    border: 'border-red-200 hover:border-red-400',
    badge: 'bg-red-100 text-red-800',
  },
  cyan: {
    border: 'border-cyan-200 hover:border-cyan-400',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  indigo: {
    border: 'border-indigo-200 hover:border-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800',
  },
};

export function RouteCard({ route }: RouteCardProps) {
  const colors = colorClasses[route.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Link href={route.path}>
      <div className={`bg-white rounded-xl shadow-lg border-2 ${colors.border} hover:shadow-xl transition-all duration-300 p-6 h-full cursor-pointer group`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{route.icon}</span>
            <div>
              <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {route.title}
              </h4>
              <p className="text-sm text-gray-600">{route.description}</p>
            </div>
          </div>
        </div>

        {/* Cache Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 ${colors.badge} text-xs font-semibold rounded-full`}>
              {route.cacheType}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
              {route.cacheBehavior}
            </span>
          </div>
        </div>

        {/* Key Features */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Key Features:</p>
          <ul className="space-y-1">
            {route.keyFeatures.map((feature, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Link Arrow */}
        <div className="mt-4 flex justify-end">
          <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
