package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/cache"
	"game-catalog-service/internal/config"
	"game-catalog-service/internal/database"
	"game-catalog-service/internal/eventbus"
	"game-catalog-service/internal/handler"
	"game-catalog-service/internal/logger"
	"game-catalog-service/internal/repository"
	"game-catalog-service/internal/service"
	"game-catalog-service/internal/transport"

	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "load config: %v\n", err)
		os.Exit(1)
	}

	log, err := logger.New(cfg.Environment)
	if err != nil {
		fmt.Fprintf(os.Stderr, "create logger: %v\n", err)
		os.Exit(1)
	}
	defer func() { _ = log.Sync() }()

	postgres, err := database.NewPostgresPool(ctx, cfg.Postgres)
	if err != nil {
		log.Fatal("connect postgres", zap.Error(err))
	}
	defer postgres.Close()

	redisClient, err := database.NewRedisClient(ctx, cfg.Redis)
	if err != nil {
		log.Fatal("connect redis", zap.Error(err))
	}
	defer func() { _ = redisClient.Close() }()

	validate := validator.New(validator.WithRequiredStructEnabled())
	tokenManager := auth.NewTokenManager(cfg.Auth.JWTSecret, cfg.Auth.Issuer, cfg.Auth.AccessTokenTTL)
	authHandler := handler.NewAuthHandler(tokenManager, cfg.Auth.DemoAdminUser, cfg.Auth.DemoAdminPass)
	gameRepo := repository.NewPostgresGameRepository(postgres)
	gameCache := cache.NewRedisGameCache(redisClient, cfg.CacheTTL)
	catalogService := service.NewCatalogService(gameRepo, gameCache, validate, log)
	catalogHandler := handler.NewCatalogHandler(catalogService, validate, log)
	clickPublisher := eventbus.Publisher(eventbus.NoopPublisher{})
	if cfg.NATS.URL != "" {
		natsPublisher, err := eventbus.NewNATSPublisher(cfg.NATS.URL)
		if err != nil {
			log.Fatal("connect nats", zap.Error(err))
		}
		defer natsPublisher.Close()
		clickPublisher = natsPublisher
	}

	trackingRepo := repository.NewPostgresTrackingRepository(postgres)
	trackingService := service.NewTrackingService(trackingRepo, service.TrackingServiceConfig{
		BatchSize:     cfg.Tracking.BatchSize,
		FlushInterval: cfg.Tracking.FlushInterval,
		QueueSize:     cfg.Tracking.QueueSize,
	}, log, clickPublisher)
	trackingService.Start(context.Background())
	trackingHandler := handler.NewTrackingHandler(trackingService, log)

	server := &http.Server{
		Addr:              cfg.HTTPAddress,
		Handler:           transport.NewRouter(catalogHandler, trackingHandler, authHandler, tokenManager, redisClient, log, cfg.Tenant.Required, cfg.RateLimit.RequestsPerMinute, cfg.RateLimit.Burst),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Info("http server listening", zap.String("address", cfg.HTTPAddress))
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("http server failed", zap.Error(err))
		}
	}()

	<-ctx.Done()
	log.Info("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", zap.Error(err))
	}
	if err := trackingService.Stop(shutdownCtx); err != nil {
		log.Error("tracking service shutdown failed", zap.Error(err))
	}
}
