import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTraceSession } from '@/hooks/useTraceSession';
import { useTraceStore } from '@/stores/traceStore';
import { Play, Trash2, Loader2, Cable, Square } from 'lucide-react';

export function TraceInput() {
  const [target, setTarget] = useState('tokyo.jp');
  const [isCancelling, setIsCancelling] = useState(false);
  const { startTrace, cancelTrace, clearTrace, isRunning, hasSession } =
    useTraceSession();
  const { showSubmarineCables, toggleSubmarineCables } = useTraceStore();

  // Reset cancelling state when trace stops
  useEffect(() => {
    if (!isRunning) setIsCancelling(false);
  }, [isRunning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) {
      setIsCancelling(true);
      await cancelTrace();
    } else {
      startTrace(target);
    }
  };

  const handleClear = () => {
    clearTrace();
    setTarget('tokyo.jp');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2.5">
        <label htmlFor="target" className="text-sm font-medium text-foreground/90">
          Target Host
        </label>
        <Input
          id="target"
          type="text"
          placeholder="e.g., tokyo.jp or london.uk"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={isRunning}
          className="bg-background/50 focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1"
          variant={isRunning ? 'destructive' : 'default'}
          disabled={(!target.trim() && !isRunning) || isCancelling}
        >
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Stopping...
            </>
          ) : isRunning ? (
            <>
              <Square className="mr-2 h-4 w-4" />
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

      {/* Submarine cables toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={showSubmarineCables}
          onChange={toggleSubmarineCables}
          className="rounded border-border"
        />
        <Cable className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Show submarine cables</span>
      </label>

      <p className="text-xs text-muted-foreground">
        Try "tokyo.jp" for SF→Tokyo or "london.uk" for NYC→London
      </p>
    </form>
  );
}
