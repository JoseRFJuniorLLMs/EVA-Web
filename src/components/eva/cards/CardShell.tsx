import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type ColorScheme = 'blue' | 'red' | 'indigo' | 'gray' | 'green' | 'yellow' | 'purple' | 'amber' | 'emerald' | 'rose' | 'teal' | 'violet' | 'cyan' | 'sky' | 'lime' | 'stone' | 'orange' | 'pink';

const COLOR_CLASSES: Record<ColorScheme, { border: string; bg: string; headerBg: string; headerBorder: string; icon: string; title: string }> = {
  blue:    { border: 'border-blue-100',    bg: 'bg-white',  headerBg: 'bg-blue-50',    headerBorder: 'border-blue-100',    icon: 'text-blue-600',    title: 'text-blue-800' },
  red:     { border: 'border-red-100',     bg: 'bg-white',  headerBg: 'bg-red-50',     headerBorder: 'border-red-100',     icon: 'text-red-600',     title: 'text-red-800' },
  indigo:  { border: 'border-indigo-100',  bg: 'bg-white',  headerBg: 'bg-indigo-50',  headerBorder: 'border-indigo-100',  icon: 'text-indigo-600',  title: 'text-indigo-800' },
  gray:    { border: 'border-gray-200',    bg: 'bg-white',  headerBg: 'bg-gray-50',    headerBorder: 'border-gray-200',    icon: 'text-gray-600',    title: 'text-gray-800' },
  green:   { border: 'border-green-100',   bg: 'bg-white',  headerBg: 'bg-green-50',   headerBorder: 'border-green-100',   icon: 'text-green-600',   title: 'text-green-800' },
  yellow:  { border: 'border-yellow-100',  bg: 'bg-white',  headerBg: 'bg-yellow-50',  headerBorder: 'border-yellow-100',  icon: 'text-yellow-600',  title: 'text-yellow-800' },
  purple:  { border: 'border-purple-100',  bg: 'bg-white',  headerBg: 'bg-purple-50',  headerBorder: 'border-purple-100',  icon: 'text-purple-600',  title: 'text-purple-800' },
  amber:   { border: 'border-amber-100',   bg: 'bg-white',  headerBg: 'bg-amber-50',   headerBorder: 'border-amber-100',   icon: 'text-amber-600',   title: 'text-amber-800' },
  emerald: { border: 'border-emerald-100', bg: 'bg-white',  headerBg: 'bg-emerald-50', headerBorder: 'border-emerald-100', icon: 'text-emerald-600', title: 'text-emerald-800' },
  rose:    { border: 'border-rose-100',    bg: 'bg-white',  headerBg: 'bg-rose-50',    headerBorder: 'border-rose-100',    icon: 'text-rose-600',    title: 'text-rose-800' },
  teal:    { border: 'border-teal-100',    bg: 'bg-white',  headerBg: 'bg-teal-50',    headerBorder: 'border-teal-100',    icon: 'text-teal-600',    title: 'text-teal-800' },
  violet:  { border: 'border-violet-100',  bg: 'bg-white',  headerBg: 'bg-violet-50',  headerBorder: 'border-violet-100',  icon: 'text-violet-600',  title: 'text-violet-800' },
  cyan:    { border: 'border-cyan-100',    bg: 'bg-white',  headerBg: 'bg-cyan-50',    headerBorder: 'border-cyan-100',    icon: 'text-cyan-600',    title: 'text-cyan-800' },
  sky:     { border: 'border-sky-100',     bg: 'bg-white',  headerBg: 'bg-sky-50',     headerBorder: 'border-sky-100',     icon: 'text-sky-600',     title: 'text-sky-800' },
  lime:    { border: 'border-lime-100',    bg: 'bg-white',  headerBg: 'bg-lime-50',    headerBorder: 'border-lime-100',    icon: 'text-lime-600',    title: 'text-lime-800' },
  stone:   { border: 'border-stone-200',   bg: 'bg-white',  headerBg: 'bg-stone-50',   headerBorder: 'border-stone-200',   icon: 'text-stone-600',   title: 'text-stone-800' },
  orange:  { border: 'border-orange-100',  bg: 'bg-white',  headerBg: 'bg-orange-50',  headerBorder: 'border-orange-100',  icon: 'text-orange-600',  title: 'text-orange-800' },
  pink:    { border: 'border-pink-100',    bg: 'bg-white',  headerBg: 'bg-pink-50',    headerBorder: 'border-pink-100',    icon: 'text-pink-600',    title: 'text-pink-800' },
};

interface CardShellProps {
  icon: LucideIcon;
  title: string;
  color: ColorScheme;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function CardShell({ icon: Icon, title, color, badge, className, children }: CardShellProps) {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.gray;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden ${className || ''}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${c.headerBg} border-b ${c.headerBorder}`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
        <span className={`text-xs font-semibold ${c.title}`}>{title}</span>
        {badge && <span className="ml-auto">{badge}</span>}
      </div>
      {children}
    </div>
  );
}
