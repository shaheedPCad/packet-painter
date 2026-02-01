export type KnownPlatform = 'windows' | 'macos' | 'linux';
export type Platform = KnownPlatform | 'unknown';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

const RELEASES_PAGE = 'https://github.com/shaheedPCad/packet-painter/releases';

export const DOWNLOAD_URLS: Record<KnownPlatform, string> = {
  windows: RELEASES_PAGE,
  macos: RELEASES_PAGE,
  linux: RELEASES_PAGE,
};

export const PLATFORM_LABELS: Record<KnownPlatform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};
