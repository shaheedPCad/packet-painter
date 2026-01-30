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
      console.log('trace:started', data);
      startSession(data.sessionId, data.target, data.source);
    });

    const unsubHop = EventsOn('trace:hop', (data: TraceHopEvent) => {
      console.log('trace:hop', data.hop.hopNumber, data.hop.ipAddress);
      addHop(data.hop);
    });

    const unsubCompleted = EventsOn('trace:completed', (data: TraceCompletedEvent) => {
      console.log('trace:completed', data);
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
