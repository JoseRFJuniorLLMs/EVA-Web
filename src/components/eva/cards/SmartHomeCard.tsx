import { Home, Lightbulb, Thermometer, Power } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function SmartHomeCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const devices = (d.devices as Array<{ name: string; type?: string; state?: string; value?: string | number }>) || [];
  const device = (d.device as string) || (d.name as string) || '';
  const state = (d.state as string) || (d.status as string) || '';
  const msg = (d.message as string) || '';

  return (
    <CardShell icon={Home} title="Casa Inteligente" color="amber">
      <div className="px-3 py-2">
        {devices.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {devices.map((dev, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                {dev.type === 'light' ? <Lightbulb className={`w-4 h-4 ${dev.state === 'on' ? 'text-yellow-500' : 'text-gray-400'}`} /> :
                 dev.type === 'thermostat' ? <Thermometer className="w-4 h-4 text-orange-500" /> :
                 <Power className={`w-4 h-4 ${dev.state === 'on' ? 'text-green-500' : 'text-gray-400'}`} />}
                <div>
                  <p className="text-xs font-medium text-gray-800">{dev.name}</p>
                  <p className="text-xs text-gray-500">{dev.state || dev.value || 'off'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {device && <p className="text-sm font-medium text-gray-800">{device}: {state}</p>}
            {msg && <p className="text-sm text-gray-600 mt-1">{msg}</p>}
          </div>
        )}
      </div>
    </CardShell>
  );
}
