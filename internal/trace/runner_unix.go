//go:build darwin || linux

package trace

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"strings"

	"packet-painter/internal/geo"
)

// unixRunner implements Runner for Linux and macOS
type unixRunner struct{}

// newPlatformRunner returns a new Unix runner
func newPlatformRunner() Runner {
	return &unixRunner{}
}

// Run executes traceroute and streams hop results
func (r *unixRunner) Run(ctx context.Context, target string, geoLookup *geo.Lookup, onHop HopCallback, onComplete CompletedCallback, onError ErrorCallback) error {
	// Command: traceroute -n -q 1 -w 1 -m 30 <target>
	// -n: No DNS lookup (just IPs)
	// -q 1: Single probe per hop
	// -w 1: 1 second timeout
	// -m 30: Max 30 hops
	cmd := exec.CommandContext(ctx, "traceroute", "-n", "-q", "1", "-w", "1", "-m", "30", target)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start traceroute: %w", err)
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
		if strings.HasPrefix(line, "traceroute to") {
			destinationIP = parseDestinationIP(line)
			continue
		}

		// Parse hop line with geo lookup
		var geoLookupFunc GeoLookupFunc
		if geoLookup != nil {
			geoLookupFunc = geoLookup.GetLocation
		}
		hop := parseUnixHopLine(line, destinationIP, geoLookupFunc)
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
		return fmt.Errorf("traceroute failed: %s", errMsg)
	}

	if onComplete != nil {
		onComplete(hopCount)
	}

	return nil
}
