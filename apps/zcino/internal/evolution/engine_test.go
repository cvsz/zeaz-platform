package evolution

import (
	"context"
	"errors"
	"strings"
	"testing"
)

type fakeSimulator struct {
	score float64
	err   error
}

func (f fakeSimulator) RunSimulation(context.Context, string) (float64, error) {
	return f.score, f.err
}

type recordingCanary struct {
	called bool
}

func (r *recordingCanary) DeployCanary(context.Context, string) error {
	r.called = true
	return nil
}

func TestEvaluateRejectsHighRiskProposal(t *testing.T) {
	proposal := Proposal{ID: "p1", Type: ProposalTypeCode, Description: "optimize ranking", Risk: 0.8}

	if Evaluate(proposal) {
		t.Fatal("high-risk proposal should be rejected")
	}
}

func TestPolicyRejectsForbiddenInfraChange(t *testing.T) {
	proposal := Proposal{ID: "p1", Type: ProposalTypeInfra, Description: "remove cluster", Risk: 0.2, Change: "delete_cluster"}
	result := NewPolicyEngine(DefaultPolicy()).Evaluate(proposal)

	if result.Allowed {
		t.Fatal("forbidden infra change should be denied")
	}
	if !strings.Contains(result.Reason, "forbidden") {
		t.Fatalf("reason = %q, want forbidden policy reason", result.Reason)
	}
}

func TestEconomicControllerBlocksBudgetOverrun(t *testing.T) {
	controller := NewEconomicController(Budget{HourlyLimit: 100, CurrentCost: 80})
	result := controller.Evaluate(Proposal{EstimatedCost: 25})

	if result.Allowed {
		t.Fatal("proposal should be blocked when estimated cost exceeds remaining budget")
	}
}

func TestValidatePatchRejectsDangerousOperations(t *testing.T) {
	patch := `diff --git a/internal/example.go b/internal/example.go
--- a/internal/example.go
+++ b/internal/example.go
@@ -0,0 +1,6 @@
+package internal
+
+import "os"
+
+func write() { _ = os.WriteFile("/tmp/x", []byte("x"), 0600) }
+`

	if err := ValidatePatch(patch); err == nil {
		t.Fatal("dangerous patch should fail validation")
	}
}

func TestValidatePatchAcceptsSafeGoPatch(t *testing.T) {
	patch := GeneratePatch("increase score threshold")

	if err := ValidatePatch(patch); err != nil {
		t.Fatalf("ValidatePatch() error = %v", err)
	}
}

func TestEngineProcessRunsValidationSimulationAndCanary(t *testing.T) {
	canary := &recordingCanary{}
	engine := NewEngine(DefaultPolicy(), Budget{HourlyLimit: 100, CurrentCost: 10}, StaticPatchGenerator{Patch: GeneratePatch("safe change")}, fakeSimulator{score: 0.91}, canary)
	proposal := Proposal{ID: "p1", Type: ProposalTypeCode, Description: "safe change", Risk: 0.2, EstimatedCost: 5}

	result := engine.Process(context.Background(), proposal)

	if !result.Success || result.Status != StatusCanary {
		t.Fatalf("result = %+v, want canary success", result)
	}
	if !canary.called {
		t.Fatal("canary deployer was not called")
	}
}

func TestEngineProcessRejectsLowSimulationScore(t *testing.T) {
	canary := &recordingCanary{}
	engine := NewEngine(DefaultPolicy(), Budget{}, StaticPatchGenerator{Patch: GeneratePatch("safe change")}, fakeSimulator{score: 0.4}, canary)
	proposal := Proposal{ID: "p1", Type: ProposalTypeCode, Description: "safe change", Risk: 0.2}

	result := engine.Process(context.Background(), proposal)

	if result.Success || result.Status != StatusRejected {
		t.Fatalf("result = %+v, want rejection", result)
	}
	if canary.called {
		t.Fatal("canary should not run after low simulation score")
	}
}

func TestEngineProcessReturnsSimulationError(t *testing.T) {
	engine := NewEngine(DefaultPolicy(), Budget{}, StaticPatchGenerator{Patch: GeneratePatch("safe change")}, fakeSimulator{err: errors.New("sandbox unavailable")}, nil)
	proposal := Proposal{ID: "p1", Type: ProposalTypeCode, Description: "safe change", Risk: 0.2}

	result := engine.Process(context.Background(), proposal)

	if result.Success {
		t.Fatal("simulation error should reject the proposal")
	}
	if !strings.Contains(result.Reason, "sandbox unavailable") {
		t.Fatalf("reason = %q, want simulator error", result.Reason)
	}
}

func TestRewardSubtractsCostAndErrorPenalty(t *testing.T) {
	reward := Reward(100, 25, 3)

	if reward != 60 {
		t.Fatalf("Reward() = %v, want 60", reward)
	}
}
