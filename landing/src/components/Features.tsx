import { motion } from 'framer-motion';
import { Globe, Thermometer, Cable, Server, Monitor, Code } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Real-time 3D Globe',
    description: 'Watch your traceroute unfold on a beautiful interactive globe with smooth animations and intuitive controls.',
  },
  {
    icon: Thermometer,
    title: 'Latency Heatmap',
    description: 'Color-coded hop indicators show latency at a glance - green for fast, yellow for medium, red for slow.',
  },
  {
    icon: Cable,
    title: 'Submarine Cables',
    description: 'Toggle visibility of undersea internet cables to see how your data crosses oceans.',
  },
  {
    icon: Server,
    title: 'Datacenter Detection',
    description: 'Automatically identifies major cloud providers and datacenters along your route.',
  },
  {
    icon: Monitor,
    title: 'Cross-Platform',
    description: 'Native desktop app for Windows, macOS, and Linux with consistent performance everywhere.',
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Fully open source under MIT license. Inspect the code, contribute, or fork it for your needs.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand your network path, beautifully visualized.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
