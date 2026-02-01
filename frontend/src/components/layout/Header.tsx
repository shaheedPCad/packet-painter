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
    <header className="h-16 bg-card/60 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-6" style={{ boxShadow: 'var(--shadow-subtle)', background: 'linear-gradient(90deg, hsl(270 30% 7% / 0.8) 0%, hsl(280 35% 8% / 0.8) 100%)' }}>
      <div className="flex items-center gap-4">
        <Globe className="h-7 w-7 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgb(139 92 246 / 0.5))' }} />
        <h1 className="text-xl font-semibold tracking-tight">Packet Painter</h1>
      </div>
      <div className="flex items-center gap-4">
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
