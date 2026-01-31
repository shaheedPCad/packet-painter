import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTraceSession } from '@/hooks/useTraceSession';
import { useTraceStore } from '@/stores/traceStore';
import { Play, Trash2, Loader2, Plane } from 'lucide-react';

export function TraceInput() {
  const [target, setTarget] = useState('tokyo.jp');
  const { startTrace, cancelTrace, clearTrace, isRunning, isCompleted, hasSession } =
    useTraceSession();
  const { toggleFlightMode, flightMode } = useTraceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) {
      cancelTrace();
    } else {
      startTrace(target);
    }
  };

  const handleClear = () => {
    clearTrace();
    setTarget('tokyo.jp');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="target" className="text-sm font-medium text-foreground">
          Target Host
        </label>
        <Input
          id="target"
          type="text"
          placeholder="e.g., tokyo.jp or london.uk"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={isRunning}
          className="bg-background/50"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1"
          variant={isRunning ? 'destructive' : 'default'}
          disabled={!target.trim() && !isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Stop
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Trace
            </>
          )}
        </Button>
        {hasSession && !isRunning && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Flight Mode button - only shown when trace is completed */}
      {isCompleted && !flightMode.enabled && (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={toggleFlightMode}
        >
          <Plane className="mr-2 h-4 w-4" />
          Flight Mode
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        Try "tokyo.jp" for SF→Tokyo or "london.uk" for NYC→London
      </p>
    </form>
  );
}
