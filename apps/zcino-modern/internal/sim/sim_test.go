package sim

import (
	"context"
	"testing"
)

func TestRunSimulationScoresHistoricalEvents(t *testing.T) {
	engine := NewEngine(Scenario{Events: []HistoricalEvent{{Revenue: 100, Errors: 1, Latency: 100}, {Revenue: 200, Errors: 0, Latency: 200}}})
	score, err := engine.RunSimulation(context.Background(), "diff --git a/a.go b/a.go")

	if err != nil {
		t.Fatalf("RunSimulation() error = %v", err)
	}
	if score <= 0.8 || score > 1 {
		t.Fatalf("score = %v, want bounded high confidence score", score)
	}
}

func TestRunSimulationRejectsEmptyStrategy(t *testing.T) {
	_, err := NewEngine(Scenario{}).RunSimulation(context.Background(), " ")
	if err == nil {
		t.Fatal("empty strategy should fail")
	}
}
