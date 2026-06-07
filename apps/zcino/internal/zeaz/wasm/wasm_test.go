package wasm_test

import (
	"context"
	"testing"

	"game-catalog-service/internal/zeaz/wasm"
)

func TestRegistryInvokesMeteredDeterministicRunner(t *testing.T) {
	registry := wasm.NewRegistry(wasm.DeterministicEchoRunner{})
	module, err := registry.Register([]byte("\x00asm"), wasm.Module{ID: "risk-filter", ABI: "zeaz/abi/v1", MaxFuel: 100})
	if err != nil {
		t.Fatal(err)
	}
	result, err := registry.Invoke(context.Background(), wasm.Invocation{ModuleID: module.ID, Function: "score", Input: []byte("task"), Fuel: 10})
	if err != nil {
		t.Fatal(err)
	}
	if !result.Deterministic || string(result.Output) != "task" || result.StateRoot == "" {
		t.Fatalf("unexpected wasm result: %+v", result)
	}
}
