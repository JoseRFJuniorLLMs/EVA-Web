import { ExternalLink, Globe } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function WebSearchCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const results = (d.results as Array<{ title: string; url: string; snippet: string }>) || [];
  const query = (d.query as string) || (d.message as string) || event.tool;
  const url = d.url as string;

  const content = (d.content as string) || (d.text as string) || '';

  // show_webpage / browse_webpage — link + extracted content instead of broken iframe
  if (url) {
    return (
      <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800 truncate flex-1">{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <ExternalLink className="w-3.5 h-3.5 text-blue-500 hover:text-blue-700" />
          </a>
        </div>
        {content ? (
          <div className="px-3 py-3 text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
            {content.slice(0, 800)}{content.length > 800 ? '...' : ''}
          </div>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="block px-3 py-3 text-sm text-blue-600 hover:underline">
            Abrir página
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
        <Globe className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-semibold text-blue-800">Busca: {query}</span>
      </div>
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
    </div>
  );
}
