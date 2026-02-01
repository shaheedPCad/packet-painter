package datacenter

// Provider represents a cloud provider with detection patterns
type Provider struct {
	Name     string   // Display name
	Color    string   // Brand color for visualization
	Patterns []string // Lowercase patterns to match in org/isp
}

// Known cloud providers with their patterns and brand colors
var providers = []Provider{
	{
		Name:     "AWS",
		Color:    "#FF9900",
		Patterns: []string{"amazon", "aws", "ec2", "cloudfront"},
	},
	{
		Name:     "Google Cloud",
		Color:    "#4285F4",
		Patterns: []string{"google"},
	},
	{
		Name:     "Azure",
		Color:    "#0078D4",
		Patterns: []string{"microsoft"},
	},
	{
		Name:     "Cloudflare",
		Color:    "#F38020",
		Patterns: []string{"cloudflare"},
	},
	{
		Name:     "Akamai",
		Color:    "#0096D6",
		Patterns: []string{"akamai"},
	},
	{
		Name:     "Fastly",
		Color:    "#FF282D",
		Patterns: []string{"fastly"},
	},
	{
		Name:     "DigitalOcean",
		Color:    "#0080FF",
		Patterns: []string{"digitalocean"},
	},
	{
		Name:     "Linode",
		Color:    "#00A95C",
		Patterns: []string{"linode", "akamai connected cloud"},
	},
	{
		Name:     "Vultr",
		Color:    "#007BFC",
		Patterns: []string{"vultr", "choopa"},
	},
	{
		Name:     "OVH",
		Color:    "#000E9C",
		Patterns: []string{"ovh"},
	},
	{
		Name:     "Hetzner",
		Color:    "#D50C2D",
		Patterns: []string{"hetzner"},
	},
}

// GetProviders returns all known cloud providers
func GetProviders() []Provider {
	return providers
}
