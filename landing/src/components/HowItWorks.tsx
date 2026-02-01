import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Enter a Target',
    description: 'Type any hostname or IP address - like google.com or 8.8.8.8 - into the input field.',
  },
  {
    number: '02',
    title: 'Start the Trace',
    description: 'Click "Start Trace" and watch as each hop is discovered and plotted on the globe in real-time.',
  },
  {
    number: '03',
    title: 'Explore the Path',
    description: 'Rotate the globe, hover over hops for details, and toggle submarine cables to see the full picture.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Three simple steps to visualize your network path.
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex items-start gap-6 p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
