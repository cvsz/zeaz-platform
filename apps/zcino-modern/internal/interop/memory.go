package interop

// PartnerObservation stores cross-platform performance memory for routing and
// integration ROI analysis.
type PartnerObservation struct {
	PartnerID string
	LatencyMS int
	Cost      float64
	Revenue   float64
	Succeeded bool
}

// PartnerTrend summarizes reliability and economic efficiency for one partner.
type PartnerTrend struct {
	PartnerID    string
	Observations int
	SuccessRate  float64
	AvgLatencyMS float64
	ROI          float64
}

// SummarizePartner computes a deterministic trend from observed partner memory.
func SummarizePartner(partnerID string, observations []PartnerObservation) PartnerTrend {
	var count, successes, latency int
	var cost, revenue float64

	for _, obs := range observations {
		if obs.PartnerID != partnerID {
			continue
		}
		count++
		latency += obs.LatencyMS
		cost += obs.Cost
		revenue += obs.Revenue
		if obs.Succeeded {
			successes++
		}
	}

	trend := PartnerTrend{PartnerID: partnerID, Observations: count}
	if count == 0 {
		return trend
	}
	trend.SuccessRate = float64(successes) / float64(count)
	trend.AvgLatencyMS = float64(latency) / float64(count)
	if cost > 0 {
		trend.ROI = (revenue - cost) / cost
	}
	return trend
}
