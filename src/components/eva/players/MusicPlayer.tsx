import { useState, useRef, useEffect } from 'react';
import { Music, Pause, Play, X, Radio } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

interface MusicPlayerProps {
  event: ToolEvent;
  onClose: () => void;
}

export function MusicPlayer({ event, onClose }: MusicPlayerProps) {
  const d = event.toolData as Record<string, unknown>;
  const title = (d.title as string) || (d.name as string) || (d.track as string) || 'Música';
  const artist = (d.artist as string) || '';
  const cover = (d.cover as string) || (d.thumbnail as string) || '';
  const url = (d.url as string) || (d.stream_url as string) || '';
  const isRadio = event.tool === 'play_radio_station';
  const msg = (d.message as string) || '';

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;
    el.play().catch(() => setIsPlaying(false));
  }, [url]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    audioRef.current?.pause();
    onClose();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl shadow-lg">
      {cover ? (
        <img src={cover} alt={title} className="w-10 h-10 rounded-lg object-cover shadow" />
      ) : (
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          {isRadio ? <Radio className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {artist && <p className="text-xs text-white/70 truncate">{artist}</p>}
        {!artist && msg && <p className="text-xs text-white/70 truncate">{msg}</p>}
      </div>
      {url && <audio ref={audioRef} src={url} />}
      <button onClick={togglePlay} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
