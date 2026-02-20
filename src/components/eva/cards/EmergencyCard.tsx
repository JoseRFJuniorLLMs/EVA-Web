import { AlertTriangle, Phone, CheckCircle } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

const CONTACT_LABELS: Record<string, string> = {
  alert_family: 'Alerta Enviado à Família',
  call_family_webrtc: 'Ligando para Família',
  call_central_webrtc: 'Ligando para Central',
  call_doctor_webrtc: 'Ligando para Médico',
  call_caregiver_webrtc: 'Ligando para Cuidador',
};

export function EmergencyCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const label = CONTACT_LABELS[event.tool] || 'Emergência';
  const success = d.success !== false;
  const msg = (d.message as string) || '';
  const contact = (d.contact as string) || (d.name as string) || '';
  const isCall = event.tool.includes('call_');

  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 overflow-hidden shadow-lg animate-pulse">
      <div className="flex items-center gap-2 px-4 py-3 bg-red-600">
        <AlertTriangle className="w-5 h-5 text-white" />
        <span className="text-sm font-bold text-white">{label}</span>
        {success && <CheckCircle className="w-4 h-4 text-green-300 ml-auto" />}
      </div>
      <div className="px-4 py-4">
        {isCall && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">{contact || 'Contato de Emergência'}</p>
              <p className="text-xs text-red-600">Chamada em andamento...</p>
            </div>
          </div>
        )}
        {!isCall && contact && <p className="text-sm font-medium text-red-800 mb-1">Notificado: {contact}</p>}
        <p className="text-sm text-red-700">{msg || (success ? 'Ação de emergência executada' : 'Erro na ação de emergência')}</p>
      </div>
    </div>
  );
}
