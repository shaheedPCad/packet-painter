import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 starfield" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Purple glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[96px] animate-pulse delay-1000" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-border rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-body text-muted-foreground">
            Open source network visualization
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          Watch your packets
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            travel the world
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Packet Painter visualizes traceroute data on a beautiful interactive 3D globe.
          See the path your data takes across continents, through submarine cables, and into datacenters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#download"
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-body font-semibold text-lg transition-all hover:shadow-xl hover:shadow-primary/30 animate-glow-pulse"
          >
            Download for Free
          </a>
          <a
            href="#features"
            className="px-8 py-4 bg-card hover:bg-card/80 text-foreground border border-border rounded-xl font-body font-medium text-lg transition-all"
          >
            Learn More
          </a>
        </motion.div>
      </div>
    </section>
  );
}
