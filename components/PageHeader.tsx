interface PageHeaderProps {
  title: string;
  cachingStrategy?: string;
  description: string[];
  variant?: 'blue' | 'green' | 'purple';
}

export function PageHeader({
  title,
  cachingStrategy,
  description,
  variant = 'blue'
}: PageHeaderProps) {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      code: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      code: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      code: 'bg-purple-100'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div>
      <h1 className="mb-6 text-2xl md:text-3xl lg:text-4xl font-bold">{title}</h1>

      <div className={`${styles.bg} p-4 md:p-6 rounded-lg mb-4 border ${styles.border}`}>
        {cachingStrategy && (
          <>
            <strong className="block mb-2 text-sm md:text-base">{cachingStrategy}</strong>
          </>
        )}
        <ul className="space-y-2 text-xs md:text-sm">
          {description.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
