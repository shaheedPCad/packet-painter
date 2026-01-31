import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { FlightState, FlightControls as FlightControlsType } from '@/hooks/useFlightAnimation';
import { Hop } from '@/types';
import { cn } from '@/lib/utils';

interface FlightControlsProps {
  state: FlightState;
  controls: FlightControlsType;
  hops: Hop[];
  totalSegments: number;
}

const SPEED_OPTIONS = [0.5, 1, 2];

export function FlightControls({
  state,
  controls,
  hops,
  totalSegments,
}: FlightControlsProps) {
  const currentHop = state.currentHopIndex !== null ? hops[state.currentHopIndex] : null;

  // Calculate overall progress
  const overallProgress =
    totalSegments > 0
      ? ((state.currentSegment + state.segmentProgress) / totalSegments) * 100
      : 0;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-4 min-w-[320px]">
        {/* Current hop info */}
        {currentHop && (
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChevronRight className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                Hop {currentHop.hopNumber}
              </span>
              {currentHop.isDestination && (
                <Badge variant="secondary" className="text-xs">
                  Destination
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentHop.location?.city || currentHop.ipAddress}
              {currentHop.location?.country && `, ${currentHop.location.country}`}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentHop.avgRtt.toFixed(1)} ms
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Source</span>
            <span>
              {state.currentSegment + 1} / {totalSegments}
            </span>
            <span>Destination</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Play/Pause/Replay */}
          <div className="flex gap-1">
            {state.isComplete ? (
              <Button
                size="sm"
                variant="default"
                onClick={controls.resetFlight}
                title="Replay"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Replay
              </Button>
            ) : state.isPaused ? (
              <Button
                size="sm"
                variant="default"
                onClick={controls.resumeFlight}
                title="Resume"
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={controls.pauseFlight}
                title="Pause"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            {SPEED_OPTIONS.map((speed) => (
              <Button
                key={speed}
                size="sm"
                variant={state.speed === speed ? 'default' : 'ghost'}
                className={cn(
                  'h-7 px-2 text-xs',
                  state.speed === speed && 'font-bold'
                )}
                onClick={() => controls.setSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>

          {/* Exit button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={controls.exitFlight}
            title="Exit Flight Mode"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status indicator */}
        {state.isComplete && (
          <div className="mt-2 text-center text-xs text-green-500 font-medium">
            Flight complete - Arrived at destination
          </div>
        )}
        {state.isPaused && !state.isComplete && (
          <div className="mt-2 text-center text-xs text-yellow-500 font-medium">
            Paused
          </div>
        )}
      </div>
    </div>
  );
}
