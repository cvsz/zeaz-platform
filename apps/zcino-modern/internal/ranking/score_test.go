package ranking

import "testing"

func TestScoreBlendsRTPAndClicks(t *testing.T) {
	got := Score(96.5, 10)
	want := 70.55
	if got != want {
		t.Fatalf("expected score %.2f, got %.2f", want, got)
	}
}

func TestScoreClampsNegativeClicks(t *testing.T) {
	got := Score(100, -5)
	want := 70.0
	if got != want {
		t.Fatalf("expected score %.2f, got %.2f", want, got)
	}
}
