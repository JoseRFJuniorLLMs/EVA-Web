import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

const PLATFORM_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  send_whatsapp: { bg: 'bg-green-50', text: 'text-green-800', icon: 'text-green-600' },
  send_telegram: { bg: 'bg-blue-50', text: 'text-blue-800', icon: 'text-blue-600' },
  send_slack: { bg: 'bg-purple-50', text: 'text-purple-800', icon: 'text-purple-600' },
  send_discord: { bg: 'bg-indigo-50', text: 'text-indigo-800', icon: 'text-indigo-600' },
  send_teams: { bg: 'bg-violet-50', text: 'text-violet-800', icon: 'text-violet-600' },
  send_signal: { bg: 'bg-sky-50', text: 'text-sky-800', icon: 'text-sky-600' },
};

const PLATFORM_NAMES: Record<string, string> = {
  send_whatsapp: 'WhatsApp',
  send_telegram: 'Telegram',
  send_slack: 'Slack',
  send_discord: 'Discord',
  send_teams: 'Teams',
  send_signal: 'Signal',
};

export function MessageCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const colors = PLATFORM_COLORS[event.tool] || PLATFORM_COLORS.send_whatsapp;
  const name = PLATFORM_NAMES[event.tool] || 'Mensagem';
  const to = (d.to as string) || (d.contact as string) || (d.recipient as string) || '';
  const msg = (d.message as string) || '';
  const success = d.success !== false;

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 ${colors.bg}`}>
        <MessageCircle className={`w-4 h-4 ${colors.icon}`} />
        <span className={`text-xs font-semibold ${colors.text}`}>{name}</span>
        {success && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
      </div>
      <div className="px-3 py-2 space-y-1">
        {to && <p className="text-xs text-gray-600"><span className="font-medium">Para:</span> {to}</p>}
        <p className="text-sm text-gray-700">{msg || 'Mensagem enviada'}</p>
      </div>
    </div>
  );
}
