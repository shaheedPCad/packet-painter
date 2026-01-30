import { useTraceStore } from '@/stores/traceStore';
import { HopItem } from './HopItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Network, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function HopList() {
  const { session, selectedHopIndex, selectHop } = useTraceStore();

  if (!session) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No trace running</p>
        <p className="text-xs mt-1">Enter a target and click Start Trace</p>
      </div>
    );
  }

  const { hops, status, source } = session;

  return (
    <div className="p-4 space-y-4">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {status === 'running' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Tracing route...
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Trace complete
            </span>
          ) : status === 'cancelled' ? (
            <span className="flex items-center gap-2 text-yellow-500">
              <XCircle className="h-4 w-4" />
              Trace cancelled
            </span>
          ) : (
            'Trace'
          )}
        </span>
        <Badge variant="secondary">{hops.length} hops</Badge>
      </div>

      {/* Source location */}
      {source && (
        <div className="text-xs text-muted-foreground bg-accent/30 rounded-md p-2">
          <span className="text-green-500 font-medium">Source:</span>{' '}
          {source.city}, {source.country}
        </div>
      )}

      {/* Hop list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {hops.map((hop, index) => (
            <HopItem
              key={`${hop.hopNumber}-${hop.ipAddress}`}
              hop={hop}
              index={index}
              isSelected={selectedHopIndex === index}
              onSelect={() => selectHop(selectedHopIndex === index ? null : index)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state while running */}
      {status === 'running' && hops.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm">Waiting for hops...</p>
        </div>
      )}
    </div>
  );
}
