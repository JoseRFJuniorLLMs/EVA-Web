import { FileText, CheckCircle, ExternalLink } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function DriveCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const url = (d.url as string) || (d.link as string) || '';
  const filename = (d.filename as string) || (d.name as string) || (d.title as string) || 'Documento';
  const msg = (d.message as string) || '';

  return (
    <div className="rounded-xl border border-blue-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
        <FileText className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-semibold text-blue-800">Google Drive</span>
        <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
      </div>
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-800">{filename}</p>
        {msg && <p className="text-xs text-gray-500 mt-1">{msg}</p>}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2">
            Abrir no Drive <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
