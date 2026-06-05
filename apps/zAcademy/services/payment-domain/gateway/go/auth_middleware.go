package gateway

import (
	"context"
	"errors"
	"net/http"
	"strings"
)

type claimsContextKey struct{}

func ClaimsFromContext(ctx context.Context) (Claims, bool) {
	claims, ok := ctx.Value(claimsContextKey{}).(Claims)
	return claims, ok
}

func AuthMiddleware(v JWTValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			claims, err := v.Validate(r.Context(), strings.TrimPrefix(h, "Bearer "))
			if err != nil {
				http.Error(w, "invalid_token", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), claimsContextKey{}, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

var ErrUnauthorized = errors.New("unauthorized")
