import { Globe, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-semibold text-foreground">
              Packet Painter
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/shaheedPCad/packet-painter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://github.com/shaheedPCad/packet-painter/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
            >
              MIT License
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="font-body text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary" /> by{' '}
            <a
              href="https://github.com/shaheedPCad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              shaheedPCad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
