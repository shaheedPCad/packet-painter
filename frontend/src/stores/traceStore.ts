import { create } from 'zustand';
import { TraceSession, Hop, GeoLocation, TraceStatus } from '@/types';

interface TraceState {
  session: TraceSession | null;
  selectedHopIndex: number | null;
  showSubmarineCables: boolean;

  // Actions
  startSession: (id: string, target: string, source: GeoLocation) => void;
  addHop: (hop: Hop) => void;
  completeSession: (totalHops: number) => void;
  cancelSession: () => void;
  setError: (error: string) => void;
  selectHop: (index: number | null) => void;
  reset: () => void;
  toggleSubmarineCables: () => void;
}

const initialSession: TraceSession = {
  id: '',
  target: '',
  status: 'idle',
  startTime: 0,
  hops: [],
  source: null,
};

export const useTraceStore = create<TraceState>((set) => ({
  session: null,
  selectedHopIndex: null,
  showSubmarineCables: true,

  startSession: (id, target, source) =>
    set((state) => {
      // Prevent duplicate session starts (React StrictMode)
      if (state.session?.id === id) {
        return state;
      }
      return {
        session: {
          id,
          target,
          status: 'running',
          startTime: Date.now(),
          hops: [],
          source,
        },
        selectedHopIndex: null,
      };
    }),

  addHop: (hop) =>
    set((state) => {
      if (!state.session) return state;
      // Prevent duplicate hops (React StrictMode causes double events)
      if (state.session.hops.some(h => h.hopNumber === hop.hopNumber)) {
        return state;
      }
      return {
        session: {
          ...state.session,
          hops: [...state.session.hops, hop],
        },
        // Auto-select the latest hop
        selectedHopIndex: state.session.hops.length,
      };
    }),

  completeSession: (totalHops) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          status: 'completed',
          endTime: Date.now(),
          totalHops,
        },
      };
    }),

  cancelSession: () =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          status: 'cancelled',
          endTime: Date.now(),
        },
      };
    }),

  setError: (error) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          status: 'error',
          error,
          endTime: Date.now(),
        },
      };
    }),

  selectHop: (index) => set({ selectedHopIndex: index }),

  reset: () => set({ session: null, selectedHopIndex: null }),

  toggleSubmarineCables: () =>
    set((state) => ({
      showSubmarineCables: !state.showSubmarineCables,
    })),
}));
