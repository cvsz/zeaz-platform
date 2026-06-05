package interop

// SLA defines quality-of-service requirements expected from partner ecosystems.
type SLA struct {
	MaxLatencyMS   int
	MinSuccessRate float64
	MinAccuracy    float64
}

// CheckSLA returns true when observed partner quality satisfies all configured
// thresholds. Zero-value thresholds are treated as disabled checks.
func CheckSLA(latencyMS int, successRate float64, accuracy float64, sla SLA) bool {
	if sla.MaxLatencyMS > 0 && latencyMS > sla.MaxLatencyMS {
		return false
	}
	if sla.MinSuccessRate > 0 && successRate < sla.MinSuccessRate {
		return false
	}
	if sla.MinAccuracy > 0 && accuracy < sla.MinAccuracy {
		return false
	}
	return true
}

// UpdateReputation applies a bounded reputation delta after an SLA observation.
func UpdateReputation(current float64, passed bool) float64 {
	if passed {
		return clamp01(current + 0.02)
	}
	return clamp01(current - 0.10)
}

func clamp01(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 1 {
		return 1
	}
	return v
}
