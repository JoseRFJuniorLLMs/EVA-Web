import { Pill, CheckCircle, Clock, Camera } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function MedicationCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const medications = (d.medications as Array<{ name: string; dose?: string; time?: string; confirmed?: boolean }>) || [];
  const name = (d.name as string) || (d.medication as string) || '';
  const confirmed = d.confirmed === true || d.success === true;
  const msg = (d.message as string) || '';
  const isScan = event.tool === 'scan_medication_visual';

  if (isScan) {
    return (
      <CardShell icon={Camera} title="Scan de Medicamento" color="rose">
        <div className="px-3 py-3">
          {name && <p className="text-sm font-medium text-gray-800">Identificado: {name}</p>}
          <p className="text-sm text-gray-600 mt-1">{msg || 'Medicamento escaneado'}</p>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell
      icon={Pill}
      title="Medicação"
      color="rose"
      badge={confirmed ? <CheckCircle className="w-3 h-3 text-green-500" /> : undefined}
    >
      <div className="px-3 py-2">
        {medications.length > 0 ? medications.map((m, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <Pill className={`w-3 h-3 ${m.confirmed ? 'text-green-500' : 'text-rose-400'}`} />
            <span className="text-sm text-gray-800 flex-1">{m.name}</span>
            {m.dose && <span className="text-xs text-gray-500">{m.dose}</span>}
            {m.time && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Clock className="w-3 h-3" />{m.time}</span>}
          </div>
        )) : (
          <div className="py-1">
            {name && <p className="text-sm font-medium text-gray-800">{name}</p>}
            <p className="text-sm text-gray-600">{msg || (confirmed ? 'Medicação confirmada' : 'Medicação processada')}</p>
          </div>
        )}
      </div>
    </CardShell>
  );
}
