package main

import (
	"context"
	"sync"
	"time"

	"packet-painter/internal/cables"
	"packet-painter/internal/trace"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx          context.Context
	session      *trace.Session
	mu           sync.Mutex
	cableService *cables.Service
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		cableService: cables.NewService(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// StartTrace begins a new traceroute to the specified target
func (a *App) StartTrace(target string) string {
	a.mu.Lock()
	defer a.mu.Unlock()

	// Cancel any existing session
	if a.session != nil && a.session.IsRunning() {
		a.session.Cancel()
	}

	// Create new session
	a.session = trace.NewSession(target)
	sessionID := a.session.ID
	source := a.session.GetSource()

	// Emit trace started event
	runtime.EventsEmit(a.ctx, "trace:started", trace.TraceStartedEvent{
		SessionID: sessionID,
		Target:    target,
		Source:    source,
		Timestamp: time.Now().UnixMilli(),
	})

	// Create context with 20-second timeout
	traceCtx, _ := context.WithTimeout(a.ctx, 20*time.Second)

	// Start the trace with callbacks
	a.session.Start(traceCtx,
		// On hop callback
		func(hop *trace.Hop) {
			// Log hop for debugging
			println("Hop received:", hop.HopNumber, hop.IPAddress)
			runtime.EventsEmit(a.ctx, "trace:hop", trace.TraceHopEvent{
				SessionID: sessionID,
				Hop:       hop,
			})
		},
		// On complete callback
		func(totalHops int) {
			println("Trace completed:", totalHops, "hops")
			runtime.EventsEmit(a.ctx, "trace:completed", trace.TraceCompletedEvent{
				SessionID: sessionID,
				TotalHops: totalHops,
				Timestamp: time.Now().UnixMilli(),
			})
		},
		// On error callback
		func(err error) {
			println("Trace error:", err.Error())
			runtime.EventsEmit(a.ctx, "trace:error", trace.TraceErrorEvent{
				SessionID: sessionID,
				Error:     err.Error(),
				Timestamp: time.Now().UnixMilli(),
			})
		},
	)

	return sessionID
}

// CancelTrace stops the current traceroute
func (a *App) CancelTrace() {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.session != nil && a.session.IsRunning() {
		sessionID := a.session.ID
		a.session.Cancel()

		runtime.EventsEmit(a.ctx, "trace:cancelled", trace.TraceCancelledEvent{
			SessionID: sessionID,
			Timestamp: time.Now().UnixMilli(),
		})
	}
}

// GetTraceStatus returns whether a trace is currently running
func (a *App) GetTraceStatus() bool {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.session == nil {
		return false
	}
	return a.session.IsRunning()
}

// GetSubmarineCables fetches submarine cable data from TeleGeography API
func (a *App) GetSubmarineCables() ([]cables.Cable, error) {
	return a.cableService.FetchCables()
}
