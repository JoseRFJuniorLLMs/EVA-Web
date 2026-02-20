import { useState, useEffect, useRef } from 'react';
import { Timer, Pause, Play, X } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

interface TimerPlayerProps {
  event: ToolEvent;
  onClose: () => void;
}

export function TimerPlayer({ event, onClose }: TimerPlayerProps) {
  const d = event.toolData as Record<string, unknown>;
  const duration = ((d.duration as number) || 25) * 60; // minutes to seconds
  const label = (d.label as string) || 'Pomodoro';
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = ((duration - remaining) / duration) * 100;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-xl shadow-lg">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <Timer className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xl font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</p>
      </div>
      <button onClick={() => setRunning(r => !r)} className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
