package trace

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"packet-painter/internal/datacenter"
	"packet-painter/internal/geo"
)

// parseDestinationIP extracts the destination IP from the traceroute header line (Unix)
// Example: "traceroute to google.com (142.250.80.46), 30 hops max, 60 byte packets"
func parseDestinationIP(line string) string {
	re := regexp.MustCompile(`\(([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\)`)
	matches := re.FindStringSubmatch(line)
	if len(matches) >= 2 {
		return matches[1]
	}
	return ""
}

// GeoLookupFunc is a function type for looking up IP geolocation
type GeoLookupFunc func(ip string) *geo.Location

// parseUnixHopLine parses a single hop line from traceroute output
// Examples:
//
//	" 1  192.168.1.1  0.456 ms"
//	" 3  * * *"
//	" 5  10.0.0.1  5.1 ms  5.2 ms  5.3 ms"
func parseUnixHopLine(line string, destinationIP string, geoLookup GeoLookupFunc) *Hop {
	fields := strings.Fields(line)
	if len(fields) < 2 {
		return nil
	}

	// First field is hop number
	hopNum, err := strconv.Atoi(fields[0])
	if err != nil {
		return nil
	}

	// Check for timeout (all asterisks)
	isTimeout := true
	for _, f := range fields[1:] {
		if f != "*" {
			isTimeout = false
			break
		}
	}

	if isTimeout {
		return &Hop{
			HopNumber:     hopNum,
			IPAddress:     "*",
			RTT:           nil,
			AvgRTT:        0,
			Location:      nil,
			IsTimeout:     true,
			IsDestination: false,
			Timestamp:     time.Now().UnixMilli(),
		}
	}

	// Parse IP address (second field)
	ipAddress := fields[1]

	// Parse RTT values (look for numbers followed by "ms")
	var rttValues []float64
	for i := 2; i < len(fields); i++ {
		if fields[i] == "ms" && i > 2 {
			// Previous field should be the RTT value
			rtt, err := strconv.ParseFloat(fields[i-1], 64)
			if err == nil {
				rttValues = append(rttValues, rtt)
			}
		}
	}

	// Calculate average RTT
	var avgRTT float64
	if len(rttValues) > 0 {
		sum := 0.0
		for _, rtt := range rttValues {
			sum += rtt
		}
		avgRTT = sum / float64(len(rttValues))
	}

	// Look up geolocation if function provided
	var location *geo.Location
	if geoLookup != nil {
		location = geoLookup(ipAddress)
	}

	// Detect datacenter from ISP/Org info
	var dc *datacenter.DataCenter
	if location != nil {
		dc = datacenter.Detect(location.Org, location.ISP, "")
	}

	return &Hop{
		HopNumber:     hopNum,
		IPAddress:     ipAddress,
		RTT:           rttValues,
		AvgRTT:        avgRTT,
		Location:      location,
		DataCenter:    dc,
		IsTimeout:     false,
		IsDestination: ipAddress == destinationIP,
		Timestamp:     time.Now().UnixMilli(),
	}
}

// parseWindowsDestinationIP extracts the destination IP from the tracert header line
// Example: "Tracing route to google.com [142.250.80.46]"
func parseWindowsDestinationIP(line string) string {
	re := regexp.MustCompile(`\[([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\]`)
	matches := re.FindStringSubmatch(line)
	if len(matches) >= 2 {
		return matches[1]
	}
	return ""
}

// parseWindowsHopLine parses a single hop line from tracert output
// Examples:
//
//	"  1    <1 ms    <1 ms    <1 ms  192.168.1.1"
//	"  2     5 ms     4 ms     5 ms  10.0.0.1"
//	"  3     *        *        *     Request timed out."
func parseWindowsHopLine(line string, destinationIP string, geoLookup GeoLookupFunc) *Hop {
	line = strings.TrimSpace(line)
	if line == "" {
		return nil
	}

	// Check for timeout line
	if strings.Contains(line, "Request timed out") {
		// Extract hop number from the beginning
		fields := strings.Fields(line)
		if len(fields) < 1 {
			return nil
		}
		hopNum, err := strconv.Atoi(fields[0])
		if err != nil {
			return nil
		}
		return &Hop{
			HopNumber:     hopNum,
			IPAddress:     "*",
			RTT:           nil,
			AvgRTT:        0,
			Location:      nil,
			IsTimeout:     true,
			IsDestination: false,
			Timestamp:     time.Now().UnixMilli(),
		}
	}

	fields := strings.Fields(line)
	if len(fields) < 5 {
		return nil
	}

	// First field is hop number
	hopNum, err := strconv.Atoi(fields[0])
	if err != nil {
		return nil
	}

	// Parse RTT values (3 RTT columns before the IP)
	// Format: hopNum rtt1 ms rtt2 ms rtt3 ms IP
	// Or: hopNum <1 ms <1 ms <1 ms IP
	var rttValues []float64
	ipAddress := ""

	// Find the IP address (last field that looks like an IP)
	ipPattern := regexp.MustCompile(`^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$`)
	for i := len(fields) - 1; i >= 0; i-- {
		if ipPattern.MatchString(fields[i]) {
			ipAddress = fields[i]
			break
		}
	}

	if ipAddress == "" {
		return nil
	}

	// Parse RTT values between hop number and IP
	for i := 1; i < len(fields); i++ {
		field := fields[i]

		// Stop if we hit the IP address
		if field == ipAddress {
			break
		}

		// Skip "ms" markers
		if field == "ms" {
			continue
		}

		// Handle asterisk (timeout for this probe)
		if field == "*" {
			continue
		}

		// Handle "<1" as 0.5ms
		if field == "<1" {
			rttValues = append(rttValues, 0.5)
			continue
		}

		// Try to parse as a number
		rtt, err := strconv.ParseFloat(field, 64)
		if err == nil {
			rttValues = append(rttValues, rtt)
		}
	}

	// Calculate average RTT
	var avgRTT float64
	if len(rttValues) > 0 {
		sum := 0.0
		for _, rtt := range rttValues {
			sum += rtt
		}
		avgRTT = sum / float64(len(rttValues))
	}

	// Look up geolocation if function provided
	var location *geo.Location
	if geoLookup != nil {
		location = geoLookup(ipAddress)
	}

	// Detect datacenter from ISP/Org info
	var dc *datacenter.DataCenter
	if location != nil {
		dc = datacenter.Detect(location.Org, location.ISP, "")
	}

	return &Hop{
		HopNumber:     hopNum,
		IPAddress:     ipAddress,
		RTT:           rttValues,
		AvgRTT:        avgRTT,
		Location:      location,
		DataCenter:    dc,
		IsTimeout:     false,
		IsDestination: ipAddress == destinationIP,
		Timestamp:     time.Now().UnixMilli(),
	}
}
