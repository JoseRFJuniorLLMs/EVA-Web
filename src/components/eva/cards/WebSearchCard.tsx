import { ExternalLink, Globe } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function WebSearchCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const results = (d.results as Array<{ title: string; url: string; snippet: string }>) || [];
  const query = (d.query as string) || (d.message as string) || event.tool;
  const url = d.url as string;

  const content = (d.content as string) || (d.text as string) || '';

  // show_webpage / browse_webpage — link + extracted content instead of broken iframe
  if (url) {
    return (
      <CardShell
        icon={Globe}
        title={url}
        color="blue"
        badge={
          <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <ExternalLink className="w-3.5 h-3.5 text-blue-500 hover:text-blue-700" />
          </a>
        }
      >
        {content ? (
          <div className="px-3 py-3 text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {content.slice(0, 800)}{content.length > 800 ? '...' : ''}
          </div>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="block px-3 py-3 text-sm text-blue-600 hover:underline">
            Abrir página
          </a>
        )}
      </CardShell>
    );
  }

  return (
    <CardShell icon={Globe} title={`Busca: ${query}`} color="blue">
      <div className="divide-y divide-gray-50">
        {results.length > 0 ? results.slice(0, 5).map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 px-3 py-2 hover:bg-blue-50/50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-700 truncate">{r.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{r.snippet}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 shrink-0 mt-1" />
          </a>
        )) : (
          <div className="px-3 py-3 text-sm text-gray-600">{String(d.message || 'Busca realizada')}</div>
        )}
      </div>
    </CardShell>
  );
}
