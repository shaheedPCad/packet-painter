/**
 * Submarine cable data fetching and processing
 * Data source: TeleGeography Submarine Cable Map API (fetched via Go backend)
 */

import { GetSubmarineCables } from '../../wailsjs/go/main/App';

export interface SubmarineCable {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][]; // [lng, lat] pairs (GeoJSON format)
  isHighlighted?: boolean;
}

// Default subtle blue color for cables
const DEFAULT_CABLE_COLOR = 'rgba(0, 100, 180, 0.3)';

// Highlighted cable color (bright cyan)
export const HIGHLIGHTED_CABLE_COLOR = '#00ffff';

/**
 * Fetch submarine cables via Go backend (avoids CORS issues)
 */
export async function fetchSubmarineCables(): Promise<SubmarineCable[]> {
  try {
    const cables = await GetSubmarineCables();
    // Convert backend Cable type to frontend SubmarineCable
    return cables.map((cable) => ({
      id: cable.id,
      name: cable.name,
      color: cable.color || DEFAULT_CABLE_COLOR,
      coordinates: cable.coordinates as [number, number][],
      isHighlighted: false,
    }));
  } catch (error) {
    console.error('Error fetching submarine cables:', error);
    return [];
  }
}

/**
 * Simple bounding box check to determine if a point is in a region
 */
interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Approximate continent bounding boxes
const REGIONS = {
  americas: { minLat: -60, maxLat: 85, minLng: -170, maxLng: -30 },
  europe: { minLat: 35, maxLat: 75, minLng: -10, maxLng: 40 },
  asia: { minLat: 0, maxLat: 80, minLng: 60, maxLng: 180 },
  africa: { minLat: -40, maxLat: 40, minLng: -20, maxLng: 55 },
  oceania: { minLat: -50, maxLat: 0, minLng: 100, maxLng: 180 },
};

// Ocean crossing detection boxes
const OCEAN_CROSSINGS = {
  atlantic: {
    box: { minLat: -60, maxLat: 80, minLng: -80, maxLng: 0 },
    endpoints: ['americas', 'europe', 'africa'] as const,
  },
  pacific: {
    box: { minLat: -60, maxLat: 70, minLng: 100, maxLng: -100 }, // Wraps around dateline
    endpoints: ['americas', 'asia', 'oceania'] as const,
  },
  indian: {
    box: { minLat: -60, maxLat: 30, minLng: 30, maxLng: 120 },
    endpoints: ['africa', 'asia', 'oceania'] as const,
  },
};

function pointInBox(
  lat: number,
  lng: number,
  box: BoundingBox
): boolean {
  // Handle Pacific box that wraps around dateline
  if (box.minLng > box.maxLng) {
    return (
      lat >= box.minLat &&
      lat <= box.maxLat &&
      (lng >= box.minLng || lng <= box.maxLng)
    );
  }
  return (
    lat >= box.minLat &&
    lat <= box.maxLat &&
    lng >= box.minLng &&
    lng <= box.maxLng
  );
}

function getRegion(
  lat: number,
  lng: number
): keyof typeof REGIONS | null {
  for (const [name, box] of Object.entries(REGIONS)) {
    if (pointInBox(lat, lng, box)) {
      return name as keyof typeof REGIONS;
    }
  }
  return null;
}

/**
 * Check if a cable route passes through a region
 */
function cablePassesThroughRegion(
  cable: SubmarineCable,
  box: BoundingBox
): boolean {
  return cable.coordinates.some(([lng, lat]) => pointInBox(lat, lng, box));
}

/**
 * Find cables that likely carry traffic between two points
 * Uses simple heuristic: if points are on different continents,
 * find cables that connect those continents
 */
export function findCablesBetweenPoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  cables: SubmarineCable[]
): SubmarineCable[] {
  const startRegion = getRegion(start.lat, start.lng);
  const endRegion = getRegion(end.lat, end.lng);

  // If same region or unknown, no ocean crossing
  if (!startRegion || !endRegion || startRegion === endRegion) {
    return [];
  }

  // Determine which ocean(s) are being crossed
  const matchingCables: SubmarineCable[] = [];

  for (const [oceanName, ocean] of Object.entries(OCEAN_CROSSINGS)) {
    const endpointRegions = ocean.endpoints as readonly string[];

    // Check if this ocean connects our two regions
    if (
      endpointRegions.includes(startRegion) &&
      endpointRegions.includes(endRegion)
    ) {
      // Find cables that pass through this ocean
      for (const cable of cables) {
        if (cablePassesThroughRegion(cable, ocean.box)) {
          // Additional check: cable should touch both regions
          const touchesStart = cable.coordinates.some(([lng, lat]) => {
            const region = getRegion(lat, lng);
            return region === startRegion;
          });
          const touchesEnd = cable.coordinates.some(([lng, lat]) => {
            const region = getRegion(lat, lng);
            return region === endRegion;
          });

          if (touchesStart && touchesEnd) {
            matchingCables.push(cable);
          }
        }
      }
    }
  }

  return matchingCables;
}

/**
 * Mark cables as highlighted based on a trace route
 */
export function highlightCablesForRoute(
  cables: SubmarineCable[],
  hops: Array<{ lat: number; lng: number }>
): SubmarineCable[] {
  if (hops.length < 2) {
    return cables.map((c) => ({ ...c, isHighlighted: false }));
  }

  // Get start and end of route
  const start = hops[0];
  const end = hops[hops.length - 1];

  // Find cables that cross between start and end
  const highlightedIds = new Set(
    findCablesBetweenPoints(start, end, cables).map((c) => c.id)
  );

  return cables.map((cable) => ({
    ...cable,
    isHighlighted: highlightedIds.has(cable.id),
  }));
}
