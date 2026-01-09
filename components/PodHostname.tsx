'use client';

interface PodHostnameProps {
  hostname: string;
}

export function PodHostname({ hostname }: PodHostnameProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-sm font-medium">Pod Hostname:</span>
        <code className="bg-white/20 px-3 py-1 rounded text-sm font-mono">
          {hostname}
        </code>
      </div>
    </div>
  );
}
