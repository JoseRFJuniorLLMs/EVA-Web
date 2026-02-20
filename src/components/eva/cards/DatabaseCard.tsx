import { Database, Table, Network } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function DatabaseCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const isGraph = event.tool.includes('graph');
  const isVector = event.tool.includes('vector');
  const rows = (d.rows as Array<Record<string, unknown>>) || [];
  const columns = (d.columns as string[]) || (rows.length > 0 ? Object.keys(rows[0]) : []);
  const collections = (d.collections as string[]) || [];
  const query = (d.query as string) || '';
  const msg = (d.message as string) || '';
  const count = (d.count as number) || rows.length;

  return (
    <div className="rounded-xl border border-gray-300 bg-gray-900 overflow-hidden font-mono">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        {isGraph ? <Network className="w-4 h-4 text-purple-400" /> :
         <Database className="w-4 h-4 text-cyan-400" />}
        <span className="text-xs font-semibold text-gray-300">
          {isGraph ? 'NietzscheDB Graph' : isVector ? 'Vector Search' : 'Query Result'}
        </span>
        {count > 0 && <span className="text-xs text-gray-500 ml-auto">{count} rows</span>}
      </div>
      {query && (
        <div className="px-3 py-1.5 bg-gray-850 border-b border-gray-700">
          <pre className="text-xs text-yellow-300 whitespace-pre-wrap">{query}</pre>
        </div>
      )}
      <div className="p-2 max-h-64 overflow-auto">
        {rows.length > 0 && columns.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr>
                {columns.map(c => <th key={c} className="text-left px-2 py-1 text-cyan-400 border-b border-gray-700">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, i) => (
                <tr key={i} className="hover:bg-gray-800/50">
                  {columns.map(c => <td key={c} className="px-2 py-1 text-gray-300 border-b border-gray-800">{String(row[c] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : collections.length > 0 ? (
          <div className="space-y-0.5">
            {collections.map((c, i) => (
              <p key={i} className="text-xs text-gray-400 hover:text-cyan-400 cursor-pointer px-2 py-1">{c}</p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 px-2 py-1">{msg || 'Query executada'}</p>
        )}
      </div>
    </div>
  );
}
