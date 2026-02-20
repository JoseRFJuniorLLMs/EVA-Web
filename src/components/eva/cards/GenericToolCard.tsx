import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function GenericToolCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const success = d.success !== false && event.status !== 'error';
  const msg = (d.message as string) || '';
  const data = (d.data as string) || (d.result as string) || (d.output as string) || '';

  // Pretty-print tool name
  const toolLabel = event.tool.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={`rounded-xl border overflow-hidden ${success ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${success ? 'bg-gray-50' : 'bg-red-100'} border-b border-gray-200`}>
        <Wrench className={`w-4 h-4 ${success ? 'text-gray-600' : 'text-red-600'}`} />
        <span className={`text-xs font-semibold ${success ? 'text-gray-800' : 'text-red-800'}`}>{toolLabel}</span>
        {success ? <CheckCircle className="w-3 h-3 text-green-500 ml-auto" /> : <AlertCircle className="w-3 h-3 text-red-500 ml-auto" />}
      </div>
      <div className="px-3 py-2">
        {msg && <p className="text-sm text-gray-700">{msg}</p>}
        {data && !msg && <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">{data}</pre>}
        {!msg && !data && <p className="text-xs text-gray-400">Tool executada com sucesso</p>}
      </div>
    </div>
  );
}
