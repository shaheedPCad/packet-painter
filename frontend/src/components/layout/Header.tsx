import { Badge } from '@/components/ui/badge';
import { useTraceStore } from '@/stores/traceStore';
import { getStatusVariant } from '@/lib/globe-utils';
import { Globe } from 'lucide-react';

export function Header() {
  const session = useTraceStore((state) => state.session);

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">Packet Painter</h1>
      </div>
      <div className="flex items-center gap-3">
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
