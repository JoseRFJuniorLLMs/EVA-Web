import { useState } from 'react';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

const ASSESSMENT_NAMES: Record<string, string> = {
  apply_phq9: 'PHQ-9 (Depressão)',
  apply_gad7: 'GAD-7 (Ansiedade)',
  apply_cssrs: 'C-SSRS (Risco Suicida)',
  submit_phq9_response: 'PHQ-9',
  submit_gad7_response: 'GAD-7',
};

function scoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct < 0.25) return 'text-green-600 bg-green-50';
  if (pct < 0.5) return 'text-yellow-600 bg-yellow-50';
  if (pct < 0.75) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

export function ClinicalCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const name = ASSESSMENT_NAMES[event.tool] || 'Avaliação Clínica';
  const questions = (d.questions as Array<{ text: string; options?: string[] }>) || [];
  const score = d.score as number;
  const maxScore = (d.max_score as number) || 27;
  const severity = (d.severity as string) || '';
  const msg = (d.message as string) || '';
  const isCSSRS = event.tool === 'apply_cssrs';
  const [currentQ, setCurrentQ] = useState(0);

  return (
    <div className={`rounded-xl border overflow-hidden ${isCSSRS ? 'border-red-200' : 'border-indigo-100'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${isCSSRS ? 'bg-red-50 border-b border-red-200' : 'bg-indigo-50 border-b border-indigo-100'}`}>
        {isCSSRS ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <ClipboardList className="w-4 h-4 text-indigo-600" />}
        <span className={`text-xs font-semibold ${isCSSRS ? 'text-red-800' : 'text-indigo-800'}`}>{name}</span>
      </div>
      <div className="px-3 py-3">
        {score !== undefined && (
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${scoreColor(score, maxScore)}`}>
              {score}/{maxScore}
            </div>
            {severity && <span className="text-sm font-medium text-gray-700">{severity}</span>}
          </div>
        )}
        {questions.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Pergunta {currentQ + 1}/{questions.length}</p>
            <p className="text-sm font-medium text-gray-800 mb-2">{questions[currentQ]?.text}</p>
            {questions[currentQ]?.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(q => Math.min(q + 1, questions.length - 1))}
                className="block w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 mb-1 transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {!questions.length && !score && msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
