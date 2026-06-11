package evolution

import (
	"context"
	"strings"
	"testing"
)

const testRegoModule = `package zeaz.evolution

default allow := false

allow if {
  count(deny) == 0
}

deny contains "risk exceeds maximum" if {
  input.risk > 0.7
}

deny contains "kill switch is active" if {
  input.metrics.kill_switch_active == true
}

deny contains "error rate exceeds guardrail" if {
  input.metrics.error_rate > input.guardrails.max_error_rate
}

deny contains "spend exceeds budget" if {
  input.metrics.budget_per_hour > 0
  input.metrics.spend_per_hour > input.metrics.budget_per_hour
}

deny contains "tenant id is required" if {
  not input.tenant_id
}

deny contains "cluster deletion is forbidden" if {
  input.type == "infra"
  input.change == "delete_cluster"
}

deny contains "direct production writes are forbidden" if {
  input.change == "direct_production_write"
}
`

func TestRegoEvaluatorAllowsValidProposal(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		TenantID:  "tenant-1",
		Risk:      0.3,
		Type:      "code",
		Change:    "refactor_module",
		Metrics:   RegoMetrics{KillSwitchActive: false, ErrorRate: 0.01, BudgetPerHour: 100, SpendPerHour: 30},
		Guardrails: RegoGuardrails{MaxErrorRate: 0.05, AllowDirectRiskyActions: false},
	}

	result := eval.Evaluate(context.Background(), input)
	if !result.Allowed {
		t.Fatalf("Evaluate() = %+v, want allowed", result)
	}
}

func TestRegoEvaluatorDeniesHighRisk(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		TenantID: "tenant-1",
		Risk:     0.9,
		Type:     "code",
		Change:   "refactor_module",
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied for high risk")
	}
	if !strings.Contains(result.Reason, "risk exceeds maximum") {
		t.Fatalf("reason = %q, want 'risk exceeds maximum'", result.Reason)
	}
}

func TestRegoEvaluatorDeniesKillSwitch(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		TenantID: "tenant-1",
		Risk:     0.3,
		Type:     "code",
		Change:   "refactor_module",
		Metrics:  RegoMetrics{KillSwitchActive: true},
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied for kill switch")
	}
	if !strings.Contains(result.Reason, "kill switch") {
		t.Fatalf("reason = %q, want 'kill switch'", result.Reason)
	}
}

func TestRegoEvaluatorDeniesErrorRateExceeded(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		TenantID:  "tenant-1",
		Risk:      0.3,
		Type:      "code",
		Change:    "refactor_module",
		Metrics:   RegoMetrics{ErrorRate: 0.1, SpendPerHour: 10, BudgetPerHour: 100},
		Guardrails: RegoGuardrails{MaxErrorRate: 0.05},
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied for error rate")
	}
}

func TestRegoEvaluatorDeniesBudgetExceeded(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		TenantID: "tenant-1",
		Risk:     0.3,
		Type:     "code",
		Change:   "refactor_module",
		Metrics:  RegoMetrics{BudgetPerHour: 100, SpendPerHour: 150},
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied for spend exceeds budget")
	}
	if !strings.Contains(result.Reason, "spend exceeds budget") {
		t.Fatalf("reason = %q, want 'spend exceeds budget'", result.Reason)
	}
}

func TestRegoEvaluatorDeniesMissingTenantID(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		Risk:  0.3,
		Type:  "code",
		Change: "refactor_module",
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied for missing tenant_id")
	}
	if !strings.Contains(result.Reason, "tenant id is required") {
		t.Fatalf("reason = %q, want 'tenant id is required'", result.Reason)
	}
}

func TestRegoEvaluatorDeniesForbiddenChanges(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	tests := []struct {
		name   string
		change string
		pType  string
	}{
		{"cluster deletion", "delete_cluster", "infra"},
		{"direct production write", "direct_production_write", "code"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := RegoInput{
				TenantID: "tenant-1",
				Risk:     0.3,
				Type:     tt.pType,
				Change:   tt.change,
			}
			result := eval.Evaluate(context.Background(), input)
			if result.Allowed {
				t.Fatal("Evaluate() = allowed, want denied")
			}
		})
	}
}

func TestRegoEvaluatorReportsMultipleDenyReasons(t *testing.T) {
	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	input := RegoInput{
		Risk:     0.9,
		Type:     "infra",
		Change:   "delete_cluster",
		Metrics:  RegoMetrics{KillSwitchActive: true},
	}

	result := eval.Evaluate(context.Background(), input)
	if result.Allowed {
		t.Fatal("Evaluate() = allowed, want denied with multiple reasons")
	}
	if !strings.Contains(result.Reason, "risk exceeds maximum") {
		t.Fatalf("reason missing 'risk exceeds maximum', got = %q", result.Reason)
	}
	if !strings.Contains(result.Reason, "kill switch") {
		t.Fatalf("reason missing 'kill switch', got = %q", result.Reason)
	}
	if !strings.Contains(result.Reason, "cluster deletion") {
		t.Fatalf("reason missing 'cluster deletion', got = %q", result.Reason)
	}
}

func TestRegoInputFromProposalMapsFields(t *testing.T) {
	p := Proposal{
		ID:     "p1",
		Risk:   0.5,
		Type:   ProposalTypeCode,
		Change: "scale_deployment",
		Metadata: map[string]string{
			"tenant_id":       "tenant-42",
			"country":         "US",
			"requested_action": "scale_up",
		},
	}

	input := RegoInputFromProposal(p)

	if input.TenantID != "tenant-42" {
		t.Fatalf("TenantID = %q, want 'tenant-42'", input.TenantID)
	}
	if input.Country != "US" {
		t.Fatalf("Country = %q, want 'US'", input.Country)
	}
	if input.RequestedAction != "scale_up" {
		t.Fatalf("RequestedAction = %q, want 'scale_up'", input.RequestedAction)
	}
	if input.Risk != 0.5 {
		t.Fatalf("Risk = %f, want 0.5", input.Risk)
	}
	if input.Type != ProposalTypeCode {
		t.Fatalf("Type = %q, want %q", input.Type, ProposalTypeCode)
	}
	if input.Change != "scale_deployment" {
		t.Fatalf("Change = %q, want 'scale_deployment'", input.Change)
	}
}

func TestRegoInputFromProposalHandlesNilMetadata(t *testing.T) {
	p := Proposal{
		ID:     "p1",
		Risk:   0.3,
		Type:   ProposalTypeCode,
		Change: "refactor",
	}

	input := RegoInputFromProposal(p)

	if input.Risk != 0.3 {
		t.Fatalf("Risk = %f, want 0.3", input.Risk)
	}
	if input.TenantID != "" {
		t.Fatalf("TenantID = %q, want empty", input.TenantID)
	}
}

func TestEngineWithRegoBlocksProposal(t *testing.T) {
	p := Proposal{
		ID: "p1", Type: ProposalTypeInfra, Description: "delete cluster",
		Risk: 0.3, Change: "delete_cluster",
		Metadata: map[string]string{"tenant_id": "tenant-1"},
	}

	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	engine := NewEngine(DefaultPolicy(), Budget{}, StaticPatchGenerator{Patch: GeneratePatch("safe")}, fakeSimulator{score: 0.9}, nil).
		WithRego(eval)

	result := engine.Process(context.Background(), p)
	if result.Success || result.Status != StatusRejected {
		t.Fatalf("result = %+v, want rejected", result)
	}
	if !strings.Contains(result.Reason, "cluster deletion") {
		t.Fatalf("reason = %q, want rego deny for cluster deletion", result.Reason)
	}
}

func TestEngineWithRegoAllowsValidProposal(t *testing.T) {
	p := Proposal{
		ID: "p1", Type: ProposalTypeCode, Description: "safe optimization",
		Risk: 0.3, Change: "optimize_queries", EstimatedCost: 5,
		Metadata: map[string]string{"tenant_id": "tenant-1"},
	}

	eval, err := NewRegoEvaluatorFromModule(context.Background(), "test.rego", testRegoModule)
	if err != nil {
		t.Fatalf("NewRegoEvaluatorFromModule() error = %v", err)
	}

	engine := NewEngine(DefaultPolicy(), Budget{HourlyLimit: 100, CurrentCost: 10}, StaticPatchGenerator{Patch: GeneratePatch("safe")}, fakeSimulator{score: 0.91}, nil).
		WithRego(eval)

	result := engine.Process(context.Background(), p)
	if !result.Success {
		t.Fatalf("result = %+v, want success", result)
	}
}
