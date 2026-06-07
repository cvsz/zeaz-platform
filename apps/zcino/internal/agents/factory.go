package agents

import (
	"fmt"
	"regexp"
	"strings"
)

const (
	KindOptimizer = "optimizer"
	KindSEO       = "seo"
	KindInfra     = "infra"
	KindAnomaly   = "anomaly"
)

var safeNamePattern = regexp.MustCompile(`[^a-z0-9_]+`)

type Agent struct {
	Name        string
	Kind        string
	Task        string
	PolicyScope string
}

type Factory struct {
	AllowedKinds map[string]bool
}

func NewFactory(allowedKinds map[string]bool) Factory {
	if allowedKinds == nil {
		allowedKinds = map[string]bool{KindOptimizer: true, KindSEO: true, KindInfra: true, KindAnomaly: true}
	}
	return Factory{AllowedKinds: allowedKinds}
}

func CreateAgent(task string) Agent {
	agent, _ := NewFactory(nil).Create(KindOptimizer, task)
	return agent
}

func (f Factory) Create(kind string, task string) (Agent, error) {
	kind = normalize(kind)
	task = strings.TrimSpace(task)
	if task == "" {
		return Agent{}, fmt.Errorf("task is required")
	}
	if !f.AllowedKinds[kind] {
		return Agent{}, fmt.Errorf("agent kind %q is not allowed", kind)
	}
	return Agent{Name: "agent_" + normalize(task), Kind: kind, Task: task, PolicyScope: kind + ":sandbox"}, nil
}

func normalize(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = safeNamePattern.ReplaceAllString(value, "_")
	value = strings.Trim(value, "_")
	if value == "" {
		return "default"
	}
	return value
}
