package evolution

import (
	"context"
	"fmt"
	"time"
)

type Simulator interface {
	RunSimulation(context.Context, string) (float64, error)
}

type CanaryDeployer interface {
	DeployCanary(context.Context, string) error
}

type NoopCanaryDeployer struct{}

func (NoopCanaryDeployer) DeployCanary(context.Context, string) error { return nil }

type Engine struct {
	Policy          PolicyEngine
	Economics       EconomicController
	PatchGenerator  PatchGenerator
	PatchValidator  PatchValidator
	Simulator       Simulator
	Canary          CanaryDeployer
	Rego            *RegoEvaluator
	MinScore        float64
	RequireApproval bool
}

func (e Engine) WithRego(re *RegoEvaluator) Engine {
	e.Rego = re
	return e
}

func NewEngine(policy Policy, budget Budget, generator PatchGenerator, simulator Simulator, canary CanaryDeployer) Engine {
	if generator == nil {
		generator = StaticPatchGenerator{Patch: GeneratePatch("safe bounded improvement")}
	}
	if canary == nil {
		canary = NoopCanaryDeployer{}
	}
	return Engine{
		Policy:         NewPolicyEngine(policy),
		Economics:      NewEconomicController(budget),
		PatchGenerator: generator,
		PatchValidator: PatchValidator{MaxBytes: 64 * 1024},
		Simulator:      simulator,
		Canary:         canary,
		MinScore:       0.8,
	}
}

func (e Engine) Process(ctx context.Context, p Proposal) Result {
	started := time.Now().UTC()
	finish := func(status string, success bool, score float64, reason string) Result {
		return Result{ProposalID: p.ID, Status: status, Success: success, Score: score, Reason: reason, StartedAt: started, FinishedAt: time.Now().UTC()}
	}

	if evaluation := e.Policy.Evaluate(p); !evaluation.Allowed {
		return finish(StatusRejected, false, 0, evaluation.Reason)
	}
	if evaluation := e.Economics.Evaluate(p); !evaluation.Allowed {
		return finish(StatusRejected, false, 0, evaluation.Reason)
	}
	if e.Rego != nil {
		regoInput := RegoInputFromProposal(p)
		if ev := e.Rego.Evaluate(ctx, regoInput); !ev.Allowed {
			return finish(StatusRejected, false, 0, ev.Reason)
		}
	}
	if e.RequireApproval {
		return finish(StatusValidated, true, 0, "proposal requires human approval before mutation")
	}

	patch, err := e.PatchGenerator.GeneratePatch(p)
	if err != nil {
		return finish(StatusRejected, false, 0, fmt.Sprintf("generate patch: %v", err))
	}
	if err := e.PatchValidator.ValidatePatch(patch); err != nil {
		return finish(StatusRejected, false, 0, fmt.Sprintf("validate patch: %v", err))
	}
	if e.Simulator == nil {
		return finish(StatusValidated, true, 0, "patch validated; no simulator configured")
	}
	score, err := e.Simulator.RunSimulation(ctx, patch)
	if err != nil {
		return finish(StatusRejected, false, 0, fmt.Sprintf("simulation failed: %v", err))
	}
	minScore := e.MinScore
	if minScore <= 0 {
		minScore = 0.8
	}
	if score < minScore {
		return finish(StatusRejected, false, score, fmt.Sprintf("simulation score %.2f below threshold %.2f", score, minScore))
	}
	if err := e.Canary.DeployCanary(ctx, patch); err != nil {
		return finish(StatusRejected, false, score, fmt.Sprintf("canary failed: %v", err))
	}
	return finish(StatusCanary, true, score, "patch passed validation and entered canary")
}
