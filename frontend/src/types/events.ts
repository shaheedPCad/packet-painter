import { GeoLocation } from './geo';
import { Hop } from './trace';

export interface TraceStartedEvent {
  sessionId: string;
  target: string;
  source: GeoLocation;
  timestamp: number;
}

export interface TraceHopEvent {
  sessionId: string;
  hop: Hop;
}

export interface TraceCompletedEvent {
  sessionId: string;
  totalHops: number;
  timestamp: number;
}

export interface TraceCancelledEvent {
  sessionId: string;
  timestamp: number;
}

export interface TraceErrorEvent {
  sessionId: string;
  error: string;
  timestamp: number;
}

export type TraceEvent =
  | { type: 'started'; data: TraceStartedEvent }
  | { type: 'hop'; data: TraceHopEvent }
  | { type: 'completed'; data: TraceCompletedEvent }
  | { type: 'cancelled'; data: TraceCancelledEvent }
  | { type: 'error'; data: TraceErrorEvent };
