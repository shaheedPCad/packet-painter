import { useEffect } from 'react';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import { useTraceStore } from '@/stores/traceStore';
import {
  TraceStartedEvent,
  TraceHopEvent,
  TraceCompletedEvent,
  TraceCancelledEvent,
  TraceErrorEvent,
} from '@/types';

export function useWailsEvents() {
  const { startSession, addHop, completeSession, cancelSession, setError } =
    useTraceStore();

  useEffect(() => {
    // Subscribe to trace events
    const unsubStarted = EventsOn('trace:started', (data: TraceStartedEvent) => {
      startSession(data.sessionId, data.target, data.source);
    });

    const unsubHop = EventsOn('trace:hop', (data: TraceHopEvent) => {
      addHop(data.hop);
    });

    const unsubCompleted = EventsOn('trace:completed', (data: TraceCompletedEvent) => {
      completeSession(data.totalHops);
    });

    const unsubCancelled = EventsOn('trace:cancelled', (data: TraceCancelledEvent) => {
      cancelSession();
    });

    const unsubError = EventsOn('trace:error', (data: TraceErrorEvent) => {
      setError(data.error);
    });

    // Cleanup on unmount
    return () => {
      EventsOff('trace:started');
      EventsOff('trace:hop');
      EventsOff('trace:completed');
      EventsOff('trace:cancelled');
      EventsOff('trace:error');
    };
  }, [startSession, addHop, completeSession, cancelSession, setError]);
}
