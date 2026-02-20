import { BookOpen, BarChart3, ListChecks } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';
import { CardShell } from './CardShell';

export function EducationCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const topic = (d.topic as string) || (d.concept as string) || '';
  const explanation = (d.explanation as string) || (d.content as string) || (d.message as string) || '';
  const exercise = (d.exercise as string) || '';
  const progress = d.progress as number;
  const curriculum = (d.curriculum as Array<{ topic: string; status?: string }>) || [];
  const results = (d.results as Array<{ title: string; snippet?: string }>) || [];

  const isProgress = event.tool === 'check_learning_progress';
  const isCurriculum = event.tool === 'list_curriculum' || event.tool === 'add_to_curriculum';
  const isKnowledge = event.tool === 'search_knowledge';

  const headerIcon = isProgress ? BarChart3 : isCurriculum ? ListChecks : BookOpen;
  const headerTitle = isProgress ? 'Progresso' : isCurriculum ? 'Currículo' : isKnowledge ? 'Conhecimento' : topic || 'Educação';
  const progressBadge = progress !== undefined ? <span className="text-xs text-indigo-600">{progress}%</span> : undefined;

  return (
    <CardShell icon={headerIcon} title={headerTitle} color="indigo" badge={progressBadge}>
      <div className="px-3 py-3">
        {isProgress && progress !== undefined && (
          <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {curriculum.length > 0 && (
          <div className="space-y-1">
            {curriculum.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className={`w-2 h-2 rounded-full ${c.status === 'done' ? 'bg-green-400' : c.status === 'active' ? 'bg-indigo-400' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">{c.topic}</span>
              </div>
            ))}
          </div>
        )}
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="p-2 bg-indigo-50/50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{r.title}</p>
                {r.snippet && <p className="text-xs text-gray-500 mt-0.5">{r.snippet}</p>}
              </div>
            ))}
          </div>
        )}
        {explanation && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{explanation}</p>}
        {exercise && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Exercício:</p>
            <p className="text-sm text-gray-700">{exercise}</p>
          </div>
        )}
      </div>
    </CardShell>
  );
}
