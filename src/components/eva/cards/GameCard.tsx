import { Gamepad2, HelpCircle, Brain, Type } from 'lucide-react';
import { useState } from 'react';
import type { ToolEvent } from '../../../types/eva-tools';

const GAME_ICONS: Record<string, typeof Brain> = {
  play_trivia_game: HelpCircle,
  memory_game: Brain,
  word_association: Type,
  brain_training: Brain,
};
const GAME_NAMES: Record<string, string> = {
  play_trivia_game: 'Trivia',
  memory_game: 'Jogo da Memória',
  word_association: 'Associação de Palavras',
  brain_training: 'Treino Cerebral',
};

export function GameCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const Icon = GAME_ICONS[event.tool] || Gamepad2;
  const name = GAME_NAMES[event.tool] || 'Jogo';
  const question = (d.question as string) || '';
  const options = (d.options as string[]) || [];
  const answer = (d.answer as string) || '';
  const score = d.score as number;
  const msg = (d.message as string) || '';
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-yellow-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border-b border-yellow-100">
        <Icon className="w-4 h-4 text-yellow-600" />
        <span className="text-xs font-semibold text-yellow-800">{name}</span>
        {score !== undefined && <span className="text-xs text-yellow-600 ml-auto font-bold">Score: {score}</span>}
      </div>
      <div className="px-3 py-3">
        {question && <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>}
        {options.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(opt)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                  selected === opt
                    ? answer && opt === answer ? 'bg-green-100 border-green-300 text-green-800'
                    : answer && selected !== null ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-yellow-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {!question && msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
