package transport

import (
	"encoding/json"
	"net/http"
	"time"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/handler"
	"game-catalog-service/internal/metrics"
	"game-catalog-service/internal/middleware"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

func NewRouter(catalogHandler *handler.CatalogHandler, trackingHandler *handler.TrackingHandler, authHandler *handler.AuthHandler, tokens *auth.TokenManager, redisClient *redis.Client, log *zap.Logger, tenantRequired bool, rateLimitRequestsPerMinute, rateLimitBurst int) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	mux.Handle("GET /metrics", promhttp.Handler())
	mux.HandleFunc("GET /games", catalogHandler.ListGames)
	mux.HandleFunc("GET /games/{id}", catalogHandler.GetGame)
	mux.HandleFunc("GET /providers", catalogHandler.ListProviders)
	mux.HandleFunc("POST /auth/token", authHandler.Token)
	mux.Handle("GET /admin/whoami", requireRole(tokens, "admin")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, _ := auth.ClaimsFromContext(r.Context())
		writeAdminIdentity(w, claims)
	})))
	mux.HandleFunc("POST /track/impression", trackingHandler.TrackImpression)
	mux.HandleFunc("POST /track/click", trackingHandler.TrackClick)
	limiter := newRedisRateLimiter(redisClient, rateLimitRequestsPerMinute, rateLimitBurst)
	return requestLogger(log)(recoverer(policyGuard(log)(middleware.TenantMiddleware(tenantRequired)(limiter.middleware(mux))), log))
}

func requestLogger(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			started := time.Now()
			recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(recorder, r)
			metrics.Observe(r.URL.Path, r.Method, recorder.status, time.Since(started))
			log.Info("http request",
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path),
				zap.Int("status", recorder.status),
				zap.Duration("duration", time.Since(started)),
				zap.String("remote_addr", r.RemoteAddr),
			)
		})
	}
}

func recoverer(next http.Handler, log *zap.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Error("panic recovered", zap.Any("panic", recovered))
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

type adminIdentityResponse struct {
	UserID   string   `json:"user_id"`
	Roles    []string `json:"roles"`
	TenantID string   `json:"tenant_id,omitempty"`
}

func writeAdminIdentity(w http.ResponseWriter, claims *auth.Claims) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(adminIdentityResponse{
		UserID:   claims.UserID,
		Roles:    claims.Roles,
		TenantID: claims.TenantID,
	})
}
