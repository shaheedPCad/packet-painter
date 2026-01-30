package trace

import (
	"testing"
)

func TestParseDestinationIP(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "standard header",
			input:    "traceroute to google.com (142.250.80.46), 30 hops max, 60 byte packets",
			expected: "142.250.80.46",
		},
		{
			name:     "header with IP only",
			input:    "traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets",
			expected: "8.8.8.8",
		},
		{
			name:     "no IP in header",
			input:    "some other line",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseDestinationIP(tt.input)
			if result != tt.expected {
				t.Errorf("parseDestinationIP(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestParseUnixHopLine(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		destinationIP string
		expected      *Hop
	}{
		{
			name:          "normal hop with single RTT",
			input:         " 1  192.168.1.1  0.456 ms",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     1,
				IPAddress:     "192.168.1.1",
				RTT:           []float64{0.456},
				AvgRTT:        0.456,
				IsTimeout:     false,
				IsDestination: false,
			},
		},
		{
			name:          "timeout hop",
			input:         " 3  * * *",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     3,
				IPAddress:     "*",
				RTT:           nil,
				AvgRTT:        0,
				IsTimeout:     true,
				IsDestination: false,
			},
		},
		{
			name:          "hop with multiple RTT values",
			input:         " 5  10.0.0.1  5.1 ms  5.2 ms  5.3 ms",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     5,
				IPAddress:     "10.0.0.1",
				RTT:           []float64{5.1, 5.2, 5.3},
				AvgRTT:        5.2,
				IsTimeout:     false,
				IsDestination: false,
			},
		},
		{
			name:          "destination hop",
			input:         " 4  72.14.215.85  15.678 ms",
			destinationIP: "72.14.215.85",
			expected: &Hop{
				HopNumber:     4,
				IPAddress:     "72.14.215.85",
				RTT:           []float64{15.678},
				AvgRTT:        15.678,
				IsTimeout:     false,
				IsDestination: true,
			},
		},
		{
			name:          "empty line",
			input:         "",
			destinationIP: "8.8.8.8",
			expected:      nil,
		},
		{
			name:          "invalid line",
			input:         "some random text",
			destinationIP: "8.8.8.8",
			expected:      nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseUnixHopLine(tt.input, tt.destinationIP)

			if tt.expected == nil {
				if result != nil {
					t.Errorf("parseUnixHopLine(%q) = %+v, want nil", tt.input, result)
				}
				return
			}

			if result == nil {
				t.Errorf("parseUnixHopLine(%q) = nil, want %+v", tt.input, tt.expected)
				return
			}

			if result.HopNumber != tt.expected.HopNumber {
				t.Errorf("HopNumber = %d, want %d", result.HopNumber, tt.expected.HopNumber)
			}
			if result.IPAddress != tt.expected.IPAddress {
				t.Errorf("IPAddress = %s, want %s", result.IPAddress, tt.expected.IPAddress)
			}
			if result.IsTimeout != tt.expected.IsTimeout {
				t.Errorf("IsTimeout = %v, want %v", result.IsTimeout, tt.expected.IsTimeout)
			}
			if result.IsDestination != tt.expected.IsDestination {
				t.Errorf("IsDestination = %v, want %v", result.IsDestination, tt.expected.IsDestination)
			}
			if len(result.RTT) != len(tt.expected.RTT) {
				t.Errorf("RTT length = %d, want %d", len(result.RTT), len(tt.expected.RTT))
			} else {
				for i, rtt := range result.RTT {
					if rtt != tt.expected.RTT[i] {
						t.Errorf("RTT[%d] = %f, want %f", i, rtt, tt.expected.RTT[i])
					}
				}
			}
			// Allow small floating point differences for AvgRTT
			if diff := result.AvgRTT - tt.expected.AvgRTT; diff > 0.001 || diff < -0.001 {
				t.Errorf("AvgRTT = %f, want %f", result.AvgRTT, tt.expected.AvgRTT)
			}
		})
	}
}

func TestParseWindowsDestinationIP(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "standard header",
			input:    "Tracing route to google.com [142.250.80.46]",
			expected: "142.250.80.46",
		},
		{
			name:     "header with IP only",
			input:    "Tracing route to 8.8.8.8 [8.8.8.8]",
			expected: "8.8.8.8",
		},
		{
			name:     "no IP in header",
			input:    "some other line",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseWindowsDestinationIP(tt.input)
			if result != tt.expected {
				t.Errorf("parseWindowsDestinationIP(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestParseWindowsHopLine(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		destinationIP string
		expected      *Hop
	}{
		{
			name:          "normal hop with milliseconds",
			input:         "  1     5 ms     4 ms     5 ms  192.168.1.1",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     1,
				IPAddress:     "192.168.1.1",
				RTT:           []float64{5, 4, 5},
				AvgRTT:        4.666666666666667,
				IsTimeout:     false,
				IsDestination: false,
			},
		},
		{
			name:          "sub-millisecond hop",
			input:         "  1    <1 ms    <1 ms    <1 ms  192.168.1.1",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     1,
				IPAddress:     "192.168.1.1",
				RTT:           []float64{0.5, 0.5, 0.5},
				AvgRTT:        0.5,
				IsTimeout:     false,
				IsDestination: false,
			},
		},
		{
			name:          "timeout hop",
			input:         "  3     *        *        *     Request timed out.",
			destinationIP: "8.8.8.8",
			expected: &Hop{
				HopNumber:     3,
				IPAddress:     "*",
				RTT:           nil,
				AvgRTT:        0,
				IsTimeout:     true,
				IsDestination: false,
			},
		},
		{
			name:          "destination hop",
			input:         "  4    15 ms    14 ms    16 ms  72.14.215.85",
			destinationIP: "72.14.215.85",
			expected: &Hop{
				HopNumber:     4,
				IPAddress:     "72.14.215.85",
				RTT:           []float64{15, 14, 16},
				AvgRTT:        15,
				IsTimeout:     false,
				IsDestination: true,
			},
		},
		{
			name:          "empty line",
			input:         "",
			destinationIP: "8.8.8.8",
			expected:      nil,
		},
		{
			name:          "trace complete line",
			input:         "Trace complete.",
			destinationIP: "8.8.8.8",
			expected:      nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseWindowsHopLine(tt.input, tt.destinationIP)

			if tt.expected == nil {
				if result != nil {
					t.Errorf("parseWindowsHopLine(%q) = %+v, want nil", tt.input, result)
				}
				return
			}

			if result == nil {
				t.Errorf("parseWindowsHopLine(%q) = nil, want %+v", tt.input, tt.expected)
				return
			}

			if result.HopNumber != tt.expected.HopNumber {
				t.Errorf("HopNumber = %d, want %d", result.HopNumber, tt.expected.HopNumber)
			}
			if result.IPAddress != tt.expected.IPAddress {
				t.Errorf("IPAddress = %s, want %s", result.IPAddress, tt.expected.IPAddress)
			}
			if result.IsTimeout != tt.expected.IsTimeout {
				t.Errorf("IsTimeout = %v, want %v", result.IsTimeout, tt.expected.IsTimeout)
			}
			if result.IsDestination != tt.expected.IsDestination {
				t.Errorf("IsDestination = %v, want %v", result.IsDestination, tt.expected.IsDestination)
			}
			if len(result.RTT) != len(tt.expected.RTT) {
				t.Errorf("RTT length = %d, want %d", len(result.RTT), len(tt.expected.RTT))
			} else {
				for i, rtt := range result.RTT {
					if rtt != tt.expected.RTT[i] {
						t.Errorf("RTT[%d] = %f, want %f", i, rtt, tt.expected.RTT[i])
					}
				}
			}
			// Allow small floating point differences for AvgRTT
			if diff := result.AvgRTT - tt.expected.AvgRTT; diff > 0.001 || diff < -0.001 {
				t.Errorf("AvgRTT = %f, want %f", result.AvgRTT, tt.expected.AvgRTT)
			}
		})
	}
}

// Integration test with full output
func TestParseUnixFullOutput(t *testing.T) {
	output := `traceroute to google.com (142.250.80.46), 30 hops max, 60 byte packets
 1  192.168.1.1  0.456 ms
 2  10.0.0.1  5.234 ms
 3  * * *
 4  72.14.215.85  15.678 ms`

	destinationIP := parseDestinationIP("traceroute to google.com (142.250.80.46), 30 hops max, 60 byte packets")
	if destinationIP != "142.250.80.46" {
		t.Errorf("Failed to parse destination IP from header")
	}

	lines := []string{
		" 1  192.168.1.1  0.456 ms",
		" 2  10.0.0.1  5.234 ms",
		" 3  * * *",
		" 4  72.14.215.85  15.678 ms",
	}

	expectedHops := []struct {
		hopNum        int
		ip            string
		isTimeout     bool
		isDestination bool
	}{
		{1, "192.168.1.1", false, false},
		{2, "10.0.0.1", false, false},
		{3, "*", true, false},
		{4, "72.14.215.85", false, false}, // Not destination since we're using different dest IP
	}

	_ = output // Just to show the full output format

	for i, line := range lines {
		hop := parseUnixHopLine(line, "8.8.8.8") // Using different dest for this test
		if hop == nil {
			t.Errorf("Failed to parse line %d: %q", i, line)
			continue
		}
		if hop.HopNumber != expectedHops[i].hopNum {
			t.Errorf("Line %d: HopNumber = %d, want %d", i, hop.HopNumber, expectedHops[i].hopNum)
		}
		if hop.IPAddress != expectedHops[i].ip {
			t.Errorf("Line %d: IPAddress = %s, want %s", i, hop.IPAddress, expectedHops[i].ip)
		}
		if hop.IsTimeout != expectedHops[i].isTimeout {
			t.Errorf("Line %d: IsTimeout = %v, want %v", i, hop.IsTimeout, expectedHops[i].isTimeout)
		}
	}
}

func TestParseWindowsFullOutput(t *testing.T) {
	lines := []string{
		"  1    <1 ms    <1 ms    <1 ms  192.168.1.1",
		"  2     5 ms     4 ms     5 ms  10.0.0.1",
		"  3     *        *        *     Request timed out.",
		"  4    15 ms    14 ms    16 ms  72.14.215.85",
	}

	expectedHops := []struct {
		hopNum        int
		ip            string
		isTimeout     bool
		isDestination bool
		rttCount      int
	}{
		{1, "192.168.1.1", false, false, 3},
		{2, "10.0.0.1", false, false, 3},
		{3, "*", true, false, 0},
		{4, "72.14.215.85", false, true, 3},
	}

	for i, line := range lines {
		hop := parseWindowsHopLine(line, "72.14.215.85")
		if hop == nil {
			t.Errorf("Failed to parse line %d: %q", i, line)
			continue
		}
		if hop.HopNumber != expectedHops[i].hopNum {
			t.Errorf("Line %d: HopNumber = %d, want %d", i, hop.HopNumber, expectedHops[i].hopNum)
		}
		if hop.IPAddress != expectedHops[i].ip {
			t.Errorf("Line %d: IPAddress = %s, want %s", i, hop.IPAddress, expectedHops[i].ip)
		}
		if hop.IsTimeout != expectedHops[i].isTimeout {
			t.Errorf("Line %d: IsTimeout = %v, want %v", i, hop.IsTimeout, expectedHops[i].isTimeout)
		}
		if hop.IsDestination != expectedHops[i].isDestination {
			t.Errorf("Line %d: IsDestination = %v, want %v", i, hop.IsDestination, expectedHops[i].isDestination)
		}
		if len(hop.RTT) != expectedHops[i].rttCount {
			t.Errorf("Line %d: RTT count = %d, want %d", i, len(hop.RTT), expectedHops[i].rttCount)
		}
	}
}
