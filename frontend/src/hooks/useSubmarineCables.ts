import { useState, useEffect, useMemo } from 'react';
import {
  SubmarineCable,
  fetchSubmarineCables,
  highlightCablesForRoute,
} from '@/lib/submarine-cables';
import { useTraceStore } from '@/stores/traceStore';

/**
 * Hook to manage submarine cable state
 * Fetches cables on mount and highlights based on current trace route
 */
export function useSubmarineCables() {
  const [cables, setCables] = useState<SubmarineCable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session, showSubmarineCables } = useTraceStore();

  // Fetch cables on mount
  useEffect(() => {
    let cancelled = false;

    async function loadCables() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubmarineCables();
        if (!cancelled) {
          setCables(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load cables');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCables();

    return () => {
      cancelled = true;
    };
  }, []);

  // Extract hop coordinates from session for highlighting
  const hopCoordinates = useMemo(() => {
    if (!session?.hops || session.hops.length === 0) {
      return [];
    }

    const coords: Array<{ lat: number; lng: number }> = [];

    // Include source if available
    if (session.source) {
      coords.push({
        lat: session.source.latitude,
        lng: session.source.longitude,
      });
    }

    // Add hop locations
    for (const hop of session.hops) {
      if (hop.location) {
        coords.push({
          lat: hop.location.latitude,
          lng: hop.location.longitude,
        });
      }
    }

    return coords;
  }, [session?.hops, session?.source]);

  // Highlight cables based on current route
  const cablesWithHighlight = useMemo(() => {
    if (cables.length === 0) return [];

    // Only highlight when trace is completed
    if (session?.status !== 'completed' || hopCoordinates.length < 2) {
      return cables.map((c) => ({ ...c, isHighlighted: false }));
    }

    return highlightCablesForRoute(cables, hopCoordinates);
  }, [cables, hopCoordinates, session?.status]);

  return {
    cables: cablesWithHighlight,
    loading,
    error,
    showCables: showSubmarineCables,
  };
}
