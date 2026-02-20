import { Droplets, TrendingUp, CheckCircle } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function HabitCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const isWater = event.tool === 'log_water';
  const cups = (d.cups as number) || (d.count as number) || 0;
  const goal = (d.goal as number) || 8;
  const habits = (d.habits as Array<{ name: string; done?: boolean; streak?: number }>) || [];
  const msg = (d.message as string) || '';
  const stats = d.stats as Record<string, number>;

  if (isWater) {
    const pct = Math.min((cups / goal) * 100, 100);
    return (
      <div className="rounded-xl border border-sky-100 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 border-b border-sky-100">
          <Droplets className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-sky-800">Hidratação</span>
          <span className="text-xs text-sky-600 ml-auto">{cups}/{goal} copos</span>
        </div>
        <div className="px-3 py-3">
          <div className="w-full h-4 bg-sky-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {msg && <p className="text-xs text-gray-500 mt-2">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-lime-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-lime-50 border-b border-lime-100">
        <TrendingUp className="w-4 h-4 text-lime-600" />
        <span className="text-xs font-semibold text-lime-800">Hábitos</span>
      </div>
      <div className="px-3 py-2">
        {habits.length > 0 ? habits.map((h, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <CheckCircle className={`w-4 h-4 ${h.done ? 'text-green-500' : 'text-gray-300'}`} />
            <span className="text-sm text-gray-800 flex-1">{h.name}</span>
            {h.streak !== undefined && <span className="text-xs text-orange-500">🔥 {h.streak}</span>}
          </div>
        )) : stats ? (
          <div className="grid grid-cols-2 gap-2 py-1">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="text-center p-2 bg-lime-50 rounded-lg">
                <p className="text-lg font-bold text-lime-700">{val}</p>
                <p className="text-xs text-gray-500">{key}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 py-1">{msg || 'Hábito registrado'}</p>
        )}
      </div>
    </div>
  );
}
