import { Scale, FileText, BookOpen } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function LegalCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const rights = (d.rights as string[]) || [];
  const term = (d.term as string) || '';
  const definition = (d.definition as string) || (d.explanation as string) || '';
  const documents = (d.documents as Array<{ name: string; status: string }>) || [];
  const msg = (d.message as string) || '';

  const isRights = event.tool === 'get_elderly_rights';
  const isDocStatus = event.tool === 'document_status';

  const headerIcon = isRights ? Scale : isDocStatus ? FileText : BookOpen;
  const headerTitle = isRights ? 'Direitos do Idoso' : isDocStatus ? 'Status de Documentos' : term || 'Jurídico';

  return (
    <CardShell icon={headerIcon} title={headerTitle} color="stone">
      <div className="px-3 py-3">
        {rights.length > 0 && (
          <ul className="space-y-1.5">
            {rights.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Scale className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        )}
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-800">{doc.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  doc.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                  doc.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{doc.status}</span>
              </div>
            ))}
          </div>
        )}
        {definition && <p className="text-sm text-gray-700 leading-relaxed">{definition}</p>}
        {!rights.length && !documents.length && !definition && msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </CardShell>
  );
}
