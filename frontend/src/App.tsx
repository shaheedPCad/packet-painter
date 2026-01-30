import { AppLayout } from '@/components/layout/AppLayout';
import { GlobeView } from '@/components/globe/GlobeView';
import { useWailsEvents } from '@/hooks/useWailsEvents';

function App() {
  // Subscribe to Wails events at the top level
  useWailsEvents();

  return (
    <AppLayout>
      <GlobeView />
    </AppLayout>
  );
}

export default App;
