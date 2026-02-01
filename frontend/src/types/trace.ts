import { GeoLocation } from './geo';

export interface DataCenter {
  provider: string;
  color: string;
}

export interface Hop {
  hopNumber: number;
  ipAddress: string;
  hostname?: string;
  rtt: number[];
  avgRtt: number;
  location: GeoLocation | null;
  dataCenter?: DataCenter | null;
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
