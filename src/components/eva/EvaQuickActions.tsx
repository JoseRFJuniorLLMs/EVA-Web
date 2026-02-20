import { useState } from 'react';
import {
  Search, Mail, MessageCircle, Music, Play, Calendar, CheckSquare, Bell,
  MapPin, Navigation, Flower2, Wind, HelpCircle, Newspaper, Pill, Droplets,
  TrendingUp, Timer, BookOpen, Scale, AlertTriangle, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { QUICK_ACTIONS } from '../../types/eva-tools';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search, Mail, MessageCircle, Music, Play, Calendar, CheckSquare, Bell,
  MapPin, Navigation, Flower2, Wind, HelpCircle, Newspaper, Pill, Droplets,
  TrendingUp, Timer, BookOpen, Scale, AlertTriangle,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  red: 'bg-red-50 text-red-600 hover:bg-red-100',
  green: 'bg-green-50 text-green-600 hover:bg-green-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  teal: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
  violet: 'bg-violet-50 text-violet-600 hover:bg-violet-100',
  cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
  yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
  gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
  rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  sky: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
  lime: 'bg-lime-50 text-lime-600 hover:bg-lime-100',
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  stone: 'bg-stone-50 text-stone-600 hover:bg-stone-100',
};

interface EvaQuickActionsProps {
  onAction: (command: string) => void;
  collapsed?: boolean;
}

export function EvaQuickActions({ onAction, collapsed: initialCollapsed = true }: EvaQuickActionsProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-emerald-600 text-white p-2 rounded-l-xl shadow-lg hover:bg-emerald-700 transition-colors cursor-pointer"
        title="Ações rápidas"
      >
        <Zap className="w-4 h-4" />
        <ChevronLeft className="w-3 h-3 mt-1" />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-56 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-gray-800">Ações Rápidas</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {QUICK_ACTIONS.map(action => {
          const Icon = ICON_MAP[action.icon] || Zap;
          const colors = COLOR_MAP[action.color] || COLOR_MAP.gray;
          return (
            <button
              key={action.id}
              onClick={() => { onAction(action.command); setCollapsed(true); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${colors}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
