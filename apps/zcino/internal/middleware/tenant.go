package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type tenantContextKey struct{}

const TenantHeader = "X-Tenant-ID"
const DefaultTenantID = "public"

func TenantMiddleware(required bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/healthz" || r.URL.Path == "/metrics" {
				next.ServeHTTP(w, r)
				return
			}
			tenantID := strings.TrimSpace(r.Header.Get(TenantHeader))
			if tenantID == "" {
				if required {
					writeTenantError(w, http.StatusBadRequest, "missing_tenant", "missing tenant")
					return
				}
				tenantID = DefaultTenantID
			}
			ctx := context.WithValue(r.Context(), tenantContextKey{}, tenantID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func TenantID(ctx context.Context) string {
	if tenantID, ok := ctx.Value(tenantContextKey{}).(string); ok && tenantID != "" {
		return tenantID
	}
	return DefaultTenantID
}

func writeTenantError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code, "message": message})
}
