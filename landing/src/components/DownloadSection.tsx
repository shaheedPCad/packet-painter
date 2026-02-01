import { motion } from 'framer-motion';
import { Download, Monitor, Apple, Terminal } from 'lucide-react';
import { detectPlatform, DOWNLOAD_URLS, PLATFORM_LABELS, type KnownPlatform } from '../lib/platform-detection';
import { cn } from '../lib/cn';

const platformIcons: Record<KnownPlatform, typeof Monitor> = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
};

const platforms: KnownPlatform[] = ['windows', 'macos', 'linux'];

export function DownloadSection() {
  const detectedPlatform = detectPlatform();

  return (
    <section id="download" className="py-24 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Download Packet Painter
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Free and open source. Available for all major platforms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            const isDetected = platform === detectedPlatform;

            return (
              <a
                key={platform}
                href={DOWNLOAD_URLS[platform]}
                className={cn(
                  'flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300',
                  isDetected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                    : 'bg-card border-border hover:border-primary/50 hover:bg-card/80'
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center',
                    isDetected ? 'bg-primary/20' : 'bg-muted'
                  )}
                >
                  <Icon className={cn('w-7 h-7', isDetected ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="text-center">
                  <div className="font-display font-semibold text-foreground">
                    {PLATFORM_LABELS[platform]}
                  </div>
                  {isDetected && (
                    <div className="text-xs font-body text-primary mt-1">
                      Recommended for you
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors',
                    isDetected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Download className="w-4 h-4" />
                  Download
                </div>
              </a>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8 font-body text-sm text-muted-foreground"
        >
          By downloading, you agree to our{' '}
          <a
            href="https://github.com/shaheedPCad/packet-painter/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            MIT License
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
