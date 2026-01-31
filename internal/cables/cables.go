package cables

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// Cable represents a submarine cable with its route
type Cable struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Color       string      `json:"color"`
	Coordinates [][]float64 `json:"coordinates"` // [lng, lat] pairs
}

// CableFeature represents a GeoJSON feature from the API
type cableFeature struct {
	Type       string `json:"type"`
	Properties struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Color string `json:"color"`
	} `json:"properties"`
	Geometry struct {
		Type        string          `json:"type"`
		Coordinates json.RawMessage `json:"coordinates"`
	} `json:"geometry"`
}

// CableGeoJSON represents the GeoJSON response from the API
type cableGeoJSON struct {
	Type     string         `json:"type"`
	Features []cableFeature `json:"features"`
}

const (
	cableAPIURL       = "https://www.submarinecablemap.com/api/v3/cable/cable-geo.json"
	defaultCableColor = "rgba(0, 100, 180, 0.3)"
)

// Service provides submarine cable data with caching
type Service struct {
	cache      []Cable
	cached     bool
	mu         sync.RWMutex
	client     *http.Client
	lastFetch  time.Time
	cacheTTL   time.Duration
}

// NewService creates a new cable service
func NewService() *Service {
	return &Service{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		cacheTTL: 24 * time.Hour, // Cache for 24 hours
	}
}

// FetchCables returns submarine cable data, using cache if available
func (s *Service) FetchCables() ([]Cable, error) {
	s.mu.RLock()
	if s.cached && time.Since(s.lastFetch) < s.cacheTTL {
		cables := s.cache
		s.mu.RUnlock()
		return cables, nil
	}
	s.mu.RUnlock()

	// Fetch from API
	cables, err := s.fetchFromAPI()
	if err != nil {
		return nil, err
	}

	// Update cache
	s.mu.Lock()
	s.cache = cables
	s.cached = true
	s.lastFetch = time.Now()
	s.mu.Unlock()

	return cables, nil
}

// fetchFromAPI fetches cable data from TeleGeography API
func (s *Service) fetchFromAPI() ([]Cable, error) {
	resp, err := s.client.Get(cableAPIURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data cableGeoJSON
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return parseCableGeoJSON(data), nil
}

// parseCableGeoJSON converts GeoJSON to our Cable format
func parseCableGeoJSON(data cableGeoJSON) []Cable {
	var cables []Cable

	for _, feature := range data.Features {
		if feature.Properties.Name == "" {
			continue
		}

		color := feature.Properties.Color
		if color == "" {
			color = defaultCableColor
		}

		id := feature.Properties.ID
		if id == "" {
			id = feature.Properties.Name
		}

		// Parse coordinates based on geometry type
		switch feature.Geometry.Type {
		case "LineString":
			var coords [][]float64
			if err := json.Unmarshal(feature.Geometry.Coordinates, &coords); err != nil {
				continue
			}
			if len(coords) >= 2 {
				cables = append(cables, Cable{
					ID:          id + "-0",
					Name:        feature.Properties.Name,
					Color:       color,
					Coordinates: coords,
				})
			}

		case "MultiLineString":
			var multiCoords [][][]float64
			if err := json.Unmarshal(feature.Geometry.Coordinates, &multiCoords); err != nil {
				continue
			}
			for i, coords := range multiCoords {
				if len(coords) >= 2 {
					cables = append(cables, Cable{
						ID:          id + "-" + string(rune('0'+i)),
						Name:        feature.Properties.Name,
						Color:       color,
						Coordinates: coords,
					})
				}
			}
		}
	}

	return cables
}
