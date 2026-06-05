package routing

import "hash/fnv"

const (
	SegmentHighRTP        = "high_rtp_games"
	SegmentHighConversion = "high_conversion_games"
)

type Experiment struct {
	ID       string
	Variants []string
}

func Route(userID string) string {
	if hash(userID)%2 == 0 {
		return SegmentHighRTP
	}
	return SegmentHighConversion
}

func Assign(userID string, exp Experiment) string {
	if len(exp.Variants) == 0 {
		return ""
	}
	return exp.Variants[hash(exp.ID+":"+userID)%uint64(len(exp.Variants))]
}

func Bucket(userID string, buckets uint64) uint64 {
	if buckets == 0 {
		return 0
	}
	return hash(userID) % buckets
}

func hash(value string) uint64 {
	h := fnv.New64a()
	_, _ = h.Write([]byte(value))
	return h.Sum64()
}
