import { Mail, CheckCircle, AlertCircle, Inbox } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function EmailCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;

  // New email notification (from Gmail watcher)
  if (event.tool === 'new_email') {
    const emails = (d.emails as Array<{ from: string; subject: string; snippet: string; date: string }>) || [];
    const count = (d.count as number) || emails.length;

    return (
      <div className="rounded-xl border border-blue-100 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <Inbox className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800">
            {count} email{count > 1 ? 's' : ''} novo{count > 1 ? 's' : ''}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {emails.slice(0, 5).map((em, i) => (
            <div key={i} className="px-3 py-2">
              <p className="text-xs font-medium text-gray-800 truncate">{em.from}</p>
              <p className="text-xs text-gray-700 truncate">{em.subject}</p>
              {em.snippet && <p className="text-[10px] text-gray-400 truncate mt-0.5">{em.snippet}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sent email / error
  const success = d.success !== false;
  const to = (d.to as string) || (d.recipient as string) || '';
  const subject = (d.subject as string) || '';
  const body = (d.body as string) || '';

  return (
    <div className={`rounded-xl border overflow-hidden ${success ? 'border-green-100 bg-white' : 'border-red-100 bg-red-50'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${success ? 'bg-green-50' : 'bg-red-100'}`}>
        <Mail className={`w-4 h-4 ${success ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`text-xs font-semibold ${success ? 'text-green-800' : 'text-red-800'}`}>
          {success ? 'Email Enviado' : 'Erro no Email'}
        </span>
        {success ? <CheckCircle className="w-3 h-3 text-green-500 ml-auto" /> : <AlertCircle className="w-3 h-3 text-red-500 ml-auto" />}
      </div>
      <div className="px-3 py-2 space-y-1">
        {to && <p className="text-xs text-gray-600"><span className="font-medium">Para:</span> {to}</p>}
        {subject && <p className="text-xs text-gray-600"><span className="font-medium">Assunto:</span> {subject}</p>}
        {body && <p className="text-xs text-gray-500 line-clamp-3">{body}</p>}
        {!to && !subject && <p className="text-sm text-gray-600">{String(d.message || 'Email processado')}</p>}
      </div>
    </div>
  );
}
