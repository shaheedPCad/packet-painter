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

  if (hops.length === 0) return arcs;

  // First arc: source to first hop
  const firstHop = hops[0];
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

  // Subsequent arcs: hop to hop
  for (let i = 1; i < hops.length; i++) {
    const prevHop = hops[i - 1];
    const currentHop = hops[i];

    if (prevHop.location && currentHop.location) {
      arcs.push({
        startLat: prevHop.location.latitude,
        startLng: prevHop.location.longitude,
        endLat: currentHop.location.latitude,
        endLng: currentHop.location.longitude,
        color: getLatencyColor(currentHop.avgRtt),
        dashLength: 0.5,
        dashGap: 0.2,
        dashAnimateTime: 2000,
      });
    }
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

// Interpolate position along great circle arc using spherical interpolation
export function interpolateArc(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  t: number // 0-1
): { lat: number; lng: number } {
  // Convert to radians
  const lat1 = (start.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const lng2 = (end.lng * Math.PI) / 180;

  // Calculate angular distance
  const d = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  );

  // Handle edge case where points are identical or very close
  if (d < 0.0001) {
    return { lat: start.lat, lng: start.lng };
  }

  // Spherical linear interpolation
  const a = Math.sin((1 - t) * d) / Math.sin(d);
  const b = Math.sin(t * d) / Math.sin(d);

  // Calculate cartesian coordinates
  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  // Convert back to lat/lng
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI);
  const lng = Math.atan2(y, x) * (180 / Math.PI);

  return { lat, lng };
}

// Calculate camera position to follow packet from behind
export function getFlightCameraPosition(
  packetLat: number,
  packetLng: number,
  headingLat: number,
  headingLng: number,
  altitude: number = 0.5
): { lat: number; lng: number; altitude: number } {
  // Calculate direction from packet to destination
  const dLat = headingLat - packetLat;
  const dLng = headingLng - packetLng;

  // Normalize and get offset behind the packet (opposite direction of travel)
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distance < 0.001) {
    // If very close, just position camera at packet location
    return { lat: packetLat, lng: packetLng, altitude };
  }

  // Offset camera ~15 degrees behind packet along the path
  const offsetDegrees = 15;
  const cameraLat = packetLat - (dLat / distance) * offsetDegrees;
  const cameraLng = packetLng - (dLng / distance) * offsetDegrees;

  return { lat: cameraLat, lng: cameraLng, altitude };
}

// Build flight path segments from hops and source
export interface FlightSegment {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  hopIndex: number; // Index of the destination hop in this segment
}

export function buildFlightPath(
  hops: Hop[],
  source: GeoLocation | null
): FlightSegment[] {
  const segments: FlightSegment[] = [];

  // Filter hops that have location data
  const hopsWithLocation = hops.filter((hop) => hop.location !== null);

  if (hopsWithLocation.length === 0) return segments;

  // First segment: source to first hop with location
  if (source) {
    const firstHop = hopsWithLocation[0];
    segments.push({
      start: { lat: source.latitude, lng: source.longitude },
      end: {
        lat: firstHop.location!.latitude,
        lng: firstHop.location!.longitude,
      },
      hopIndex: hops.indexOf(firstHop),
    });
  }

  // Subsequent segments: hop to hop
  for (let i = 1; i < hopsWithLocation.length; i++) {
    const prevHop = hopsWithLocation[i - 1];
    const currentHop = hopsWithLocation[i];
    segments.push({
      start: {
        lat: prevHop.location!.latitude,
        lng: prevHop.location!.longitude,
      },
      end: {
        lat: currentHop.location!.latitude,
        lng: currentHop.location!.longitude,
      },
      hopIndex: hops.indexOf(currentHop),
    });
  }

  return segments;
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
