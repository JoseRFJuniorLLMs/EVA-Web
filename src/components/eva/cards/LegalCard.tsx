import { Scale, FileText, BookOpen } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function LegalCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const rights = (d.rights as string[]) || [];
  const term = (d.term as string) || '';
  const definition = (d.definition as string) || (d.explanation as string) || '';
  const status = (d.status as string) || '';
  const documents = (d.documents as Array<{ name: string; status: string }>) || [];
  const msg = (d.message as string) || '';

  const isRights = event.tool === 'get_elderly_rights';
  const isDocStatus = event.tool === 'document_status';

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border-b border-stone-200">
        {isRights ? <Scale className="w-4 h-4 text-stone-600" /> :
         isDocStatus ? <FileText className="w-4 h-4 text-stone-600" /> :
         <BookOpen className="w-4 h-4 text-stone-600" />}
        <span className="text-xs font-semibold text-stone-800">
          {isRights ? 'Direitos do Idoso' : isDocStatus ? 'Status de Documentos' : term || 'Jurídico'}
        </span>
      </div>
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
    </div>
  );
}
