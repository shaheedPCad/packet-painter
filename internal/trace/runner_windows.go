//go:build windows

package trace

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"packet-painter/internal/geo"
)

// windowsRunner implements Runner for Windows
type windowsRunner struct{}

// newPlatformRunner returns a new Windows runner
func newPlatformRunner() Runner {
	return &windowsRunner{}
}

// Run executes tracert and streams hop results
func (r *windowsRunner) Run(ctx context.Context, target string, geoLookup *geo.Lookup, onHop HopCallback, onComplete CompletedCallback, onError ErrorCallback) error {
	// Command: tracert -d <target>
	// -d: Do not resolve hostnames
	cmd := exec.CommandContext(ctx, "tracert", "-d", target)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start tracert: %w", err)
	}

	scanner := bufio.NewScanner(stdout)
	var destinationIP string
	var hopCount int

	for scanner.Scan() {
		select {
		case <-ctx.Done():
			cmd.Process.Kill()
			return ctx.Err()
		default:
		}

		line := scanner.Text()

		// Parse header line to get destination IP
		// Example: "Tracing route to google.com [142.250.80.46]"
		if strings.HasPrefix(line, "Tracing route to") {
			destinationIP = parseWindowsDestinationIP(line)
			continue
		}

		// Skip header lines and "Trace complete"
		if strings.HasPrefix(line, "over a maximum") ||
			strings.HasPrefix(line, "Trace complete") ||
			strings.TrimSpace(line) == "" {
			continue
		}

		// Parse hop line with geo lookup
		var geoLookupFunc GeoLookupFunc
		if geoLookup != nil {
			geoLookupFunc = geoLookup.GetLocation
		}
		hop := parseWindowsHopLine(line, destinationIP, geoLookupFunc)
		if hop != nil {
			hopCount++
			if onHop != nil {
				onHop(hop)
			}
		}
	}

	// Read any stderr output
	stderrScanner := bufio.NewScanner(stderr)
	var stderrOutput strings.Builder
	for stderrScanner.Scan() {
		stderrOutput.WriteString(stderrScanner.Text())
		stderrOutput.WriteString("\n")
	}

	if err := cmd.Wait(); err != nil {
		// Check if it was cancelled
		if ctx.Err() != nil {
			return ctx.Err()
		}
		// Include stderr in error message if available
		errMsg := err.Error()
		if stderrOutput.Len() > 0 {
			errMsg = fmt.Sprintf("%s: %s", errMsg, strings.TrimSpace(stderrOutput.String()))
		}
		return fmt.Errorf("tracert failed: %s", errMsg)
	}

	if onComplete != nil {
		onComplete(hopCount)
	}

	return nil
}
