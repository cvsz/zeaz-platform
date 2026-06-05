package brain

import (
	"math"
	"testing"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
)

func TestDecideAppliesKillSwitchBeforeOtherActions(t *testing.T) {
	decision := Decide(Metrics{KillSwitchActive: true, LatencyMillis: 900})

	if decision.Action != ActionKillSwitch {
		t.Fatalf("action = %q, want %q", decision.Action, ActionKillSwitch)
	}
	if !decision.Risky {
		t.Fatal("kill switch decisions must be marked risky")
	}
}

func TestDecideBlocksOptimizationWhenBudgetExceeded(t *testing.T) {
	decision := Decide(Metrics{CTR: 0.01, SpendPerHour: 101, BudgetPerHour: 100})

	if decision.Action != ActionNoop {
		t.Fatalf("action = %q, want %q", decision.Action, ActionNoop)
	}
}

func TestDecideTriggersRollbackBeforeScaleUp(t *testing.T) {
	decision := Decide(Metrics{LatencyMillis: 900, ErrorRate: 0.08})

	if decision.Action != ActionRollback {
		t.Fatalf("action = %q, want %q", decision.Action, ActionRollback)
	}
	if !decision.Risky {
		t.Fatal("rollback decisions must be marked risky")
	}
}

func TestDecideAllowsDirectRiskyActionsWhenGuardrailIsExplicit(t *testing.T) {
	engine := NewEngine(Guardrails{MaxErrorRate: 0.05, AllowDirectRiskyActions: true})
	decision := engine.Decide(Metrics{ErrorRate: 0.08})

	if decision.Action != ActionRollback {
		t.Fatalf("action = %q, want %q", decision.Action, ActionRollback)
	}
	if decision.Risky {
		t.Fatal("risky marker should be disabled when direct risky actions are allowed")
	}
}

func TestDecideClampsScaleUpValue(t *testing.T) {
	engine := NewEngine(Guardrails{MaxLatencyMillis: 100, MaxScaleFactor: 2})
	decision := engine.Decide(Metrics{LatencyMillis: 1000})

	if decision.Action != ActionScaleUp {
		t.Fatalf("action = %q, want %q", decision.Action, ActionScaleUp)
	}
	if decision.Value != 2 {
		t.Fatalf("value = %v, want 2", decision.Value)
	}
}

func TestDecideBoostsHighRTPWhenCTRIsLow(t *testing.T) {
	decision := Decide(Metrics{CTR: 0.01})

	if decision.Action != ActionBoostHighRTP {
		t.Fatalf("action = %q, want %q", decision.Action, ActionBoostHighRTP)
	}
	if decision.Value != DefaultGuardrails().MaxBoostMultiplier {
		t.Fatalf("value = %v, want %v", decision.Value, DefaultGuardrails().MaxBoostMultiplier)
	}
}

func TestScoreNormalizesWeightsAndClampsInputs(t *testing.T) {
	game := domain.Game{ID: uuid.New(), RTP: 97}
	score := Score(game, GameMetrics{CTR: 1.4, Conversion: 0.5, AffiliatePayout: -1}, ScoreWeights{CTR: 2, Conversion: 1, RTP: 1})

	want := 0.5 + 0.125 + 0.2425
	if math.Abs(score-want) > 0.0000001 {
		t.Fatalf("score = %v, want %v", score, want)
	}
}

func TestIsRiskyAction(t *testing.T) {
	if !IsRiskyAction(ActionRollback) {
		t.Fatal("rollback should be risky")
	}
	if IsRiskyAction(ActionBoostHighRTP) {
		t.Fatal("ranking boost should stay non-risky")
	}
}
