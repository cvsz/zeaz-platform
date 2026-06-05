package routing

import "testing"

func TestRouteIsDeterministic(t *testing.T) {
	first := Route("user-123")
	for range 10 {
		if got := Route("user-123"); got != first {
			t.Fatalf("Route returned %q after %q", got, first)
		}
	}
}

func TestRouteOnlyReturnsKnownSegments(t *testing.T) {
	segment := Route("user-456")
	if segment != SegmentHighRTP && segment != SegmentHighConversion {
		t.Fatalf("unexpected segment %q", segment)
	}
}

func TestAssignIsDeterministicPerExperiment(t *testing.T) {
	exp := Experiment{ID: "homepage-ranking", Variants: []string{"control", "high_rtp", "high_conversion"}}
	first := Assign("user-123", exp)
	for range 10 {
		if got := Assign("user-123", exp); got != first {
			t.Fatalf("Assign returned %q after %q", got, first)
		}
	}
}

func TestAssignReturnsEmptyWhenNoVariantsExist(t *testing.T) {
	if got := Assign("user-123", Experiment{ID: "empty"}); got != "" {
		t.Fatalf("Assign = %q, want empty string", got)
	}
}

func TestBucketHandlesZeroBuckets(t *testing.T) {
	if got := Bucket("user-123", 0); got != 0 {
		t.Fatalf("Bucket = %d, want 0", got)
	}
}
