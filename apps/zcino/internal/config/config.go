package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Environment     string
	HTTPAddress     string
	Postgres        PostgresConfig
	Redis           RedisConfig
	Auth            AuthConfig
	RateLimit       RateLimitConfig
	CacheTTL        time.Duration
	ShutdownTimeout time.Duration
	Tracking        TrackingConfig
	NATS            NATSConfig
	Tenant          TenantConfig
}

type PostgresConfig struct {
	DSN             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
}

type RedisConfig struct {
	Address  string
	Password string
	DB       int
}

type AuthConfig struct {
	JWTSecret      string
	Issuer         string
	AccessTokenTTL time.Duration
	DemoAdminUser  string
	DemoAdminPass  string
}

type RateLimitConfig struct {
	RequestsPerMinute int
	Burst             int
}

type TrackingConfig struct {
	BatchSize     int
	FlushInterval time.Duration
	QueueSize     int
}

type NATSConfig struct {
	URL string
}

type TenantConfig struct {
	Required bool
}

func Load() (Config, error) {
	appEnv := getEnv("APP_ENV", "development")
	jwtSecret := getEnv("JWT_SECRET", "development-only-change-me")
	if appEnv != "development" && jwtSecret == "development-only-change-me" {
		return Config{}, fmt.Errorf("JWT_SECRET is required outside development")
	}
	accessTokenTTL, err := getEnvDuration("JWT_ACCESS_TOKEN_TTL", 24*time.Hour)
	if err != nil {
		return Config{}, fmt.Errorf("JWT_ACCESS_TOKEN_TTL: %w", err)
	}
	rateLimitRPM, err := getEnvInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 120)
	if err != nil {
		return Config{}, fmt.Errorf("RATE_LIMIT_REQUESTS_PER_MINUTE: %w", err)
	}
	rateLimitBurst, err := getEnvInt("RATE_LIMIT_BURST", 40)
	if err != nil {
		return Config{}, fmt.Errorf("RATE_LIMIT_BURST: %w", err)
	}
	postgresDSN := getEnv("POSTGRES_DSN", "postgres://postgres:postgres@localhost:5432/game_catalog?sslmode=disable")
	redisDB, err := getEnvInt("REDIS_DB", 0)
	if err != nil {
		return Config{}, fmt.Errorf("REDIS_DB: %w", err)
	}
	maxConns, err := getEnvInt("POSTGRES_MAX_CONNS", 10)
	if err != nil {
		return Config{}, fmt.Errorf("POSTGRES_MAX_CONNS: %w", err)
	}
	minConns, err := getEnvInt("POSTGRES_MIN_CONNS", 1)
	if err != nil {
		return Config{}, fmt.Errorf("POSTGRES_MIN_CONNS: %w", err)
	}
	cacheTTL, err := getEnvDuration("CACHE_TTL", 5*time.Minute)
	if err != nil {
		return Config{}, fmt.Errorf("CACHE_TTL: %w", err)
	}
	shutdownTimeout, err := getEnvDuration("SHUTDOWN_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, fmt.Errorf("SHUTDOWN_TIMEOUT: %w", err)
	}
	trackingBatchSize, err := getEnvInt("TRACKING_BATCH_SIZE", 100)
	if err != nil {
		return Config{}, fmt.Errorf("TRACKING_BATCH_SIZE: %w", err)
	}
	trackingQueueSize, err := getEnvInt("TRACKING_QUEUE_SIZE", 1000)
	if err != nil {
		return Config{}, fmt.Errorf("TRACKING_QUEUE_SIZE: %w", err)
	}
	trackingFlushInterval, err := getEnvDuration("TRACKING_FLUSH_INTERVAL", 5*time.Second)
	if err != nil {
		return Config{}, fmt.Errorf("TRACKING_FLUSH_INTERVAL: %w", err)
	}
	tenantRequired, err := getEnvBool("TENANT_REQUIRED", false)
	if err != nil {
		return Config{}, fmt.Errorf("TENANT_REQUIRED: %w", err)
	}

	return Config{
		Environment: appEnv,
		HTTPAddress: getEnv("HTTP_ADDRESS", ":8080"),
		Postgres: PostgresConfig{
			DSN:             postgresDSN,
			MaxConns:        int32(maxConns),
			MinConns:        int32(minConns),
			MaxConnLifetime: getEnvDurationOrDefault("POSTGRES_MAX_CONN_LIFETIME", time.Hour),
		},
		Redis: RedisConfig{
			Address:  getEnv("REDIS_ADDRESS", "localhost:6379"),
			Password: os.Getenv("REDIS_PASSWORD"),
			DB:       redisDB,
		},
		Auth: AuthConfig{
			JWTSecret:      jwtSecret,
			Issuer:         getEnv("JWT_ISSUER", "game-catalog-service"),
			AccessTokenTTL: accessTokenTTL,
			DemoAdminUser:  getEnv("DEMO_ADMIN_USER", "admin"),
			DemoAdminPass:  getEnv("DEMO_ADMIN_PASS", "admin"),
		},
		RateLimit: RateLimitConfig{
			RequestsPerMinute: rateLimitRPM,
			Burst:             rateLimitBurst,
		},
		CacheTTL:        cacheTTL,
		ShutdownTimeout: shutdownTimeout,
		Tracking: TrackingConfig{
			BatchSize:     trackingBatchSize,
			FlushInterval: trackingFlushInterval,
			QueueSize:     trackingQueueSize,
		},
		NATS: NATSConfig{
			URL: getEnv("NATS_URL", ""),
		},
		Tenant: TenantConfig{
			Required: tenantRequired,
		},
	}, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) (int, error) {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0, err
	}
	return parsed, nil
}

func getEnvDuration(key string, fallback time.Duration) (time.Duration, error) {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return 0, err
	}
	return parsed, nil
}

func getEnvDurationOrDefault(key string, fallback time.Duration) time.Duration {
	parsed, err := getEnvDuration(key, fallback)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) (bool, error) {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return false, err
	}
	return parsed, nil
}
