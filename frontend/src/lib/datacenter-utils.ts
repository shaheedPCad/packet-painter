// Cloud provider brand colors
export const DATACENTER_COLORS: Record<string, string> = {
  'AWS': '#FF9900',
  'Google Cloud': '#4285F4',
  'Azure': '#0078D4',
  'Cloudflare': '#F38020',
  'Akamai': '#0096D6',
  'Fastly': '#FF282D',
  'DigitalOcean': '#0080FF',
  'Linode': '#00A95C',
  'Vultr': '#007BFC',
  'OVH': '#000E9C',
  'Hetzner': '#D50C2D',
};

// Get color for a provider, with fallback
export function getDatacenterColor(provider: string): string {
  return DATACENTER_COLORS[provider] || '#6B7280';
}

// Short names for display in tight spaces
export const DATACENTER_SHORT_NAMES: Record<string, string> = {
  'AWS': 'AWS',
  'Google Cloud': 'GCP',
  'Azure': 'Azure',
  'Cloudflare': 'CF',
  'Akamai': 'Akamai',
  'Fastly': 'Fastly',
  'DigitalOcean': 'DO',
  'Linode': 'Linode',
  'Vultr': 'Vultr',
  'OVH': 'OVH',
  'Hetzner': 'Hetzner',
};

// Get short name for a provider
export function getDatacenterShortName(provider: string): string {
  return DATACENTER_SHORT_NAMES[provider] || provider;
}
