package securitypolicy

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

type RuleSet struct {
	BannedModules map[string]string
	MinVersions   map[string]string
}

type Violation struct {
	Module string
	Reason string
}

func DefaultRuleSet() RuleSet {
	return RuleSet{
		BannedModules: map[string]string{
			"github.com/docker/docker": "Known vulnerable Docker SDK chain is prohibited",
		},
		MinVersions: map[string]string{
			"github.com/testcontainers/testcontainers-go": "v0.42.0",
			"go.opentelemetry.io/otel/sdk":             "v1.43.0",
		},
	}
}

func EvaluateModules(mods map[string]string, rules RuleSet) []Violation {
	violations := make([]Violation, 0)
	for module, reason := range rules.BannedModules {
		if _, exists := mods[module]; exists {
			violations = append(violations, Violation{Module: module, Reason: reason})
		}
	}
	for module, min := range rules.MinVersions {
		version, exists := mods[module]
		if !exists {
			violations = append(violations, Violation{Module: module, Reason: fmt.Sprintf("required module missing (minimum %s)", min)})
			continue
		}
		if compareSemver(version, min) < 0 {
			violations = append(violations, Violation{Module: module, Reason: fmt.Sprintf("version %s is below required minimum %s", version, min)})
		}
	}
	sort.Slice(violations, func(i, j int) bool {
		if violations[i].Module == violations[j].Module {
			return violations[i].Reason < violations[j].Reason
		}
		return violations[i].Module < violations[j].Module
	})
	return violations
}

func compareSemver(a, b string) int {
	aCore, aPre := splitSemver(strings.TrimPrefix(a, "v"))
	bCore, bPre := splitSemver(strings.TrimPrefix(b, "v"))
	aParts := parseCore(aCore)
	bParts := parseCore(bCore)
	for i := 0; i < 3; i++ {
		if aParts[i] < bParts[i] {
			return -1
		}
		if aParts[i] > bParts[i] {
			return 1
		}
	}
	if aPre == bPre {
		return 0
	}
	if aPre == "" && bPre != "" {
		return 1
	}
	if aPre != "" && bPre == "" {
		return -1
	}
	if aPre < bPre {
		return -1
	}
	if aPre > bPre {
		return 1
	}
	return 0
}

func splitSemver(v string) (string, string) {
	parts := strings.SplitN(v, "-", 2)
	if len(parts) == 1 {
		return parts[0], ""
	}
	return parts[0], parts[1]
}

func parseCore(core string) [3]int {
	parts := strings.Split(core, ".")
	out := [3]int{}
	for i := 0; i < len(parts) && i < 3; i++ {
		n, err := strconv.Atoi(parts[i])
		if err != nil {
			return out
		}
		out[i] = n
	}
	return out
}
