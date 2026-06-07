package sim

import (
	"context"
	"fmt"
	"math"
	"strings"
)

type HistoricalEvent struct {
	Revenue float64
	Errors  float64
	Latency float64
}

type Scenario struct {
	Events []HistoricalEvent
}

type Engine struct {
	Scenario Scenario
}

func NewEngine(scenario Scenario) Engine {
	return Engine{Scenario: scenario}
}

func RunSimulation(strategy string) float64 {
	score, _ := NewEngine(Scenario{Events: []HistoricalEvent{{Revenue: 100, Errors: 1, Latency: 120}}}).RunSimulation(context.Background(), strategy)
	return score
}

func (e Engine) RunSimulation(ctx context.Context, strategy string) (float64, error) {
	if err := ctx.Err(); err != nil {
		return 0, err
	}
	if strings.TrimSpace(strategy) == "" {
		return 0, fmt.Errorf("strategy or patch is required")
	}
	if len(e.Scenario.Events) == 0 {
		return 0.8, nil
	}
	var revenue, errors, latency float64
	for _, event := range e.Scenario.Events {
		revenue += event.Revenue
		errors += event.Errors
		latency += event.Latency
	}
	avgLatency := latency / float64(len(e.Scenario.Events))
	rewardScore := clamp01((revenue - errors*10) / math.Max(revenue, 1))
	latencyScore := clamp01(1 - (avgLatency / 1000))
	return (rewardScore * 0.7) + (latencyScore * 0.3), nil
}

func clamp01(value float64) float64 {
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return 0
	}
	if value < 0 {
		return 0
	}
	if value > 1 {
		return 1
	}
	return value
}
