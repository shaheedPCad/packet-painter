import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTraceStore } from '@/stores/traceStore';
import { getStatusVariant } from '@/lib/globe-utils';
import { Globe, Thermometer } from 'lucide-react';

export function Header() {
  const session = useTraceStore((state) => state.session);
  const showLatencyHeatmap = useTraceStore((state) => state.showLatencyHeatmap);
  const toggleLatencyHeatmap = useTraceStore((state) => state.toggleLatencyHeatmap);

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">Packet Painter</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant={showLatencyHeatmap ? 'default' : 'outline'}
          size="sm"
          onClick={toggleLatencyHeatmap}
          title="Toggle latency heatmap"
          disabled={!session?.source}
        >
          <Thermometer className="h-4 w-4 mr-1" />
          Heatmap
        </Button>
        {session && (
          <>
            <Badge variant={getStatusVariant(session.status)}>
              {session.status}
            </Badge>
            {session.target && (
              <span className="text-sm text-muted-foreground">
                {session.target}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}
