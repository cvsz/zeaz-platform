package ranking

func Score(rtp float64, clicks int) float64 {
	if clicks < 0 {
		clicks = 0
	}
	return (rtp * 0.7) + (float64(clicks) * 0.3)
}
