package wasm

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

type Module struct {
	ID          string            `json:"id"`
	CodeHash    string            `json:"code_hash"`
	ABI         string            `json:"abi"`
	MaxFuel     uint64            `json:"max_fuel"`
	Permissions []string          `json:"permissions,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type Invocation struct {
	ModuleID string            `json:"module_id"`
	Function string            `json:"function"`
	Input    []byte            `json:"input,omitempty"`
	Fuel     uint64            `json:"fuel"`
	Env      map[string]string `json:"env,omitempty"`
}

type Result struct {
	ModuleID      string    `json:"module_id"`
	Function      string    `json:"function"`
	Output        []byte    `json:"output,omitempty"`
	FuelUsed      uint64    `json:"fuel_used"`
	Deterministic bool      `json:"deterministic"`
	StateRoot     string    `json:"state_root"`
	CompletedAt   time.Time `json:"completed_at"`
}

type Runner interface {
	Run(ctx context.Context, module Module, invocation Invocation) (Result, error)
}

type Registry struct {
	mu      sync.RWMutex
	modules map[string]Module
	runner  Runner
}

func NewRegistry(runner Runner) *Registry {
	return &Registry{modules: map[string]Module{}, runner: runner}
}

func (r *Registry) Register(code []byte, module Module) (Module, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if module.ID == "" || module.ABI == "" {
		return Module{}, fmt.Errorf("module id and abi are required")
	}
	if len(code) == 0 && module.CodeHash == "" {
		return Module{}, fmt.Errorf("wasm code or code hash is required")
	}
	if module.CodeHash == "" {
		sum := sha256.Sum256(code)
		module.CodeHash = hex.EncodeToString(sum[:])
	}
	if module.MaxFuel == 0 {
		module.MaxFuel = 10_000_000
	}
	r.modules[module.ID] = module
	return module, nil
}

func (r *Registry) Invoke(ctx context.Context, invocation Invocation) (Result, error) {
	r.mu.RLock()
	module, ok := r.modules[invocation.ModuleID]
	runner := r.runner
	r.mu.RUnlock()
	if !ok {
		return Result{}, fmt.Errorf("unknown wasm module %q", invocation.ModuleID)
	}
	if runner == nil {
		return Result{}, fmt.Errorf("wasm runner is not configured")
	}
	if invocation.Function == "" {
		return Result{}, fmt.Errorf("function is required")
	}
	if invocation.Fuel == 0 || invocation.Fuel > module.MaxFuel {
		return Result{}, fmt.Errorf("invocation fuel %d exceeds module limit %d", invocation.Fuel, module.MaxFuel)
	}
	return runner.Run(ctx, module, invocation)
}

type DeterministicEchoRunner struct{}

func (DeterministicEchoRunner) Run(ctx context.Context, module Module, invocation Invocation) (Result, error) {
	select {
	case <-ctx.Done():
		return Result{}, ctx.Err()
	default:
	}
	state := sha256.Sum256(append([]byte(module.CodeHash+":"+invocation.Function+":"), invocation.Input...))
	fuelUsed := uint64(len(invocation.Input) + len(invocation.Function) + 1)
	if fuelUsed > invocation.Fuel {
		return Result{}, fmt.Errorf("out of fuel")
	}
	return Result{ModuleID: module.ID, Function: invocation.Function, Output: append([]byte(nil), invocation.Input...), FuelUsed: fuelUsed, Deterministic: true, StateRoot: hex.EncodeToString(state[:]), CompletedAt: time.Now().UTC()}, nil
}
