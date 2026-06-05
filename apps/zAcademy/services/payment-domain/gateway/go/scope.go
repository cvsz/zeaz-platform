package gateway

import "strings"

const (
	ScopePaymentRead   = "payment:read"
	ScopePaymentWrite  = "payment:write"
	ScopePaymentRefund = "payment:refund"
	ScopePaymentAdmin  = "payment:admin"
)

func HasScope(scopes []string, target string) bool {
	for _, s := range scopes {
		if s == target {
			return true
		}
	}
	return false
}

func NormalizeScopes(scopes []string) []string {
	out := make([]string, 0, len(scopes))
	seen := make(map[string]struct{}, len(scopes))
	for _, s := range scopes {
		s = strings.TrimSpace(strings.ToLower(s))
		if s == "" {
			continue
		}
		if _, ok := seen[s]; ok {
			continue
		}
		seen[s] = struct{}{}
		out = append(out, s)
	}
	return out
}
