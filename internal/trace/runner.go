package trace

import (
	"context"
	"sync"

	"github.com/google/uuid"
	"packet-painter/internal/geo"
)

// ErrorCallback is called when trace encounters an error
type ErrorCallback func(err error)

// Runner executes platform-specific traceroute
type Runner interface {
	Run(ctx context.Context, target string, geoLookup *geo.Lookup, onHop HopCallback, onComplete CompletedCallback, onError ErrorCallback) error
}

// Session manages a real traceroute session
type Session struct {
	ID         string
	Target     string
	runner     Runner
	geoLookup  *geo.Lookup
	cancelFunc context.CancelFunc
	mu         sync.Mutex
	running    bool
}

// NewSession creates a new traceroute session for the given target
func NewSession(target string) *Session {
	return &Session{
		ID:        uuid.New().String(),
		Target:    target,
		runner:    newPlatformRunner(),
		geoLookup: geo.NewLookup(),
	}
}

// GetSource returns the source location for this session
// Returns nil since we don't have local geo lookup
func (s *Session) GetSource() *geo.Location {
	return nil
}

// Start begins the traceroute with real system commands
func (s *Session) Start(ctx context.Context, onHop HopCallback, onComplete CompletedCallback, onError ErrorCallback) {
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

		err := s.runner.Run(ctx, s.Target, s.geoLookup, onHop, onComplete, onError)
		if err != nil && onError != nil {
			// Only call onError if context wasn't cancelled
			if ctx.Err() == nil {
				onError(err)
			}
		}
	}()
}

// Cancel stops the traceroute session
func (s *Session) Cancel() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.cancelFunc != nil {
		s.cancelFunc()
	}
	s.running = false
}

// IsRunning returns whether the session is currently running
func (s *Session) IsRunning() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.running
}
