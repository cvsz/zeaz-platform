package gateway

import "net/http"

func RBACMiddleware(matrix *PermissionMatrix, requiredScope string) func(http.Handler) http.Handler {
	requiredScope = NormalizeScopes([]string{requiredScope})[0]
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := ClaimsFromContext(r.Context())
			if !ok {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			if HasScope(claims.Scope, requiredScope) || matrix.Allows(claims.Roles, requiredScope) {
				next.ServeHTTP(w, r)
				return
			}
			http.Error(w, "insufficient_scope", http.StatusForbidden)
		})
	}
}
