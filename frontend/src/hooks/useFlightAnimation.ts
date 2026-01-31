import { useState, useCallback, useRef, useEffect } from 'react';
import { Hop, GeoLocation } from '@/types';
import {
  interpolateArc,
  getFlightCameraPosition,
  buildFlightPath,
  FlightSegment,
} from '@/lib/globe-utils';

export interface FlightState {
  isFlying: boolean;
  currentSegment: number; // Which arc we're on (0 = source→hop1)
  segmentProgress: number; // 0-1 progress along current arc
  speed: number; // Animation speed multiplier
  isPaused: boolean;
  isComplete: boolean;
  packetPosition: { lat: number; lng: number } | null;
  cameraPosition: { lat: number; lng: number; altitude: number } | null;
  currentHopIndex: number | null; // Current hop being approached/reached
}

export interface FlightControls {
  startFlight: () => void;
  pauseFlight: () => void;
  resumeFlight: () => void;
  resetFlight: () => void;
  exitFlight: () => void;
  setSpeed: (speed: number) => void;
}

const SEGMENT_DURATION_MS = 2000; // Base duration per segment
const HOP_PAUSE_MS = 500; // Pause at each hop
const CAMERA_ALTITUDE = 0.5; // Close to globe for cinematic effect

export function useFlightAnimation(
  hops: Hop[],
  source: GeoLocation | null
): { state: FlightState; controls: FlightControls } {
  const [state, setState] = useState<FlightState>({
    isFlying: false,
    currentSegment: 0,
    segmentProgress: 0,
    speed: 1,
    isPaused: false,
    isComplete: false,
    packetPosition: null,
    cameraPosition: null,
    currentHopIndex: null,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const hopPauseRef = useRef<number>(0);
  const segmentsRef = useRef<FlightSegment[]>([]);

  // Build flight path when hops/source change
  useEffect(() => {
    segmentsRef.current = buildFlightPath(hops, source);
  }, [hops, source]);

  const updateAnimation = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setState((prev) => {
      if (prev.isPaused || !prev.isFlying || prev.isComplete) {
        return prev;
      }

      const segments = segmentsRef.current;
      if (segments.length === 0) {
        return { ...prev, isComplete: true };
      }

      // Check if we're in a hop pause
      if (hopPauseRef.current > 0) {
        hopPauseRef.current -= deltaTime * prev.speed;
        if (hopPauseRef.current > 0) {
          return prev;
        }
        hopPauseRef.current = 0;
      }

      // Calculate progress increment
      const segmentDuration = SEGMENT_DURATION_MS / prev.speed;
      const progressIncrement = deltaTime / segmentDuration;
      let newProgress = prev.segmentProgress + progressIncrement;
      let newSegment = prev.currentSegment;

      // Check if segment completed
      if (newProgress >= 1) {
        newProgress = 0;
        newSegment = prev.currentSegment + 1;

        // Check if animation complete
        if (newSegment >= segments.length) {
          return {
            ...prev,
            isComplete: true,
            segmentProgress: 1,
            currentSegment: segments.length - 1,
          };
        }

        // Trigger hop pause
        hopPauseRef.current = HOP_PAUSE_MS;
      }

      const currentSeg = segments[newSegment];
      if (!currentSeg) {
        return { ...prev, isComplete: true };
      }

      // Interpolate packet position along the arc
      const packetPos = interpolateArc(currentSeg.start, currentSeg.end, newProgress);

      // Get camera position behind packet, looking toward destination
      const cameraPos = getFlightCameraPosition(
        packetPos.lat,
        packetPos.lng,
        currentSeg.end.lat,
        currentSeg.end.lng,
        CAMERA_ALTITUDE
      );

      return {
        ...prev,
        currentSegment: newSegment,
        segmentProgress: newProgress,
        packetPosition: packetPos,
        cameraPosition: cameraPos,
        currentHopIndex: currentSeg.hopIndex,
      };
    });

    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, []);

  const startFlight = useCallback(() => {
    const segments = segmentsRef.current;
    if (segments.length === 0) return;

    // Initialize with starting position
    const firstSeg = segments[0];
    const initialPacketPos = { ...firstSeg.start };
    const initialCameraPos = getFlightCameraPosition(
      firstSeg.start.lat,
      firstSeg.start.lng,
      firstSeg.end.lat,
      firstSeg.end.lng,
      CAMERA_ALTITUDE
    );

    setState((prev) => ({
      ...prev,
      isFlying: true,
      currentSegment: 0,
      segmentProgress: 0,
      isPaused: false,
      isComplete: false,
      packetPosition: initialPacketPos,
      cameraPosition: initialCameraPos,
      currentHopIndex: firstSeg.hopIndex,
    }));

    lastTimeRef.current = 0;
    hopPauseRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [updateAnimation]);

  const pauseFlight = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const resumeFlight = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [updateAnimation]);

  const resetFlight = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const segments = segmentsRef.current;
    if (segments.length === 0) {
      setState((prev) => ({
        ...prev,
        isFlying: false,
        isComplete: false,
        packetPosition: null,
        cameraPosition: null,
      }));
      return;
    }

    // Reset to start
    const firstSeg = segments[0];
    const initialPacketPos = { ...firstSeg.start };
    const initialCameraPos = getFlightCameraPosition(
      firstSeg.start.lat,
      firstSeg.start.lng,
      firstSeg.end.lat,
      firstSeg.end.lng,
      CAMERA_ALTITUDE
    );

    setState((prev) => ({
      ...prev,
      currentSegment: 0,
      segmentProgress: 0,
      isPaused: false,
      isComplete: false,
      packetPosition: initialPacketPos,
      cameraPosition: initialCameraPos,
      currentHopIndex: firstSeg.hopIndex,
    }));

    lastTimeRef.current = 0;
    hopPauseRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [updateAnimation]);

  const exitFlight = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setState({
      isFlying: false,
      currentSegment: 0,
      segmentProgress: 0,
      speed: 1,
      isPaused: false,
      isComplete: false,
      packetPosition: null,
      cameraPosition: null,
      currentHopIndex: null,
    });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    state,
    controls: {
      startFlight,
      pauseFlight,
      resumeFlight,
      resetFlight,
      exitFlight,
      setSpeed,
    },
  };
}
