// Heatmap point data structure for react-globe.gl
export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

// Calculate great-circle distance between two points using Haversine formula
// Returns distance in kilometers
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Estimate latency based on distance
// Model: base latency + propagation delay
// 10ms base + 0.06ms per km (roughly speed of light in fiber * 1.5 for routing overhead)
export function estimateLatency(distanceKm: number): number {
  return 10 + distanceKm * 0.06;
}

// Generate heatmap data grid from user's location
// Creates a grid of points covering the globe with latency-based weights
export function generateHeatmapData(
  userLat: number,
  userLng: number,
  gridStep: number = 8
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];

  // Cover globe from -80 to 80 latitude (avoid poles for cleaner visualization)
  for (let lat = -80; lat <= 80; lat += gridStep) {
    for (let lng = -180; lng <= 180; lng += gridStep) {
      const distance = haversineDistance(userLat, userLng, lat, lng);
      const latency = estimateLatency(distance);

      // Normalize weight to 0-1 range
      // 0 = nearby/fast (green), 1 = far/slow (red)
      // Max latency for normalization: ~300ms (halfway around the world)
      const weight = Math.min(latency / 300, 1);

      points.push({ lat, lng, weight });
    }
  }

  return points;
}

// Color function for heatmap - returns RGBA string based on weight
// Green (low latency) -> Yellow -> Orange -> Red (high latency)
export function getHeatmapColor(weight: number): string {
  // weight: 0 = green, 1 = red
  // Interpolate from green (#22c55e) to red (#ef4444)
  const r = Math.round(34 + weight * 205); // 34 -> 239
  const g = Math.round(197 - weight * 129); // 197 -> 68
  const b = Math.round(94 - weight * 26); // 94 -> 68

  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}
