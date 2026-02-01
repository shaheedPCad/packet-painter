package datacenter

import "strings"

// DataCenter represents a detected cloud provider datacenter
type DataCenter struct {
	Provider string `json:"provider"` // Provider display name (e.g., "AWS", "Google Cloud")
	Color    string `json:"color"`    // Brand color for visualization
}

// Detect attempts to identify a cloud provider from ISP/Org data
// Returns nil if no provider is detected
func Detect(org, isp, hostname string) *DataCenter {
	// Combine org and isp for pattern matching
	combined := strings.ToLower(org + " " + isp)

	// Check each provider's patterns
	for _, provider := range providers {
		for _, pattern := range provider.Patterns {
			if strings.Contains(combined, pattern) {
				return &DataCenter{
					Provider: provider.Name,
					Color:    provider.Color,
				}
			}
		}
	}

	// Fallback: check hostname patterns
	if hostname != "" {
		hostLower := strings.ToLower(hostname)

		// Common hostname patterns for cloud providers
		hostnamePatterns := map[string]Provider{
			"amazonaws.com":   {Name: "AWS", Color: "#FF9900"},
			"cloudfront.net":  {Name: "AWS", Color: "#FF9900"},
			"compute.amazonaws": {Name: "AWS", Color: "#FF9900"},
			"googleusercontent.com": {Name: "Google Cloud", Color: "#4285F4"},
			"1e100.net":       {Name: "Google Cloud", Color: "#4285F4"},
			"google.com":      {Name: "Google Cloud", Color: "#4285F4"},
			"azure.com":       {Name: "Azure", Color: "#0078D4"},
			"cloudapp.azure":  {Name: "Azure", Color: "#0078D4"},
			"cloudflare.com":  {Name: "Cloudflare", Color: "#F38020"},
			"akamai.net":      {Name: "Akamai", Color: "#0096D6"},
			"akamaitechnologies.com": {Name: "Akamai", Color: "#0096D6"},
			"fastly.net":      {Name: "Fastly", Color: "#FF282D"},
			"digitalocean.com": {Name: "DigitalOcean", Color: "#0080FF"},
			"linode.com":      {Name: "Linode", Color: "#00A95C"},
		}

		for pattern, provider := range hostnamePatterns {
			if strings.Contains(hostLower, pattern) {
				return &DataCenter{
					Provider: provider.Name,
					Color:    provider.Color,
				}
			}
		}
	}

	return nil
}
