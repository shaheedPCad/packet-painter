import { useEffect, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { useTraceStore } from '@/stores/traceStore';
import {
  generateArcs,
  generatePoints,
  getCameraPosition,
  GlobeArc,
  GlobePoint,
} from '@/lib/globe-utils';
import { motion } from 'framer-motion';

export function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const { session, selectedHopIndex, selectHop } = useTraceStore();

  const hops = session?.hops ?? [];
  const source = session?.source ?? null;
  const isRunning = session?.status === 'running';

  // Generate visualization data
  const arcs = useMemo(() => generateArcs(hops, source), [hops, source]);
  const points = useMemo(
    () => generatePoints(hops, source, selectedHopIndex),
    [hops, source, selectedHopIndex]
  );

  // Camera auto-pan to follow new hops
  useEffect(() => {
    try {
      if (globeRef.current && hops.length > 0) {
        const pos = getCameraPosition(hops, source);
        globeRef.current.pointOfView(
          { lat: pos.lat, lng: pos.lng, altitude: pos.altitude },
          1000 // Animation duration
        );
      }
    } catch (e) {
      console.error('Camera position error:', e);
    }
  }, [hops.length, source]);

  // Auto-rotate control
  useEffect(() => {
    try {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = !isRunning && hops.length === 0;
          controls.autoRotateSpeed = 0.5;
        }
      }
    } catch (e) {
      console.error('Auto-rotate error:', e);
    }
  }, [isRunning, hops.length]);

  // Handle point click
  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint;
      if (p.hopNumber > 0) {
        const hopIndex = p.hopNumber - 1;
        selectHop(selectedHopIndex === hopIndex ? null : hopIndex);
      }
    },
    [selectedHopIndex, selectHop]
  );

  // Accessor functions with explicit types
  const getArcStartLat = (d: object) => (d as GlobeArc).startLat;
  const getArcStartLng = (d: object) => (d as GlobeArc).startLng;
  const getArcEndLat = (d: object) => (d as GlobeArc).endLat;
  const getArcEndLng = (d: object) => (d as GlobeArc).endLng;
  const getArcColor = (d: object) => (d as GlobeArc).color;
  const getArcDashLength = (d: object) => (d as GlobeArc).dashLength;
  const getArcDashGap = (d: object) => (d as GlobeArc).dashGap;
  const getArcDashAnimateTime = (d: object) => (d as GlobeArc).dashAnimateTime;

  const getPointLat = (d: object) => (d as GlobePoint).lat;
  const getPointLng = (d: object) => (d as GlobePoint).lng;
  const getPointColor = (d: object) => (d as GlobePoint).color;
  const getPointRadius = (d: object) => (d as GlobePoint).size;
  const getPointLabel = (d: object) => {
    const p = d as GlobePoint;
    return `<div class="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs">
      <div class="font-medium">${p.label}</div>
      ${p.hopNumber > 0 ? `<div class="text-muted-foreground">Hop ${p.hopNumber}</div>` : '<div class="text-green-500">Source</div>'}
    </div>`;
  };

  return (
    <motion.div
      ref={containerRef}
      className="globe-container w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        // Arcs
        arcsData={arcs}
        arcStartLat={getArcStartLat}
        arcStartLng={getArcStartLng}
        arcEndLat={getArcEndLat}
        arcEndLng={getArcEndLng}
        arcColor={getArcColor}
        arcDashLength={getArcDashLength}
        arcDashGap={getArcDashGap}
        arcDashAnimateTime={getArcDashAnimateTime}
        arcStroke={0.5}
        arcsTransitionDuration={300}
        // Points
        pointsData={points}
        pointLat={getPointLat}
        pointLng={getPointLng}
        pointColor={getPointColor}
        pointRadius={getPointRadius}
        pointAltitude={0.01}
        pointLabel={getPointLabel}
        onPointClick={handlePointClick}
        pointsTransitionDuration={300}
        // Atmosphere
        atmosphereColor="#3a82f7"
        atmosphereAltitude={0.15}
        // Performance
        animateIn={true}
        width={Math.max(100, containerRef.current?.clientWidth ?? window.innerWidth - 320)}
        height={Math.max(100, containerRef.current?.clientHeight ?? window.innerHeight - 56)}
      />
    </motion.div>
  );
}
