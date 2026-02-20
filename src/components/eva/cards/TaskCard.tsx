import { CheckSquare, Bell, Circle, CheckCircle2 } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function TaskCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const tasks = (d.tasks as Array<{ title: string; done?: boolean; due?: string }>) || [];
  const alarms = (d.alarms as Array<{ time: string; label?: string }>) || [];
  const msg = (d.message as string) || '';
  const isAlarm = event.tool.includes('alarm');

  if (isAlarm) {
    return (
      <CardShell icon={Bell} title="Alarmes" color="orange">
        <div className="px-3 py-2">
          {alarms.length > 0 ? alarms.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <Bell className="w-3 h-3 text-orange-500" />
              <span className="text-sm font-medium text-gray-800">{a.time}</span>
              {a.label && <span className="text-xs text-gray-500">— {a.label}</span>}
            </div>
          )) : (
            <p className="text-sm text-gray-600 py-1">{msg || 'Alarme configurado'}</p>
          )}
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell icon={CheckSquare} title="Tarefas" color="amber">
      <div className="px-3 py-2">
        {tasks.length > 0 ? tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            {t.done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
            <span className={`text-sm ${t.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.title}</span>
            {t.due && <span className="text-xs text-gray-400 ml-auto">{t.due}</span>}
          </div>
        )) : (
          <p className="text-sm text-gray-600 py-1">{msg || 'Tarefa processada'}</p>
        )}
      </div>
    </CardShell>
  );
}
