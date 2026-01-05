import { syntaxHighlight } from '@/utils/formatters';

export function JsonViewer({ data }: { data: any }) {
  const coloredJson = syntaxHighlight(JSON.stringify(data, null, 2));

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .json-key { color: #9cdcfe; }
          .json-string { color: #ce9178; }
          .number { color: #b5cea8; }
          .json-boolean { color: #569cd6; }
          .json-null { color: #569cd6; }
        `
      }} />
      <pre
        className="bg-[#1e1e1e] p-4 rounded overflow-auto text-[#d4d4d4]"
        dangerouslySetInnerHTML={{ __html: coloredJson }}
      />
    </>
  );
}
