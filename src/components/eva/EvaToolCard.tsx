import type { ToolEvent } from '../../types/eva-tools';
import { getToolCategory } from '../../types/eva-tools';

import { WebSearchCard } from './cards/WebSearchCard';
import { EmailCard } from './cards/EmailCard';
import { MessageCard } from './cards/MessageCard';
import { VideoCard } from './cards/VideoCard';
import { CalendarCard } from './cards/CalendarCard';
import { TaskCard } from './cards/TaskCard';
import { MapCard } from './cards/MapCard';
import { DriveCard } from './cards/DriveCard';
import { GameCard } from './cards/GameCard';
import { WellnessCard } from './cards/WellnessCard';
import { HabitCard } from './cards/HabitCard';
import { EntertainmentCard } from './cards/EntertainmentCard';
import { MedicationCard } from './cards/MedicationCard';
import { ClinicalCard } from './cards/ClinicalCard';
import { EmergencyCard } from './cards/EmergencyCard';
import { EducationCard } from './cards/EducationCard';
import { LegalCard } from './cards/LegalCard';
import { KidsCard } from './cards/KidsCard';
import { CodeEditorCard } from './cards/CodeEditorCard';
import { DatabaseCard } from './cards/DatabaseCard';
import { SmartHomeCard } from './cards/SmartHomeCard';
import { GenericToolCard } from './cards/GenericToolCard';

const CATEGORY_CARD: Record<string, React.ComponentType<{ event: ToolEvent }>> = {
  search: WebSearchCard,
  email: EmailCard,
  messaging: MessageCard,
  messaging_advanced: MessageCard,
  video: VideoCard,
  calendar: CalendarCard,
  tasks: TaskCard,
  maps: MapCard,
  drive: DriveCard,
  games: GameCard,
  wellness: WellnessCard,
  habits: HabitCard,
  entertainment: EntertainmentCard,
  medication: MedicationCard,
  clinical: ClinicalCard,
  camera: GenericToolCard,
  emergency: EmergencyCard,
  education: EducationCard,
  legal: LegalCard,
  kids: KidsCard,
  code: CodeEditorCard,
  database: DatabaseCard,
  smarthome: SmartHomeCard,
  browser: GenericToolCard,
  webhooks: GenericToolCard,
  skills: GenericToolCard,
  selfaware: GenericToolCard,
  execute: CodeEditorCard,
  generic: GenericToolCard,
};

// Music and timer are handled as persistent players, not inline cards
const SKIP_INLINE = new Set(['music', 'timer']);

export function EvaToolCard({ event }: { event: ToolEvent }) {
  const category = getToolCategory(event.tool);
  if (SKIP_INLINE.has(category)) return null;

  const Card = CATEGORY_CARD[category] || GenericToolCard;
  return (
    <div className="max-w-[85%] animate-in fade-in slide-in-from-left-2 duration-300">
      <Card event={event} />
    </div>
  );
}
