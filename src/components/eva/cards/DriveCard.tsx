import { FileText, CheckCircle, ExternalLink } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function DriveCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const url = (d.url as string) || (d.link as string) || '';
  const filename = (d.filename as string) || (d.name as string) || (d.title as string) || 'Documento';
  const msg = (d.message as string) || '';

  return (
    <CardShell
      icon={FileText}
      title="Google Drive"
      color="blue"
      badge={<CheckCircle className="w-3 h-3 text-green-500" />}
    >
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-gray-800">{filename}</p>
        {msg && <p className="text-xs text-gray-500 mt-1">{msg}</p>}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2">
            Abrir no Drive <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </CardShell>
  );
}
