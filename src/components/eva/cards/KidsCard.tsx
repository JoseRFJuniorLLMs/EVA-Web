import { Star, Rocket, BookOpen, HelpCircle, Trophy } from 'lucide-react';
import type { ToolEvent } from '../../../types/eva-tools';

export function KidsCard({ event }: { event: ToolEvent }) {
  const d = event.toolData as Record<string, unknown>;
  const missions = (d.missions as Array<{ title: string; done?: boolean; xp?: number }>) || [];
  const story = (d.story as string) || (d.content as string) || '';
  const question = (d.question as string) || '';
  const options = (d.options as string[]) || [];
  const stats = d.stats as Record<string, number>;
  const xp = d.xp as number;
  const msg = (d.message as string) || '';

  const isMission = event.tool.includes('mission');
  const isStory = event.tool === 'kids_story';
  const isQuiz = event.tool === 'kids_quiz';
  const isStats = event.tool === 'kids_stats';

  return (
    <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-100/60 border-b border-purple-200">
        {isMission ? <Rocket className="w-4 h-4 text-purple-600" /> :
         isStory ? <BookOpen className="w-4 h-4 text-pink-600" /> :
         isQuiz ? <HelpCircle className="w-4 h-4 text-indigo-600" /> :
         isStats ? <Trophy className="w-4 h-4 text-yellow-600" /> :
         <Star className="w-4 h-4 text-purple-600" />}
        <span className="text-xs font-bold text-purple-800">
          {isMission ? 'Missões' : isStory ? 'História' : isQuiz ? 'Quiz' : isStats ? 'Estatísticas' : 'Kids'}
        </span>
        {xp !== undefined && <span className="text-xs font-bold text-yellow-600 ml-auto">⭐ {xp} XP</span>}
      </div>
      <div className="px-3 py-3">
        {missions.length > 0 && (
          <div className="space-y-2">
            {missions.map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100">
                <span className="text-lg">{m.done ? '✅' : '🎯'}</span>
                <span className={`text-sm flex-1 ${m.done ? 'text-gray-400 line-through' : 'font-medium text-gray-800'}`}>{m.title}</span>
                {m.xp && <span className="text-xs text-yellow-600">+{m.xp} XP</span>}
              </div>
            ))}
          </div>
        )}
        {isStory && story && (
          <div className="prose prose-sm">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{story}</p>
          </div>
        )}
        {isQuiz && question && (
          <div>
            <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <button key={i} className="px-3 py-2 text-sm bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer font-medium">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
        {isStats && stats && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="text-center p-2 bg-white rounded-lg border border-purple-100">
                <p className="text-xl font-bold text-purple-600">{v}</p>
                <p className="text-xs text-gray-500">{k}</p>
              </div>
            ))}
          </div>
        )}
        {!missions.length && !story && !question && !stats && msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
