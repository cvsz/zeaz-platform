//go:build integration

package testhelper

import (
	"context"
	"fmt"
	"net"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	tcredis "github.com/testcontainers/testcontainers-go/modules/redis"
	"github.com/testcontainers/testcontainers-go/wait"
)

type IntegrationEnv struct {
	Postgres *pgxpool.Pool
	Redis    *redis.Client
}

var (
	envOnce  sync.Once
	env      *IntegrationEnv
	cleanup  func()
	startErr error
)

func MustStartContainers(ctx context.Context) (*IntegrationEnv, func()) {
	envOnce.Do(func() {
		env, cleanup, startErr = startContainers(ctx)
	})
	if startErr != nil {
		panic(fmt.Sprintf("start containers: %v", startErr))
	}
	return env, cleanup
}

func startContainers(ctx context.Context) (*IntegrationEnv, func(), error) {
	pgContainer, err := tcpostgres.RunContainer(ctx,
		testcontainers.WithImage("docker.io/postgres:16-alpine"),
		tcpostgres.WithDatabase("testdb"),
		tcpostgres.WithUsername("test"),
		tcpostgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithStartupTimeout(30*time.Second),
		),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("start postgres: %w", err)
	}

	redisContainer, err := tcredis.RunContainer(ctx,
		testcontainers.WithImage("docker.io/redis:7-alpine"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("* Ready to accept connections").
				WithStartupTimeout(30*time.Second),
		),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("start redis: %w", err)
	}

	pgConnStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return nil, nil, fmt.Errorf("postgres connection string: %w", err)
	}

	pool, err := pgxpool.New(ctx, pgConnStr)
	if err != nil {
		return nil, nil, fmt.Errorf("create pgx pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, nil, fmt.Errorf("ping postgres: %w", err)
	}

	if err := runMigrations(ctx, pool); err != nil {
		pool.Close()
		return nil, nil, fmt.Errorf("run migrations: %w", err)
	}

	redisHost, err := redisContainer.Host(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("redis host: %w", err)
	}
	redisPort, err := redisContainer.MappedPort(ctx, "6379/tcp")
	if err != nil {
		return nil, nil, fmt.Errorf("redis port: %w", err)
	}
	redisAddr := net.JoinHostPort(redisHost, redisPort.Port())

	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	if err := redisClient.Ping(ctx).Err(); err != nil {
		return nil, nil, fmt.Errorf("ping redis: %w", err)
	}

	integrationEnv := &IntegrationEnv{
		Postgres: pool,
		Redis:    redisClient,
	}

	cleanupFn := func() {
		_ = redisClient.Close()
		pool.Close()
		_ = pgContainer.Terminate(ctx)
		_ = redisContainer.Terminate(ctx)
	}

	return integrationEnv, cleanupFn, nil
}

func migrationsDir() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(filename), "..", "..", "migrations")
}
