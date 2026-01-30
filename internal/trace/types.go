package trace

// GeoLocation represents geographic coordinates with optional location details
type GeoLocation struct {
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	City        string  `json:"city,omitempty"`
	Region      string  `json:"region,omitempty"`
	Country     string  `json:"country,omitempty"`
	CountryCode string  `json:"countryCode,omitempty"`
}

// Hop represents a single hop in a traceroute
type Hop struct {
	HopNumber     int          `json:"hopNumber"`
	IPAddress     string       `json:"ipAddress"`
	Hostname      string       `json:"hostname,omitempty"`
	RTT           []float64    `json:"rtt"`
	AvgRTT        float64      `json:"avgRtt"`
	Location      *GeoLocation `json:"location"`
	IsTimeout     bool         `json:"isTimeout"`
	IsDestination bool         `json:"isDestination"`
	Timestamp     int64        `json:"timestamp"`
}

// TraceStartedEvent is emitted when a trace begins
type TraceStartedEvent struct {
	SessionID string       `json:"sessionId"`
	Target    string       `json:"target"`
	Source    *GeoLocation `json:"source"`
	Timestamp int64        `json:"timestamp"`
}

// TraceHopEvent is emitted for each hop discovered
type TraceHopEvent struct {
	SessionID string `json:"sessionId"`
	Hop       *Hop   `json:"hop"`
}

// TraceCompletedEvent is emitted when a trace finishes successfully
type TraceCompletedEvent struct {
	SessionID string `json:"sessionId"`
	TotalHops int    `json:"totalHops"`
	Timestamp int64  `json:"timestamp"`
}

// TraceCancelledEvent is emitted when a trace is cancelled
type TraceCancelledEvent struct {
	SessionID string `json:"sessionId"`
	Timestamp int64  `json:"timestamp"`
}

// TraceErrorEvent is emitted when a trace encounters an error
type TraceErrorEvent struct {
	SessionID string `json:"sessionId"`
	Error     string `json:"error"`
	Timestamp int64  `json:"timestamp"`
}
