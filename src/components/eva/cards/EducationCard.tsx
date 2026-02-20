import { BookOpen, GraduationCap, BarChart3, ListChecks } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

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

  return (
    <div className="rounded-xl border border-indigo-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-b border-indigo-100">
        {isProgress ? <BarChart3 className="w-4 h-4 text-indigo-600" /> :
         isCurriculum ? <ListChecks className="w-4 h-4 text-indigo-600" /> :
         <BookOpen className="w-4 h-4 text-indigo-600" />}
        <span className="text-xs font-semibold text-indigo-800">
          {isProgress ? 'Progresso' : isCurriculum ? 'Currículo' : isKnowledge ? 'Conhecimento' : topic || 'Educação'}
        </span>
        {progress !== undefined && <span className="text-xs text-indigo-600 ml-auto">{progress}%</span>}
      </div>
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
    </div>
  );
}
