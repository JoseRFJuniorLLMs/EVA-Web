import { Newspaper, Star, BookOpen } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function EntertainmentCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const isHoroscope = event.tool === 'daily_horoscope';
  const articles = (d.articles as Array<{ title: string; source?: string; summary?: string }>) || [];
  const msg = (d.message as string) || '';
  const sign = (d.sign as string) || '';
  const prediction = (d.prediction as string) || (d.text as string) || '';
  const content = (d.content as string) || '';

  if (isHoroscope) {
    return (
      <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-100/50 border-b border-purple-100">
          <Star className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-800">Horóscopo {sign && `— ${sign}`}</span>
        </div>
        <div className="px-3 py-3">
          <p className="text-sm text-gray-700 leading-relaxed">{prediction || msg}</p>
        </div>
      </div>
    );
  }

  if (event.tool === 'religious_content') {
    return (
      <div className="rounded-xl border border-amber-100 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-800">Conteúdo Religioso</span>
        </div>
        <div className="px-3 py-3">
          <p className="text-sm text-gray-700 leading-relaxed italic">{content || msg}</p>
        </div>
      </div>
    );
  }

  // Newspaper
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <Newspaper className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-semibold text-gray-800">Notícias</span>
      </div>
      <div className="divide-y divide-gray-50">
        {articles.length > 0 ? articles.slice(0, 5).map((a, i) => (
          <div key={i} className="px-3 py-2">
            <p className="text-sm font-medium text-gray-800">{a.title}</p>
            {a.source && <p className="text-xs text-gray-400">{a.source}</p>}
            {a.summary && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.summary}</p>}
          </div>
        )) : (
          <div className="px-3 py-3 text-sm text-gray-600">{msg || 'Conteúdo carregado'}</div>
        )}
      </div>
    </div>
  );
}
