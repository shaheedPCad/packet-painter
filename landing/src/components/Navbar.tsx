import { motion } from 'framer-motion';
import { Globe, Github, Download } from 'lucide-react';

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">
            Packet Painter
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Features
          </a>
          <a
            href="https://github.com/shaheedPCad/packet-painter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="#download"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-body text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
