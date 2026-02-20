import { MapPin, Navigation, Bus } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function MapCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const places = (d.places as Array<{ name: string; address?: string; rating?: number; distance?: string }>) || [];
  const directions = (d.steps as Array<{ instruction: string; distance?: string }>) || [];
  const msg = (d.message as string) || '';
  const lat = d.latitude as number;
  const lng = d.longitude as number;

  const isDirections = event.tool === 'get_directions';
  const isTransport = event.tool === 'nearby_transport';

  // OpenStreetMap embed (no API key needed, no deprecation issues)
  const mapEmbed = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
    : null;

  return (
    <div className="rounded-xl border border-teal-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border-b border-teal-100">
        {isDirections ? <Navigation className="w-4 h-4 text-teal-600" /> :
         isTransport ? <Bus className="w-4 h-4 text-teal-600" /> :
         <MapPin className="w-4 h-4 text-teal-600" />}
        <span className="text-xs font-semibold text-teal-800">
          {isDirections ? 'Direções' : isTransport ? 'Transporte' : 'Lugares Próximos'}
        </span>
        {lat && lng && (
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-teal-600 hover:underline"
          >
            Abrir no Maps
          </a>
        )}
      </div>

      {mapEmbed && (
        <iframe src={mapEmbed} className="w-full h-40 border-0" title="map" loading="lazy" />
      )}

      <div className="divide-y divide-gray-50">
        {directions.length > 0 ? directions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2">
            <span className="text-xs font-bold text-teal-600 bg-teal-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
            <div>
              <p className="text-sm text-gray-700">{s.instruction}</p>
              {s.distance && <p className="text-xs text-gray-400">{s.distance}</p>}
            </div>
          </div>
        )) : places.length > 0 ? places.map((p, i) => (
          <div key={i} className="px-3 py-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-800">{p.name}</p>
              {p.rating && <span className="text-xs text-yellow-600">★ {p.rating}</span>}
              {p.distance && <span className="text-xs text-gray-400 ml-auto">{p.distance}</span>}
            </div>
            {p.address && <p className="text-xs text-gray-500 mt-0.5">{p.address}</p>}
          </div>
        )) : (
          <div className="px-3 py-3 text-sm text-gray-600">{msg || 'Localização processada'}</div>
        )}
      </div>
    </div>
  );
}
