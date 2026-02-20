import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToolEvents } from '../useToolEvents';

describe('useToolEvents', () => {
  it('starts with empty events', () => {
    const { result } = renderHook(() => useToolEvents());
    expect(result.current.toolEvents).toEqual([]);
    expect(result.current.activeMusic).toBeNull();
    expect(result.current.activeTimer).toBeNull();
    expect(result.current.emergencyActive).toBe(false);
  });

  it('handles a tool event and adds it to the list', () => {
    const { result } = renderHook(() => useToolEvents());
    act(() => {
      result.current.handleToolEvent({
        tool: 'web_search',
        tool_data: { query: 'test' },
        status: 'success',
      });
    });
    expect(result.current.toolEvents).toHaveLength(1);
    expect(result.current.toolEvents[0].tool).toBe('web_search');
    expect(result.current.toolEvents[0].status).toBe('success');
    expect(result.current.toolEvents[0].toolData).toEqual({ query: 'test' });
  });

  it('dismisses an event by id', () => {
    const { result } = renderHook(() => useToolEvents());
    let eventId = '';
    act(() => {
      const ev = result.current.handleToolEvent({
        tool: 'send_email',
        tool_data: {},
        status: 'success',
      });
      eventId = ev.id;
    });
    expect(result.current.toolEvents).toHaveLength(1);
    act(() => {
      result.current.dismissEvent(eventId);
    });
    expect(result.current.toolEvents).toHaveLength(0);
  });

  it('clears all events', () => {
    const { result } = renderHook(() => useToolEvents());
    act(() => {
      result.current.handleToolEvent({ tool: 'web_search', tool_data: {}, status: 'success' });
      result.current.handleToolEvent({ tool: 'send_email', tool_data: {}, status: 'success' });
    });
    expect(result.current.toolEvents).toHaveLength(2);
    act(() => {
      result.current.clearEvents();
    });
    expect(result.current.toolEvents).toHaveLength(0);
    expect(result.current.activeMusic).toBeNull();
    expect(result.current.activeTimer).toBeNull();
    expect(result.current.emergencyActive).toBe(false);
  });
});
