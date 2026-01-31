import { useEffect, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { useTraceStore } from '@/stores/traceStore';
import {
  generateArcs,
  generatePoints,
  getCameraPosition,
  buildFlightPath,
  GlobeArc,
  GlobePoint,
} from '@/lib/globe-utils';
import { useFlightAnimation } from '@/hooks/useFlightAnimation';
import { FlightControls } from './FlightControls';
import { motion } from 'framer-motion';

export function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const { session, selectedHopIndex, selectHop, flightMode, exitFlightMode } =
    useTraceStore();

  const hops = session?.hops ?? [];
  const source = session?.source ?? null;
  const isRunning = session?.status === 'running';

  // Flight animation
  const { state: flightState, controls: flightControls } = useFlightAnimation(
    hops,
    source
  );
  const isFlying = flightState.isFlying;

  // Build flight path for segment count
  const flightSegments = useMemo(
    () => buildFlightPath(hops, source),
    [hops, source]
  );

  // Generate visualization data
  const arcs = useMemo(() => generateArcs(hops, source), [hops, source]);
  const points = useMemo(
    () => generatePoints(hops, source, selectedHopIndex),
    [hops, source, selectedHopIndex]
  );

  // Camera auto-pan to follow new hops (disabled during flight mode)
  useEffect(() => {
    if (isFlying) return; // Let flight mode control camera
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
  }, [hops.length, source, isFlying]);

  // Flight mode camera following
  useEffect(() => {
    if (!isFlying || !flightState.cameraPosition || !globeRef.current) return;

    try {
      globeRef.current.pointOfView(
        {
          lat: flightState.cameraPosition.lat,
          lng: flightState.cameraPosition.lng,
          altitude: flightState.cameraPosition.altitude,
        },
        50 // Fast update for smooth following
      );
    } catch (e) {
      console.error('Flight camera error:', e);
    }
  }, [isFlying, flightState.cameraPosition]);

  // Start flight when flight mode is enabled
  useEffect(() => {
    if (flightMode.enabled && !isFlying && flightSegments.length > 0) {
      flightControls.startFlight();
    }
  }, [flightMode.enabled, isFlying, flightSegments.length, flightControls]);

  // Sync speed from store to flight animation
  useEffect(() => {
    if (flightState.speed !== flightMode.speed) {
      flightControls.setSpeed(flightMode.speed);
    }
  }, [flightMode.speed, flightState.speed, flightControls]);

  // Handle flight exit
  const handleExitFlight = useCallback(() => {
    flightControls.exitFlight();
    exitFlightMode();
  }, [flightControls, exitFlightMode]);

  // Auto-rotate control (disabled during flight mode)
  useEffect(() => {
    try {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = !isRunning && !isFlying && hops.length === 0;
          controls.autoRotateSpeed = 0.5;
          // Disable user interaction during flight mode for cinematic effect
          controls.enabled = !isFlying;
        }
      }
    } catch (e) {
      console.error('Auto-rotate error:', e);
    }
  }, [isRunning, hops.length, isFlying]);

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

  // Packet custom layer data
  interface PacketData {
    lat: number;
    lng: number;
  }

  const packetData: PacketData[] = useMemo(() => {
    if (!isFlying || !flightState.packetPosition) return [];
    return [
      {
        lat: flightState.packetPosition.lat,
        lng: flightState.packetPosition.lng,
      },
    ];
  }, [isFlying, flightState.packetPosition]);

  // Create glowing packet mesh
  const createPacketObject = useCallback(() => {
    const group = new THREE.Group();

    // Core sphere
    const geometry = new THREE.SphereGeometry(0.02, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.95,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Outer glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowSphere);

    // Second glow layer for more effect
    const outerGlowGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.15,
    });
    const outerGlowSphere = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    group.add(outerGlowSphere);

    return group;
  }, []);

  // Accessors for custom layer
  const getCustomLat = (d: object) => (d as PacketData).lat;
  const getCustomLng = (d: object) => (d as PacketData).lng;
  const getCustomAltitude = () => 0.02; // Slight elevation above surface

  // Wrap exit handler to use in controls
  const wrappedFlightControls = useMemo(
    () => ({
      ...flightControls,
      exitFlight: handleExitFlight,
    }),
    [flightControls, handleExitFlight]
  );

  return (
    <motion.div
      ref={containerRef}
      className="globe-container w-full h-full relative"
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
        // Custom layer for flying packet
        customLayerData={packetData}
        customThreeObject={createPacketObject}
        customThreeObjectUpdate={(obj, d) => {
          // Position is handled by the globe library
          // We could add pulse animation here if needed
        }}
        customLayerLabel={() => ''}
        // @ts-expect-error react-globe.gl types may not include these
        customLayerLat={getCustomLat}
        customLayerLng={getCustomLng}
        customLayerAltitude={getCustomAltitude}
        // Atmosphere
        atmosphereColor="#3a82f7"
        atmosphereAltitude={0.15}
        // Performance
        animateIn={true}
        width={Math.max(100, containerRef.current?.clientWidth ?? window.innerWidth - 320)}
        height={Math.max(100, containerRef.current?.clientHeight ?? window.innerHeight - 56)}
      />

      {/* Flight mode controls overlay */}
      {isFlying && (
        <FlightControls
          state={flightState}
          controls={wrappedFlightControls}
          hops={hops}
          totalSegments={flightSegments.length}
        />
      )}
    </motion.div>
  );
}
