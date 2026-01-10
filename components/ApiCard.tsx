interface ApiCardProps {
  api: {
    path: string;
    title: string;
    description: string;
    method: string;
    cacheType: string;
    cacheBehavior: string;
    color: string;
    icon: string;
    keyFeatures: string[];
    testCommand: string;
  };
}

const colorClasses = {
  blue: {
    border: 'border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  green: {
    border: 'border-green-200 hover:border-green-400',
    badge: 'bg-green-100 text-green-800',
    button: 'bg-green-600 hover:bg-green-700',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-400',
    badge: 'bg-purple-100 text-purple-800',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
  orange: {
    border: 'border-orange-200 hover:border-orange-400',
    badge: 'bg-orange-100 text-orange-800',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
  red: {
    border: 'border-red-200 hover:border-red-400',
    badge: 'bg-red-100 text-red-800',
    button: 'bg-red-600 hover:bg-red-700',
  },
  cyan: {
    border: 'border-cyan-200 hover:border-cyan-400',
    badge: 'bg-cyan-100 text-cyan-800',
    button: 'bg-cyan-600 hover:bg-cyan-700',
  },
  indigo: {
    border: 'border-indigo-200 hover:border-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800',
    button: 'bg-indigo-600 hover:bg-indigo-700',
  },
};

export function ApiCard({ api }: ApiCardProps) {
  const colors = colorClasses[api.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${colors.border} hover:shadow-xl transition-all duration-300 p-4 sm:p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="text-3xl sm:text-4xl shrink-0">{api.icon}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900">{api.title}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{api.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 ${colors.badge} text-xs font-bold rounded shrink-0 self-start`}>
          {api.method}
        </span>
      </div>

      {/* Cache Info */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <span className={`px-2 sm:px-3 py-1 ${colors.badge} text-xs font-semibold rounded-full`}>
          {api.cacheType}
        </span>
        <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
          {api.cacheBehavior}
        </span>
      </div>

      {/* Key Features */}
      <div className="mb-4 border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Key Features:</p>
        <ul className="space-y-1">
          {api.keyFeatures.map((feature, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Test Command */}
      <div className="bg-gray-900 rounded-lg p-2 sm:p-3 mb-4 overflow-x-auto">
        <p className="text-xs text-gray-400 mb-1">Test command:</p>
        <code className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap">
          {api.testCommand}
        </code>
      </div>

      {/* Links */}
      <div className="flex gap-2">
        <a
          href={api.path}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 px-3 sm:px-4 py-2 ${colors.button} text-white text-xs sm:text-sm font-medium rounded-lg transition-colors text-center`}
        >
          Open API ↗
        </a>
      </div>
    </div>
  );
}
