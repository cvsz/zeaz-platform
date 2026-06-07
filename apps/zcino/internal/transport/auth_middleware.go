package transport

import (
	"encoding/json"
	"net/http"
	"strings"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/middleware"
)

func optionalAuth(tokens *auth.TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := strings.TrimSpace(r.Header.Get("Authorization"))
			if header == "" {
				next.ServeHTTP(w, r)
				return
			}
			claims, ok := authenticateBearer(header, tokens)
			if !ok {
				writeAuthError(w, http.StatusUnauthorized, "unauthorized", "invalid bearer token")
				return
			}
			if !tenantAuthorized(r, claims) {
				writeAuthError(w, http.StatusForbidden, "tenant_forbidden", "token tenant does not match request tenant")
				return
			}
			next.ServeHTTP(w, r.WithContext(auth.WithClaims(r.Context(), claims)))
		})
	}
}

func requireRole(tokens *auth.TokenManager, role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := authenticateBearer(strings.TrimSpace(r.Header.Get("Authorization")), tokens)
			if !ok {
				writeAuthError(w, http.StatusUnauthorized, "unauthorized", "missing or invalid bearer token")
				return
			}
			if !tenantAuthorized(r, claims) {
				writeAuthError(w, http.StatusForbidden, "tenant_forbidden", "token tenant does not match request tenant")
				return
			}
			if !auth.HasRole(claims, role) {
				writeAuthError(w, http.StatusForbidden, "forbidden", "insufficient role")
				return
			}
			next.ServeHTTP(w, r.WithContext(auth.WithClaims(r.Context(), claims)))
		})
	}
}

func authenticateBearer(header string, tokens *auth.TokenManager) (*auth.Claims, bool) {
	if header == "" || tokens == nil {
		return nil, false
	}
	parts := strings.Fields(header)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return nil, false
	}
	claims, err := tokens.Validate(parts[1])
	return claims, err == nil
}

func tenantAuthorized(r *http.Request, claims *auth.Claims) bool {
	if claims == nil || strings.TrimSpace(claims.TenantID) == "" {
		return true
	}
	requestTenant := strings.TrimSpace(middleware.TenantID(r.Context()))
	return requestTenant != "" && strings.EqualFold(claims.TenantID, requestTenant)
}

func writeAuthError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code, "message": message})
}
