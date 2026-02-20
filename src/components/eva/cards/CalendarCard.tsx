import { Calendar, Clock, MapPin } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function CalendarCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const events = (d.events as Array<{ title: string; start: string; end?: string; location?: string }>) || [];
  const title = (d.title as string) || (d.summary as string) || '';
  const start = (d.start as string) || (d.date as string) || (d.time as string) || '';
  const location = (d.location as string) || '';
  const msg = (d.message as string) || '';

  // Single event
  if (title || start) {
    return (
      <CardShell icon={Calendar} title="Compromisso" color="blue">
        <div className="px-3 py-3 space-y-2">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {start && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> {start}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3" /> {location}
            </div>
          )}
          {msg && <p className="text-xs text-gray-500">{msg}</p>}
        </div>
      </CardShell>
    );
  }

  // Event list
  return (
    <CardShell icon={Calendar} title="Agenda" color="blue">
      <div className="divide-y divide-gray-50">
        {events.length > 0 ? events.map((ev, i) => (
          <div key={i} className="px-3 py-2">
            <p className="text-sm font-medium text-gray-800">{ev.title}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {ev.start && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{ev.start}</span>}
              {ev.location && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
            </div>
          </div>
        )) : (
          <div className="px-3 py-3 text-sm text-gray-600">{msg || 'Calendário atualizado'}</div>
        )}
      </div>
    </CardShell>
  );
}
