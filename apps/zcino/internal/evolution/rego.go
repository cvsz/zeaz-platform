package evolution

import (
	"context"
	"fmt"
	"strings"

	"github.com/open-policy-agent/opa/rego"
)

type RegoEvaluator struct {
	allowQuery rego.PreparedEvalQuery
	denyQuery  rego.PreparedEvalQuery
}

func NewRegoEvaluatorFromFile(ctx context.Context, path string) (*RegoEvaluator, error) {
	allow, err := rego.New(
		rego.Query("data.zeaz.evolution.allow"),
		rego.Load([]string{path}, nil),
	).PrepareForEval(ctx)
	if err != nil {
		return nil, fmt.Errorf("prepare allow query: %w", err)
	}
	deny, err := rego.New(
		rego.Query("data.zeaz.evolution.deny"),
		rego.Load([]string{path}, nil),
	).PrepareForEval(ctx)
	if err != nil {
		return nil, fmt.Errorf("prepare deny query: %w", err)
	}
	return &RegoEvaluator{allowQuery: allow, denyQuery: deny}, nil
}

func NewRegoEvaluatorFromModule(ctx context.Context, name, module string) (*RegoEvaluator, error) {
	allow, err := rego.New(
		rego.Query("data.zeaz.evolution.allow"),
		rego.Module(name, module),
	).PrepareForEval(ctx)
	if err != nil {
		return nil, fmt.Errorf("prepare allow query: %w", err)
	}
	deny, err := rego.New(
		rego.Query("data.zeaz.evolution.deny"),
		rego.Module(name, module),
	).PrepareForEval(ctx)
	if err != nil {
		return nil, fmt.Errorf("prepare deny query: %w", err)
	}
	return &RegoEvaluator{allowQuery: allow, denyQuery: deny}, nil
}

func (e *RegoEvaluator) Evaluate(ctx context.Context, input RegoInput) Evaluation {
	rs, err := e.allowQuery.Eval(ctx, rego.EvalInput(input))
	if err != nil {
		return Evaluation{Reason: fmt.Sprintf("rego evaluation error: %v", err)}
	}
	if len(rs) > 0 {
		allowed, ok := rs[0].Expressions[0].Value.(bool)
		if ok && allowed {
			return Evaluation{Allowed: true, Reason: "rego policy allowed"}
		}
	}
	rs, err = e.denyQuery.Eval(ctx, rego.EvalInput(input))
	if err != nil {
		return Evaluation{Reason: fmt.Sprintf("rego deny evaluation error: %v", err)}
	}
	var reasons []string
	if len(rs) > 0 {
		values, ok := rs[0].Expressions[0].Value.([]interface{})
		if ok {
			for _, v := range values {
				reasons = append(reasons, fmt.Sprintf("%v", v))
			}
		}
	}
	if len(reasons) == 0 {
		return Evaluation{Reason: "denied by rego policy"}
	}
	return Evaluation{Reason: strings.Join(reasons, "; ")}
}
