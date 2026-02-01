import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GlobeShowcase } from './components/GlobeShowcase';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { DownloadSection } from './components/DownloadSection';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <GlobeShowcase />
        <Features />
        <HowItWorks />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
