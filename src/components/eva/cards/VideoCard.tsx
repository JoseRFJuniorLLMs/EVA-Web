import { Play, Film } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

function toYouTubeEmbed(raw: string): string {
  try {
    const u = new URL(raw);
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
      const id = u.searchParams.get('v')!;
      const t = u.searchParams.get('t');
      return `https://www.youtube.com/embed/${id}${t ? `?start=${parseInt(t)}` : ''}`;
    }
    // youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      const t = u.searchParams.get('t');
      return `https://www.youtube.com/embed/${id}${t ? `?start=${parseInt(t)}` : ''}`;
    }
  } catch { /* not a valid URL, return as-is */ }
  return raw;
}

export function VideoCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const videos = (d.results as Array<{ title: string; url: string; thumbnail?: string }>) || [];
  const url = (d.url as string) || (d.video_url as string) || '';
  const title = (d.title as string) || '';

  // Single video player
  if (url) {
    const embedUrl = toYouTubeEmbed(url);

    return (
      <CardShell icon={Play} title={title || 'Vídeo'} color="red">
        <div className="aspect-video">
          <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen allow="autoplay; encrypted-media" title={title} />
        </div>
      </CardShell>
    );
  }

  // Video search results
  return (
    <CardShell icon={Film} title="Vídeos encontrados" color="red">
      <div className="grid grid-cols-2 gap-2 p-2">
        {videos.length > 0 ? videos.slice(0, 4).map((v, i) => (
          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="group rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
            {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />}
            <p className="text-xs font-medium text-gray-800 p-2 line-clamp-2 group-hover:text-red-700">{v.title}</p>
          </a>
        )) : (
          <div className="col-span-2 px-3 py-3 text-sm text-gray-600">{String(d.message || 'Busca de vídeos realizada')}</div>
        )}
      </div>
    </CardShell>
  );
}
