package trace

import (
	"context"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// MockRoute represents a predefined traceroute path
type MockRoute struct {
	Name        string
	Source      GeoLocation
	Destination GeoLocation
	Hops        []MockHop
}

// MockHop represents a single hop in a mock route
type MockHop struct {
	IPAddress string
	Hostname  string
	Location  GeoLocation
	BaseRTT   float64 // Base RTT in milliseconds
}

// Predefined routes
var (
	SFToTokyoRoute = MockRoute{
		Name: "SF to Tokyo",
		Source: GeoLocation{
			Latitude:    37.7749,
			Longitude:   -122.4194,
			City:        "San Francisco",
			Region:      "California",
			Country:     "United States",
			CountryCode: "US",
		},
		Destination: GeoLocation{
			Latitude:    35.6762,
			Longitude:   139.6503,
			City:        "Tokyo",
			Country:     "Japan",
			CountryCode: "JP",
		},
		Hops: []MockHop{
			{
				IPAddress: "192.168.1.1",
				Hostname:  "router.local",
				Location: GeoLocation{
					Latitude: 37.7749, Longitude: -122.4194,
					City: "San Francisco", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 1,
			},
			{
				IPAddress: "67.59.231.1",
				Hostname:  "gw.sfca.comcast.net",
				Location: GeoLocation{
					Latitude: 37.7749, Longitude: -122.4194,
					City: "San Francisco", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 5,
			},
			{
				IPAddress: "4.68.127.73",
				Hostname:  "ae-2.r21.snjsca04.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 37.3382, Longitude: -121.8863,
					City: "San Jose", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 8,
			},
			{
				IPAddress: "129.250.2.138",
				Hostname:  "ae-5.r24.snjsca04.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 37.3382, Longitude: -121.8863,
					City: "San Jose", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 10,
			},
			{
				IPAddress: "129.250.3.172",
				Hostname:  "ae-1.r25.lsanca07.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 34.0522, Longitude: -118.2437,
					City: "Los Angeles", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 20,
			},
			{
				IPAddress: "129.250.6.98",
				Hostname:  "ae-3.r02.lsanca07.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 34.0522, Longitude: -118.2437,
					City: "Los Angeles", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 25,
			},
			{
				IPAddress: "129.250.2.129",
				Hostname:  "ae-0.r30.osakjp02.jp.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 21.3069, Longitude: -157.8583,
					City: "Honolulu", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 65,
			},
			{
				IPAddress: "129.250.4.14",
				Hostname:  "ae-1.r02.tokyjp05.jp.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 35.6762, Longitude: 139.6503,
					City: "Tokyo", Country: "Japan", CountryCode: "JP",
				},
				BaseRTT: 110,
			},
			{
				IPAddress: "61.213.162.85",
				Hostname:  "ae-1.a02.tokyjp05.jp.ra.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 35.6762, Longitude: 139.6503,
					City: "Tokyo", Country: "Japan", CountryCode: "JP",
				},
				BaseRTT: 115,
			},
			{
				IPAddress: "210.152.135.178",
				Hostname:  "tokyo.jp",
				Location: GeoLocation{
					Latitude: 35.6762, Longitude: 139.6503,
					City: "Tokyo", Country: "Japan", CountryCode: "JP",
				},
				BaseRTT: 120,
			},
		},
	}

	NYCToLondonRoute = MockRoute{
		Name: "NYC to London",
		Source: GeoLocation{
			Latitude:    40.7128,
			Longitude:   -74.0060,
			City:        "New York",
			Region:      "New York",
			Country:     "United States",
			CountryCode: "US",
		},
		Destination: GeoLocation{
			Latitude:    51.5074,
			Longitude:   -0.1278,
			City:        "London",
			Country:     "United Kingdom",
			CountryCode: "GB",
		},
		Hops: []MockHop{
			{
				IPAddress: "192.168.1.1",
				Hostname:  "router.local",
				Location: GeoLocation{
					Latitude: 40.7128, Longitude: -74.0060,
					City: "New York", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 1,
			},
			{
				IPAddress: "68.85.103.109",
				Hostname:  "gw.nyc.verizon.net",
				Location: GeoLocation{
					Latitude: 40.7128, Longitude: -74.0060,
					City: "New York", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 5,
			},
			{
				IPAddress: "154.54.30.185",
				Hostname:  "ae-6.r21.nycmny01.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 40.7128, Longitude: -74.0060,
					City: "New York", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 8,
			},
			{
				IPAddress: "154.54.42.97",
				Hostname:  "ae-2.r24.stfrct01.us.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 41.0534, Longitude: -73.5387,
					City: "Stamford", Country: "United States", CountryCode: "US",
				},
				BaseRTT: 12,
			},
			{
				IPAddress: "154.54.58.185",
				Hostname:  "ae-3.r20.londen12.uk.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 51.5074, Longitude: -0.1278,
					City: "London", Country: "United Kingdom", CountryCode: "GB",
				},
				BaseRTT: 70,
			},
			{
				IPAddress: "130.117.1.78",
				Hostname:  "ae-1.r02.londen12.uk.bb.gin.ntt.net",
				Location: GeoLocation{
					Latitude: 51.5074, Longitude: -0.1278,
					City: "London", Country: "United Kingdom", CountryCode: "GB",
				},
				BaseRTT: 72,
			},
			{
				IPAddress: "185.50.220.4",
				Hostname:  "london.uk",
				Location: GeoLocation{
					Latitude: 51.5074, Longitude: -0.1278,
					City: "London", Country: "United Kingdom", CountryCode: "GB",
				},
				BaseRTT: 75,
			},
		},
	}
)

// HopCallback is called when a hop is generated
type HopCallback func(hop *Hop)

// CompletedCallback is called when the trace completes
type CompletedCallback func(totalHops int)

// MockSession manages a mock traceroute session
type MockSession struct {
	ID         string
	Target     string
	Route      *MockRoute
	cancelFunc context.CancelFunc
	mu         sync.Mutex
	running    bool
}

// NewMockSession creates a new mock session for the given target
func NewMockSession(target string) *MockSession {
	route := selectRoute(target)
	return &MockSession{
		ID:     uuid.New().String(),
		Target: target,
		Route:  route,
	}
}

// selectRoute chooses a route based on the target
func selectRoute(target string) *MockRoute {
	target = strings.ToLower(target)
	if strings.Contains(target, "london") || strings.Contains(target, ".uk") {
		return &NYCToLondonRoute
	}
	// Default to SF-Tokyo route
	return &SFToTokyoRoute
}

// GetSource returns the source location for this session
func (s *MockSession) GetSource() *GeoLocation {
	return &s.Route.Source
}

// Start begins emitting hops with realistic timing
func (s *MockSession) Start(ctx context.Context, onHop HopCallback, onComplete CompletedCallback) {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true

	// Create a cancellable context
	ctx, s.cancelFunc = context.WithCancel(ctx)
	s.mu.Unlock()

	go func() {
		defer func() {
			s.mu.Lock()
			s.running = false
			s.mu.Unlock()
		}()

		totalHops := len(s.Route.Hops)

		for i, mockHop := range s.Route.Hops {
			select {
			case <-ctx.Done():
				return
			default:
			}

			// Generate RTT values with jitter
			rtt := generateRTTValues(mockHop.BaseRTT)
			avgRTT := average(rtt)

			// Create the hop
			hop := &Hop{
				HopNumber:     i + 1,
				IPAddress:     mockHop.IPAddress,
				Hostname:      mockHop.Hostname,
				RTT:           rtt,
				AvgRTT:        avgRTT,
				Location:      &mockHop.Location,
				IsTimeout:     false,
				IsDestination: i == totalHops-1,
				Timestamp:     time.Now().UnixMilli(),
			}

			// Emit the hop
			if onHop != nil {
				onHop(hop)
			}

			// Random delay between hops (150-400ms)
			if i < totalHops-1 {
				delay := time.Duration(150+rand.Intn(250)) * time.Millisecond
				select {
				case <-ctx.Done():
					return
				case <-time.After(delay):
				}
			}
		}

		// Notify completion
		if onComplete != nil {
			onComplete(totalHops)
		}
	}()
}

// Cancel stops the mock session
func (s *MockSession) Cancel() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.cancelFunc != nil {
		s.cancelFunc()
	}
	s.running = false
}

// IsRunning returns whether the session is currently running
func (s *MockSession) IsRunning() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.running
}

// generateRTTValues generates 3 RTT values with jitter around the base
func generateRTTValues(base float64) []float64 {
	jitter := base * 0.15 // 15% jitter
	if jitter < 0.5 {
		jitter = 0.5
	}

	return []float64{
		base + (rand.Float64()*2-1)*jitter,
		base + (rand.Float64()*2-1)*jitter,
		base + (rand.Float64()*2-1)*jitter,
	}
}

// average calculates the average of a slice of float64
func average(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
