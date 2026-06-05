package securitypolicy

import "testing"

func TestCompareSemver(t *testing.T) {
	cases := []struct {
		a, b string
		want int
	}{
		{"v1.43.0", "v1.43.0", 0},
		{"v1.44.0", "v1.43.0", 1},
		{"v1.42.9", "v1.43.0", -1},
		{"v0.42.1", "v0.42.0", 1},
		{"v0.41.9", "v0.42.0", -1},
	}
	for _, tc := range cases {
		got := compareSemver(tc.a, tc.b)
		if got != tc.want {
			t.Fatalf("compareSemver(%s,%s)=%d want %d", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestEvaluateModules(t *testing.T) {
	rules := DefaultRuleSet()
	mods := map[string]string{
		"github.com/docker/docker":                    "v25.0.5+incompatible",
		"github.com/testcontainers/testcontainers-go": "v0.41.0",
		"go.opentelemetry.io/otel/sdk":               "v1.43.0",
	}
	v := EvaluateModules(mods, rules)
	if len(v) != 2 {
		t.Fatalf("expected 2 violations, got %d: %+v", len(v), v)
	}
}

func TestEvaluateModulesNoViolations(t *testing.T) {
	rules := DefaultRuleSet()
	mods := map[string]string{
		"github.com/testcontainers/testcontainers-go": "v0.42.0",
		"go.opentelemetry.io/otel/sdk":               "v1.43.0",
	}
	v := EvaluateModules(mods, rules)
	if len(v) != 0 {
		t.Fatalf("expected no violations, got %+v", v)
	}
}
