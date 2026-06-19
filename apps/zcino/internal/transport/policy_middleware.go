package transport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"

	"go.uber.org/zap"
)

const maxPolicyInspectionBodyBytes = 1 << 20

var policyTokenPattern = regexp.MustCompile(`[a-z0-9]+`)

type prohibitedPolicy struct {
	Category string
	Tokens   map[string]struct{}
	Phrases  []string
}

var prohibitedPolicies = []prohibitedPolicy{
	{
		Category: "wallet_endpoint",
		Tokens: tokenSet(
			"wallet", "wallets", "balance", "balances", "cashier", "cashiers",
			"deposit", "deposits", "withdraw", "withdraws", "withdrawal", "withdrawals",
		),
	},
	{
		Category: "betting_endpoint",
		Tokens: tokenSet(
			"bet", "bets", "betting", "wager", "wagers", "wagering",
			"stake", "stakes", "staking", "odds", "parlay", "parlays",
		),
	},
	{
		Category: "payment_handling",
		Tokens: tokenSet(
			"payment", "payments", "pay", "pays", "paid", "payout", "payouts",
			"checkout", "checkouts", "invoice", "invoices", "billing", "billings",
			"iban", "swift", "cvv", "cvc", "cryptocurrency", "crypto",
			"refund", "refunds", "chargeback", "chargebacks",
		),
		Phrases: []string{
			"card number", "credit card", "debit card", "bank account",
			"routing number", "payment method", "payment token",
		},
	},
}

type policyBlockResponse struct {
	Error    string `json:"error"`
	Message  string `json:"message"`
	Category string `json:"category"`
}

func policyGuard(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			decision, err := inspectPolicy(r)
			if err != nil {
				log.Warn("policy inspection failed", zap.Error(err), zap.String("path", r.URL.Path))
				writePolicyBlock(w, "policy_inspection_failed", "request could not be inspected by policy middleware", "policy_inspection")
				return
			}
			if decision.Blocked {
				log.Warn("request blocked by policy middleware",
					zap.String("category", decision.Category),
					zap.String("match", decision.Match),
					zap.String("method", r.Method),
					zap.String("path", r.URL.Path),
				)
				writePolicyBlock(w, "policy_blocked", fmt.Sprintf("%s requests are not allowed", strings.ReplaceAll(decision.Category, "_", " ")), decision.Category)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

type policyDecision struct {
	Blocked  bool
	Category string
	Match    string
}

func inspectPolicy(r *http.Request) (policyDecision, error) {
	parts := []string{r.URL.Path, r.URL.RawQuery}
	for key, values := range r.Header {
		parts = append(parts, key)
		parts = append(parts, values...)
	}

	if r.Body != nil && shouldInspectBody(r.Method) {
		body, err := readAndRestoreBody(r)
		if err != nil {
			return policyDecision{}, err
		}
		parts = append(parts, string(body))
	}

	return evaluatePolicy(strings.Join(parts, " ")), nil
}

func shouldInspectBody(method string) bool {
	switch method {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return true
	default:
		return false
	}
}

func readAndRestoreBody(r *http.Request) ([]byte, error) {
	body, err := io.ReadAll(io.LimitReader(r.Body, maxPolicyInspectionBodyBytes+1))
	if err != nil {
		return nil, err
	}
	if err := r.Body.Close(); err != nil {
		return nil, err
	}
	if len(body) > maxPolicyInspectionBodyBytes {
		return nil, fmt.Errorf("request body exceeds %d policy inspection bytes", maxPolicyInspectionBodyBytes)
	}
	r.Body = io.NopCloser(bytes.NewReader(body))
	return body, nil
}

func evaluatePolicy(content string) policyDecision {
	normalized := strings.Join(policyTokenPattern.FindAllString(strings.ToLower(content), -1), " ")
	for _, policy := range prohibitedPolicies {
		for _, phrase := range policy.Phrases {
			if strings.Contains(normalized, phrase) {
				return policyDecision{Blocked: true, Category: policy.Category, Match: phrase}
			}
		}
	}

	for _, token := range strings.Fields(normalized) {
		for _, policy := range prohibitedPolicies {
			if _, blocked := policy.Tokens[token]; blocked {
				return policyDecision{Blocked: true, Category: policy.Category, Match: token}
			}
		}
	}
	return policyDecision{}
}

func tokenSet(tokens ...string) map[string]struct{} {
	set := make(map[string]struct{}, len(tokens))
	for _, token := range tokens {
		set[token] = struct{}{}
	}
	return set
}

func writePolicyBlock(w http.ResponseWriter, code, message, category string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	_ = json.NewEncoder(w).Encode(policyBlockResponse{
		Error:    code,
		Message:  message,
		Category: category,
	})
}
