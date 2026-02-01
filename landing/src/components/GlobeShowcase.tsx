import { motion } from 'framer-motion';

export function GlobeShowcase() {
  return (
    <section id="showcase" className="py-24 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow frame */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-sm opacity-50" />

          {/* Screenshot container */}
          <div className="relative bg-card rounded-2xl overflow-hidden border border-border">
            <img
              src="./sample.png"
              alt="Packet Painter showing a traceroute visualization on a 3D globe"
              className="w-full h-auto"
            />
          </div>

          {/* Floating labels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="absolute -left-4 top-1/4 px-4 py-2 bg-card/90 backdrop-blur border border-border rounded-lg shadow-xl"
          >
            <span className="text-sm font-body text-foreground">Interactive 3D Globe</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="absolute -right-4 top-1/2 px-4 py-2 bg-card/90 backdrop-blur border border-border rounded-lg shadow-xl"
          >
            <span className="text-sm font-body text-foreground">Real-time Tracing</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="absolute left-1/4 -bottom-4 px-4 py-2 bg-card/90 backdrop-blur border border-border rounded-lg shadow-xl"
          >
            <span className="text-sm font-body text-foreground">Submarine Cables</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
