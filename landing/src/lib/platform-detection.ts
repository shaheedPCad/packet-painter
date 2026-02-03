export type KnownPlatform = 'windows' | 'macos' | 'linux';
export type Platform = KnownPlatform | 'unknown';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

export const DOWNLOAD_URLS: Record<KnownPlatform, string> = {
  windows: 'https://github.com/shaheedPCad/packet-painter/releases/latest/download/Packet-Painter-windows-amd64.exe',
  macos: 'https://github.com/shaheedPCad/packet-painter/releases/latest/download/Packet-Painter-darwin-universal.zip',
  linux: 'https://github.com/shaheedPCad/packet-painter/releases/latest/download/Packet-Painter-linux-amd64',
};

export const PLATFORM_LABELS: Record<KnownPlatform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};
