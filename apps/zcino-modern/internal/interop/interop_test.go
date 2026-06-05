package interop

import (
	"crypto/ed25519"
	"testing"
)

func TestVerifySignature(t *testing.T) {
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	msg := []byte("task:123")
	sig := ed25519.Sign(priv, msg)

	if !VerifySignature(msg, sig, pub) {
		t.Fatal("expected valid signature")
	}
	if VerifySignature([]byte("tampered"), sig, pub) {
		t.Fatal("expected tampered message to fail")
	}
	if VerifySignature(msg, sig, []byte("bad-key")) {
		t.Fatal("expected invalid key size to fail")
	}
}

func TestNormalizeResponse(t *testing.T) {
	resp, err := NormalizeResponse(map[string]any{
		"accepted": true,
		"score":    0.87,
		"reason":   "capacity available",
	})
	if err != nil {
		t.Fatalf("normalize response: %v", err)
	}
	if !resp.Accepted || resp.Score != 0.87 || resp.Reason != "capacity available" {
		t.Fatalf("unexpected response: %+v", resp)
	}

	if _, err := NormalizeResponse(map[string]any{"score": "high"}); err == nil {
		t.Fatal("expected invalid score type to fail")
	}
}

func TestRouteTaskAppliesGuardrails(t *testing.T) {
	partners := []Org{
		{ID: "blacklisted", Reputation: 0.99},
		{ID: "unstable", Reputation: 0.98, FailureRate: 0.30},
		{ID: "partner-b", Reputation: 0.80, FailureRate: 0.01},
		{ID: "partner-a", Reputation: 0.80, FailureRate: 0.01},
	}

	selected, err := RouteTask(Task{ID: "task-1", Budget: 50}, partners, Guardrails{
		MaxExternalSpend: 100,
		Blacklist:        map[string]bool{"blacklisted": true},
		FailureThreshold: 0.20,
	})
	if err != nil {
		t.Fatalf("route task: %v", err)
	}
	if selected.ID != "partner-a" {
		t.Fatalf("expected deterministic highest eligible partner-a, got %s", selected.ID)
	}
}

func TestRouteTaskFallsBackToInternalWhenExternalOverBudget(t *testing.T) {
	partners := []Org{
		{ID: "external", Reputation: 1.0},
		{ID: "internal", Reputation: 0.5, InternalOnly: true},
	}

	selected, err := RouteTask(Task{ID: "task-1", Budget: 500}, partners, Guardrails{
		MaxExternalSpend: 100,
		AllowInternal:    true,
	})
	if err != nil {
		t.Fatalf("route task: %v", err)
	}
	if selected.ID != "internal" {
		t.Fatalf("expected internal fallback, got %s", selected.ID)
	}
}

func TestSLAAndReputation(t *testing.T) {
	sla := SLA{MaxLatencyMS: 300, MinSuccessRate: 0.95, MinAccuracy: 0.90}
	if !CheckSLA(250, 0.99, 0.95, sla) {
		t.Fatal("expected SLA to pass")
	}
	if CheckSLA(350, 0.99, 0.95, sla) {
		t.Fatal("expected latency breach to fail")
	}
	if got := UpdateReputation(0.95, true); got != 0.97 {
		t.Fatalf("expected reputation increase to 0.97, got %.2f", got)
	}
	if got := UpdateReputation(0.05, false); got != 0 {
		t.Fatalf("expected reputation clamp to 0, got %.2f", got)
	}
}

func TestSummarizePartner(t *testing.T) {
	trend := SummarizePartner("partner-a", []PartnerObservation{
		{PartnerID: "partner-a", LatencyMS: 100, Cost: 10, Revenue: 15, Succeeded: true},
		{PartnerID: "partner-a", LatencyMS: 300, Cost: 10, Revenue: 5, Succeeded: false},
		{PartnerID: "partner-b", LatencyMS: 10, Cost: 1, Revenue: 2, Succeeded: true},
	})

	if trend.Observations != 2 || trend.SuccessRate != 0.5 || trend.AvgLatencyMS != 200 || trend.ROI != 0 {
		t.Fatalf("unexpected trend: %+v", trend)
	}
}
