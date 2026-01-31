package geo

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

// Location represents geographic coordinates with optional location details
type Location struct {
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	City        string  `json:"city,omitempty"`
	Region      string  `json:"region,omitempty"`
	Country     string  `json:"country,omitempty"`
	CountryCode string  `json:"countryCode,omitempty"`
}

// apiResponse represents the response from ip-api.com
type apiResponse struct {
	Status      string  `json:"status"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	Region      string  `json:"region"`
	City        string  `json:"city"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	ISP         string  `json:"isp"`
	Org         string  `json:"org"`
}

// Lookup provides IP geolocation with caching
type Lookup struct {
	cache  map[string]*Location
	mu     sync.RWMutex
	client *http.Client
}

// NewLookup creates a new geolocation lookup service
func NewLookup() *Lookup {
	return &Lookup{
		cache: make(map[string]*Location),
		client: &http.Client{
			Timeout: 2 * time.Second,
		},
	}
}

// GetLocation returns the geographic location for an IP address
// Returns nil for private IPs, timeouts, or API errors
func (l *Lookup) GetLocation(ip string) *Location {
	// Check cache first
	l.mu.RLock()
	if loc, ok := l.cache[ip]; ok {
		l.mu.RUnlock()
		return loc
	}
	l.mu.RUnlock()

	// Skip private/reserved IPs
	if isPrivateIP(ip) {
		l.cacheResult(ip, nil)
		return nil
	}

	// Fetch from API
	loc := l.fetchFromAPI(ip)

	// Cache result (even nil for failed lookups)
	l.cacheResult(ip, loc)

	return loc
}

// cacheResult stores a location result in the cache
func (l *Lookup) cacheResult(ip string, loc *Location) {
	l.mu.Lock()
	l.cache[ip] = loc
	l.mu.Unlock()
}

// fetchFromAPI queries ip-api.com for location data
func (l *Lookup) fetchFromAPI(ip string) *Location {
	url := fmt.Sprintf("http://ip-api.com/json/%s", ip)

	resp, err := l.client.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	var data apiResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil
	}

	if data.Status != "success" {
		return nil
	}

	return &Location{
		Latitude:    data.Lat,
		Longitude:   data.Lon,
		City:        data.City,
		Region:      data.Region,
		Country:     data.Country,
		CountryCode: data.CountryCode,
	}
}

// isPrivateIP checks if an IP address is private/reserved
func isPrivateIP(ipStr string) bool {
	// Handle empty or wildcard
	if ipStr == "" || ipStr == "*" {
		return true
	}

	ip := net.ParseIP(ipStr)
	if ip == nil {
		return true // Invalid IP, treat as private
	}

	// Check for loopback
	if ip.IsLoopback() {
		return true
	}

	// Check for private addresses
	if ip.IsPrivate() {
		return true
	}

	// Check for link-local
	if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	// Check for unspecified (0.0.0.0 or ::)
	if ip.IsUnspecified() {
		return true
	}

	return false
}
