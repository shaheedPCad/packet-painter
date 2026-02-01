import { TraceInput } from '@/components/trace/TraceInput';
import { HopList } from '@/components/trace/HopList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTraceStore } from '@/stores/traceStore';
import { AlertCircle } from 'lucide-react';

export function Sidebar() {
  const session = useTraceStore((state) => state.session);
  const error = session?.status === 'error' ? session.error : null;

  return (
    <aside className="w-80 bg-card/40 flex flex-col h-full" style={{ boxShadow: '1px 0 3px 0 rgb(0 0 0 / 0.2)' }}>
      <div className="p-5 border-b border-border/50">
        <TraceInput />
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <HopList />
      </ScrollArea>
    </aside>
  );
}
