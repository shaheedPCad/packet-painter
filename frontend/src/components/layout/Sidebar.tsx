import { TraceInput } from '@/components/trace/TraceInput';
import { HopList } from '@/components/trace/HopList';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  return (
    <aside className="w-80 border-r border-border bg-card/30 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <TraceInput />
      </div>
      <ScrollArea className="flex-1">
        <HopList />
      </ScrollArea>
    </aside>
  );
}
