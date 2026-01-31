/**
 * Submarine cable data fetching and processing
 * Data source: TeleGeography Submarine Cable Map API
 */

export interface SubmarineCable {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][]; // [lng, lat] pairs (GeoJSON format)
  isHighlighted?: boolean;
}

interface CableFeature {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    color?: string;
  };
  geometry: {
    type: 'MultiLineString' | 'LineString';
    coordinates: number[][][] | number[][];
  };
}

interface CableGeoJSON {
  type: 'FeatureCollection';
  features: CableFeature[];
}

const CABLE_API_URL =
  'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';

// Default subtle blue color for cables
const DEFAULT_CABLE_COLOR = 'rgba(0, 100, 180, 0.3)';

// Highlighted cable color (bright cyan)
export const HIGHLIGHTED_CABLE_COLOR = '#00ffff';

/**
 * Fetch submarine cables from TeleGeography API
 */
export async function fetchSubmarineCables(): Promise<SubmarineCable[]> {
  try {
    const response = await fetch(CABLE_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch cables: ${response.status}`);
    }

    const data: CableGeoJSON = await response.json();
    return parseCableGeoJSON(data);
  } catch (error) {
    console.error('Error fetching submarine cables:', error);
    return [];
  }
}

/**
 * Parse GeoJSON cable data into our format
 * TeleGeography uses MultiLineString for cables with multiple segments
 */
function parseCableGeoJSON(data: CableGeoJSON): SubmarineCable[] {
  const cables: SubmarineCable[] = [];

  for (const feature of data.features) {
    const { properties, geometry } = feature;

    if (!properties.name || !geometry) continue;

    // Handle both MultiLineString and LineString
    const coordArrays =
      geometry.type === 'MultiLineString'
        ? geometry.coordinates
        : [geometry.coordinates];

    // Flatten MultiLineString into separate cable entries for each segment
    // This makes rendering more efficient with react-globe.gl paths
    coordArrays.forEach((coords, segmentIndex) => {
      if (!Array.isArray(coords) || coords.length < 2) return;

      cables.push({
        id: `${properties.id || properties.name}-${segmentIndex}`,
        name: properties.name,
        color: properties.color || DEFAULT_CABLE_COLOR,
        coordinates: coords as [number, number][],
        isHighlighted: false,
      });
    });
  }

  return cables;
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
