import { GeoLocation } from './geo';

export interface Hop {
  hopNumber: number;
  ipAddress: string;
  hostname?: string;
  rtt: number[];
  avgRtt: number;
  location: GeoLocation | null;
  isTimeout: boolean;
  isDestination: boolean;
  timestamp: number;
}

export type TraceStatus = 'idle' | 'running' | 'completed' | 'error' | 'cancelled';

export interface TraceSession {
  id: string;
  target: string;
  status: TraceStatus;
  startTime: number;
  endTime?: number;
  hops: Hop[];
  source: GeoLocation | null;
  totalHops?: number;
  error?: string;
}
