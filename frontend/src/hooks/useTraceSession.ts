import { useCallback } from 'react';
import { StartTrace, CancelTrace } from '../../wailsjs/go/main/App';
import { useTraceStore } from '@/stores/traceStore';
import { useWailsEvents } from './useWailsEvents';

export function useTraceSession() {
  // Subscribe to Wails events
  useWailsEvents();

  const { session, selectedHopIndex, selectHop, reset } = useTraceStore();

  const startTrace = useCallback(async (target: string) => {
    if (!target.trim()) return;
    try {
      await StartTrace(target.trim());
    } catch (error) {
      console.error('Failed to start trace:', error);
    }
  }, []);

  const cancelTrace = useCallback(async () => {
    try {
      await CancelTrace();
    } catch (error) {
      console.error('Failed to cancel trace:', error);
    }
  }, []);

  const clearTrace = useCallback(() => {
    reset();
  }, [reset]);

  return {
    session,
    selectedHopIndex,
    selectHop,
    startTrace,
    cancelTrace,
    clearTrace,
    isRunning: session?.status === 'running',
    isCompleted: session?.status === 'completed',
    hasSession: session !== null,
  };
}
