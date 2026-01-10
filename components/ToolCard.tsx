import Link from 'next/link';

interface ToolCardProps {
  tool: {
    path: string;
    title: string;
    description: string;
    color: string;
    icon: string;
    features: string[];
  };
}

const colorClasses = {
  blue: 'border-blue-200 hover:border-blue-400',
  green: 'border-green-200 hover:border-green-400',
  purple: 'border-purple-200 hover:border-purple-400',
  orange: 'border-orange-200 hover:border-orange-400',
  red: 'border-red-200 hover:border-red-400',
  cyan: 'border-cyan-200 hover:border-cyan-400',
  indigo: 'border-indigo-200 hover:border-indigo-400',
};

export function ToolCard({ tool }: ToolCardProps) {
  const borderColors = colorClasses[tool.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Link href={tool.path}>
      <div className={`bg-white rounded-xl shadow-lg border-2 ${borderColors} hover:shadow-xl transition-all duration-300 p-6 cursor-pointer group h-full`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{tool.icon}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {tool.title}
            </h4>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Features:</p>
          <ul className="space-y-1">
            {tool.features.map((feature, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
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
