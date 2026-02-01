import { useMemo } from 'react';
import { generateHeatmapData, HeatmapPoint } from '@/lib/latency-heatmap';
import { GeoLocation } from '@/types';

// Hook for generating and memoizing latency heatmap data
export function useLatencyHeatmap(
  source: GeoLocation | null,
  enabled: boolean
): HeatmapPoint[] {
  const heatmapData = useMemo(() => {
    if (!enabled || !source) {
      return [];
    }

    return generateHeatmapData(source.latitude, source.longitude);
  }, [source?.latitude, source?.longitude, enabled]);

  return heatmapData;
}
