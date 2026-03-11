import { useState, useEffect, useRef } from 'react';
import { Flower2, Wind, Dumbbell } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

const WELLNESS_COLORS: Record<string, { border: string; bg: string; borderB: string; icon: string; text: string }> = {
  violet:  { border: 'border-violet-100',  bg: 'bg-violet-50',  borderB: 'border-violet-100',  icon: 'text-violet-600',  text: 'text-violet-800' },
  cyan:    { border: 'border-cyan-100',    bg: 'bg-cyan-50',    borderB: 'border-cyan-100',    icon: 'text-cyan-600',    text: 'text-cyan-800' },
  blue:    { border: 'border-blue-100',    bg: 'bg-blue-50',    borderB: 'border-blue-100',    icon: 'text-blue-600',    text: 'text-blue-800' },
  emerald: { border: 'border-emerald-100', bg: 'bg-emerald-50', borderB: 'border-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-800' },
};

const TOOL_META: Record<string, { icon: typeof Wind; name: string; color: string }> = {
  guided_meditation: { icon: Flower2, name: 'Meditação Guiada', color: 'violet' },
  breathing_exercises: { icon: Wind, name: 'Respiração', color: 'cyan' },
  wim_hof_breathing: { icon: Wind, name: 'Wim Hof', color: 'blue' },
  chair_exercises: { icon: Dumbbell, name: 'Exercícios na Cadeira', color: 'emerald' },
};

export function WellnessCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const meta = TOOL_META[event.tool] || TOOL_META.breathing_exercises;
  const Icon = meta.icon;
  const steps = (d.steps as string[]) || [];
  const duration = (d.duration as number) || 0;
  const msg = (d.message as string) || '';
  const pattern = (d.pattern as string) || '4-7-8'; // inhale-hold-exhale

  // Breathing animation
  const isBreathing = event.tool.includes('breathing') || event.tool.includes('wim_hof');
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [scale, setScale] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isBreathing) return;
    const parts = pattern.split('-').map(Number);
    const [inhale, hold, exhale] = [parts[0] || 4, parts[1] || 7, parts[2] || 8];
    const total = (inhale + hold + exhale) * 1000;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed = (elapsed + 100) % total;
      const sec = elapsed / 1000;
      if (sec < inhale) { setPhase('inhale'); setScale(1 + (sec / inhale) * 0.5); }
      else if (sec < inhale + hold) { setPhase('hold'); setScale(1.5); }
      else { setPhase('exhale'); setScale(1.5 - ((sec - inhale - hold) / exhale) * 0.5); }
    }, 100);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isBreathing, pattern]);

  const colors = WELLNESS_COLORS[meta.color] || WELLNESS_COLORS.cyan;

  return (
    <div className={`rounded-xl border bg-white overflow-hidden ${colors.border}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${colors.bg} border-b ${colors.borderB}`}>
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <span className={`text-xs font-semibold ${colors.text}`}>{meta.name}</span>
        {duration > 0 && <span className="text-xs text-gray-500 ml-auto">{duration}min</span>}
      </div>
      <div className="px-3 py-4">
        {isBreathing && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center transition-transform duration-500"
              style={{ transform: `scale(${scale})` }}
            >
              <span className="text-sm font-medium text-blue-800 capitalize">{
                phase === 'inhale' ? 'Inspire' : phase === 'hold' ? 'Segure' : 'Expire'
              }</span>
            </div>
            <p className="text-xs text-gray-400">Padrão: {pattern}</p>
          </div>
        )}
        {steps.length > 0 && (
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                <span className="text-sm text-gray-700">{s}</span>
              </li>
            ))}
          </ol>
        )}
        {!isBreathing && steps.length === 0 && msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
