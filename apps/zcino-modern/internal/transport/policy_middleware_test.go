package transport

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"go.uber.org/zap/zaptest"
)

func TestPolicyGuardAllowsCatalogRequests(t *testing.T) {
	handler := policyGuard(zaptest.NewLogger(t))(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/games" {
			t.Fatalf("unexpected path %q", r.URL.Path)
		}
		w.WriteHeader(http.StatusNoContent)
	}))

	request := httptest.NewRequest(http.MethodGet, "/games?provider=Acme&category=slots", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, response.Code)
	}
}

func TestPolicyGuardBlocksProhibitedEndpointPaths(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		category string
	}{
		{name: "wallet", path: "/wallet/balance", category: "wallet_endpoint"},
		{name: "betting", path: "/sports-betting/bets", category: "betting_endpoint"},
		{name: "payment", path: "/payments/checkout", category: "payment_handling"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			handler := policyGuard(zaptest.NewLogger(t))(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				t.Fatal("next handler should not be called")
			}))

			request := httptest.NewRequest(http.MethodGet, test.path, nil)
			response := httptest.NewRecorder()

			handler.ServeHTTP(response, request)

			assertPolicyBlocked(t, response, test.category)
		})
	}
}

func TestPolicyGuardBlocksProhibitedRequestBody(t *testing.T) {
	handler := policyGuard(zaptest.NewLogger(t))(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("next handler should not be called")
	}))

	request := httptest.NewRequest(http.MethodPost, "/games", strings.NewReader(`{"metadata":{"payment":"card"}}`))
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	assertPolicyBlocked(t, response, "payment_handling")
}

func TestPolicyGuardRestoresAllowedRequestBody(t *testing.T) {
	handler := policyGuard(zaptest.NewLogger(t))(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]string
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("body was not restored: %v", err)
		}
		if payload["placement"] != "home_lobby" {
			t.Fatalf("unexpected body payload: %#v", payload)
		}
		w.WriteHeader(http.StatusAccepted)
	}))

	request := httptest.NewRequest(http.MethodPost, "/track/impression", strings.NewReader(`{"placement":"home_lobby"}`))
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusAccepted {
		t.Fatalf("expected status %d, got %d", http.StatusAccepted, response.Code)
	}
}

func assertPolicyBlocked(t *testing.T, response *httptest.ResponseRecorder, category string) {
	t.Helper()
	if response.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, response.Code)
	}

	var body policyBlockResponse
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode policy response: %v", err)
	}
	if body.Error != "policy_blocked" {
		t.Fatalf("expected policy_blocked error, got %q", body.Error)
	}
	if body.Category != category {
		t.Fatalf("expected category %q, got %q", category, body.Category)
	}
}
