import { Hop, GeoLocation } from '@/types';

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  dashLength: number;
  dashGap: number;
  dashAnimateTime: number;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  hopNumber: number;
}

// Color scale based on latency
export function getLatencyColor(avgRtt: number): string {
  if (avgRtt < 50) return '#22c55e'; // Green - excellent
  if (avgRtt < 100) return '#84cc16'; // Lime - good
  if (avgRtt < 150) return '#eab308'; // Yellow - moderate
  if (avgRtt < 200) return '#f97316'; // Orange - slow
  return '#ef4444'; // Red - very slow
}

// Source point color
export const SOURCE_COLOR = '#22c55e'; // Green

// Destination point color
export const DESTINATION_COLOR = '#8b5cf6'; // Purple

// Generate globe arcs from hops
export function generateArcs(
  hops: Hop[],
  source: GeoLocation | null
): GlobeArc[] {
  const arcs: GlobeArc[] = [];

  // Filter hops that have location data
  const hopsWithLocation = hops.filter((hop) => hop.location !== null);

  if (hopsWithLocation.length === 0) return arcs;

  // First arc: source to first hop with location
  const firstHop = hopsWithLocation[0];
  if (source && firstHop.location) {
    arcs.push({
      startLat: source.latitude,
      startLng: source.longitude,
      endLat: firstHop.location.latitude,
      endLng: firstHop.location.longitude,
      color: getLatencyColor(firstHop.avgRtt),
      dashLength: 0.5,
      dashGap: 0.2,
      dashAnimateTime: 2000,
    });
  }

  // Subsequent arcs: connect hops with location, skipping timeouts
  for (let i = 1; i < hopsWithLocation.length; i++) {
    const prevHop = hopsWithLocation[i - 1];
    const currentHop = hopsWithLocation[i];

    arcs.push({
      startLat: prevHop.location!.latitude,
      startLng: prevHop.location!.longitude,
      endLat: currentHop.location!.latitude,
      endLng: currentHop.location!.longitude,
      color: getLatencyColor(currentHop.avgRtt),
      dashLength: 0.5,
      dashGap: 0.2,
      dashAnimateTime: 2000,
    });
  }

  return arcs;
}

// Generate globe points from hops
export function generatePoints(
  hops: Hop[],
  source: GeoLocation | null,
  selectedHopIndex: number | null
): GlobePoint[] {
  const points: GlobePoint[] = [];

  // Add source point
  if (source) {
    points.push({
      lat: source.latitude,
      lng: source.longitude,
      size: 0.8,
      color: SOURCE_COLOR,
      label: source.city || 'Source',
      hopNumber: 0,
    });
  }

  // Add hop points
  hops.forEach((hop, index) => {
    if (hop.location) {
      const isSelected = selectedHopIndex === index;
      const isDestination = hop.isDestination;

      points.push({
        lat: hop.location.latitude,
        lng: hop.location.longitude,
        size: isSelected ? 1.2 : isDestination ? 1.0 : 0.6,
        color: isDestination ? DESTINATION_COLOR : getLatencyColor(hop.avgRtt),
        label: hop.location.city || hop.ipAddress,
        hopNumber: hop.hopNumber,
      });
    }
  });

  return points;
}

// Get camera position to focus on the latest hop
export function getCameraPosition(
  hops: Hop[],
  source: GeoLocation | null
): { lat: number; lng: number; altitude: number } {
  // Default: centered on Pacific for SF-Tokyo route
  const defaultPos = { lat: 30, lng: -150, altitude: 2.5 };

  if (hops.length === 0 && source) {
    return {
      lat: source.latitude,
      lng: source.longitude,
      altitude: 2.5,
    };
  }

  if (hops.length > 0) {
    const lastHop = hops[hops.length - 1];
    if (lastHop.location) {
      return {
        lat: lastHop.location.latitude,
        lng: lastHop.location.longitude,
        altitude: 2.5,
      };
    }
  }

  return defaultPos;
}

// Format RTT for display
export function formatRtt(rtt: number): string {
  if (rtt < 1) return '<1 ms';
  return `${rtt.toFixed(1)} ms`;
}

// Get status badge variant based on trace status
export function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'running':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'cancelled':
      return 'outline';
    default:
      return 'outline';
  }
}
