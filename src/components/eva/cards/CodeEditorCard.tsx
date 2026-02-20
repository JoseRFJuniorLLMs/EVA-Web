import { Code2, GitBranch, Play, FileCode, Search, Diff } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

const TOOL_META: Record<string, { icon: typeof Code2; name: string }> = {
  edit_my_code: { icon: Code2, name: 'Editar Código' },
  search_my_code: { icon: Search, name: 'Buscar Código' },
  read_file: { icon: FileCode, name: 'Arquivo' },
  write_file: { icon: FileCode, name: 'Arquivo Salvo' },
  list_files: { icon: FileCode, name: 'Arquivos' },
  search_files: { icon: Search, name: 'Buscar Arquivos' },
  create_branch: { icon: GitBranch, name: 'Branch Criada' },
  commit_code: { icon: GitBranch, name: 'Commit' },
  run_tests: { icon: Play, name: 'Testes' },
  get_code_diff: { icon: Diff, name: 'Diff' },
};

export function CodeEditorCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const meta = TOOL_META[event.tool] || { icon: Code2, name: 'Código' };
  const Icon = meta.icon;
  const content = (d.content as string) || (d.code as string) || (d.output as string) || '';
  const filename = (d.filename as string) || (d.file as string) || (d.path as string) || '';
  const files = (d.files as string[]) || [];
  const diff = (d.diff as string) || '';
  const msg = (d.message as string) || '';
  const success = d.success !== false;
  const results = (d.results as Array<{ file: string; line?: number; text?: string }>) || [];

  return (
    <div className="rounded-xl border border-gray-300 bg-gray-900 overflow-hidden font-mono">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        <Icon className="w-4 h-4 text-green-400" />
        <span className="text-xs font-semibold text-gray-300">{meta.name}</span>
        {filename && <span className="text-xs text-gray-500 ml-auto truncate max-w-[200px]">{filename}</span>}
        {success && <span className="text-xs text-green-400">✓</span>}
      </div>
      <div className="p-3 max-h-64 overflow-y-auto">
        {(content || diff) && (
          <pre className="text-xs text-green-300 whitespace-pre-wrap break-all leading-relaxed">{diff || content}</pre>
        )}
        {files.length > 0 && (
          <div className="space-y-0.5">
            {files.map((f, i) => (
              <p key={i} className="text-xs text-gray-400 hover:text-green-400 cursor-pointer">{f}</p>
            ))}
          </div>
        )}
        {results.length > 0 && (
          <div className="space-y-1">
            {results.map((r, i) => (
              <div key={i} className="text-xs">
                <span className="text-blue-400">{r.file}</span>
                {r.line && <span className="text-gray-500">:{r.line}</span>}
                {r.text && <span className="text-gray-400 ml-2">{r.text}</span>}
              </div>
            ))}
          </div>
        )}
        {!content && !diff && !files.length && !results.length && (
          <p className="text-xs text-gray-400">{msg || 'Operação concluída'}</p>
        )}
      </div>
    </div>
  );
}
