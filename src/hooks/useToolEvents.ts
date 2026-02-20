import { useState, useCallback } from 'react';
import { ToolEvent, getToolCategory } from '../types/eva-tools';

let eventCounter = 0;

export function useToolEvents() {
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [activeMusic, setActiveMusic] = useState<ToolEvent | null>(null);
  const [activeTimer, setActiveTimer] = useState<ToolEvent | null>(null);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const handleToolEvent = useCallback((msg: { tool: string; tool_data: Record<string, unknown>; status: string }) => {
    const event: ToolEvent = {
      id: `tool_${++eventCounter}`,
      tool: msg.tool,
      toolData: msg.tool_data || {},
      status: msg.status as ToolEvent['status'],
      timestamp: Date.now(),
    };

    const category = getToolCategory(msg.tool);

    // Special handling for persistent UI elements
    if (category === 'music') setActiveMusic(event);
    if (category === 'timer') setActiveTimer(event);
    if (category === 'emergency') setEmergencyActive(true);

    setToolEvents(prev => [...prev, event]);
    return event;
  }, []);

  const clearEvents = useCallback(() => {
    setToolEvents([]);
    setActiveMusic(null);
    setActiveTimer(null);
    setEmergencyActive(false);
  }, []);

  const dismissEvent = useCallback((id: string) => {
    setToolEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    toolEvents,
    activeMusic,
    activeTimer,
    emergencyActive,
    setEmergencyActive,
    handleToolEvent,
    clearEvents,
    dismissEvent,
  };
}
